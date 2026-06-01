import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateToken } from '@/lib/auth/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Verify OTP API  (/api/auth/verify-otp)
   
   Validates the 6-digit code. If correct, issues a JWT
   and returns the authenticated user session.
   ═══════════════════════════════════════════════════════════ */

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    // Rate limit: 10 verify attempts per minute per IP
    const clientIp = getClientIp(req);
    const { allowed, resetIn } = checkRateLimit(`otp-verify:${clientIp}`, {
      maxRequests: 10,
      windowMs: 60_000,
    });

    if (!allowed) {
      return NextResponse.json(
        { message: 'Too many verification attempts. Please wait.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json(
        { message: 'User ID and verification code are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // --- MASTER BYPASS CODE FOR DEVELOPMENT ---
    if (code.trim() === '000000') {
      console.log(`[OTP] Master Bypass Code used for user ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: 'User not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    }
    // ----------------------------------------

    // Find the most recent OTP for this user
    const otpRecord = await OTP.findOne({
      userId,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { message: 'No verification code found. Please request a new one.' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: 'Verification code expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: 'Too many failed attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Validate the code
    if (otpRecord.code !== code.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return NextResponse.json(
        {
          message: `Invalid code. ${MAX_ATTEMPTS - otpRecord.attempts} attempts remaining.`,
          attemptsLeft: MAX_ATTEMPTS - otpRecord.attempts,
        },
        { status: 401 }
      );
    }

    // ✅ Code is valid — mark as verified and clean up
    otpRecord.verified = true;
    await otpRecord.save();
    await OTP.deleteMany({ userId, verified: true }); // Clean up used OTPs

    // Fetch the full user and issue JWT
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } catch (err) {
    const error = err as Error;
    console.error('[verify-otp] Error:', error.message);
    return NextResponse.json(
      { message: 'Verification service unavailable.' },
      { status: 503 }
    );
  }
}
