import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db/mongodb';
import RefreshToken from '@/models/RefreshToken';
import User from '@/models/User';
import { generateToken, generateRefreshToken } from '@/lib/auth/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET environment variable must be set and be at least 32 characters long.');
  }
  return secret;
};

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    // Rate limit: 20 refresh attempts per minute per IP
    const { allowed, resetIn } = checkRateLimit(`token-refresh:${clientIp}`, {
      maxRequests: 20,
      windowMs: 60_000,
    });

    if (!allowed) {
      return NextResponse.json(
        { message: 'Too many refresh requests. Please wait.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Verify token signature and claims
    let decoded: string | jwt.JwtPayload | null = null;
    try {
      decoded = jwt.verify(refreshToken, getJwtSecret());
    } catch {
      return NextResponse.json({ message: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const payload = decoded as jwt.JwtPayload & { id?: string; type?: string };
    if (!payload || typeof payload !== 'object' || payload.type !== 'refresh' || !payload.id) {
      return NextResponse.json({ message: 'Invalid refresh token payload' }, { status: 401 });
    }

    // 2. Validate token in database
    const tokenRecord = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      // If expired or not found, cleanup just in case
      if (tokenRecord) {
        await RefreshToken.deleteOne({ _id: tokenRecord._id });
      }
      return NextResponse.json({ message: 'Refresh token expired or revoked' }, { status: 401 });
    }

    // 3. Find User
    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    // 4. Token rotation: delete old token, generate new access + refresh tokens
    await RefreshToken.deleteOne({ _id: tokenRecord._id });

    const newAccessToken = generateToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return NextResponse.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    const error = err as Error;
    console.error('[Token Refresh Error]:', error.message);
    return NextResponse.json({ message: 'Unable to refresh session.' }, { status: 500 });
  }
}
