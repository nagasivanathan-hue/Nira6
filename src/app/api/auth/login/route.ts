import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken, generateRefreshToken } from '@/lib/auth/auth';
import RefreshToken from '@/models/RefreshToken';
import { sanitizeEmail } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { logAdminActivity } from '@/lib/adminLogger';
import NotedEmail from '@/models/NotedEmail';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Unknown Device';

    // Rate limit: 10 login attempts per minute per IP
    const { allowed, resetIn } = checkRateLimit(`login:${clientIp}`, {
      maxRequests: 10,
      windowMs: 60_000,
    });

    if (!allowed) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) },
        }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    await dbConnect();

    // Check if the email is noted for Continue with Email
    const noted = await NotedEmail.findOne({ email: sanitizedEmail });
    if (!noted) {
      const userObj = await User.findOne({ email: sanitizedEmail });
      if (!userObj || !userObj.emailNotedForContinue) {
        return NextResponse.json({
          message: 'This email is not registered or did not complete manual registration. Please sign up and provide details manually first.'
        }, { status: 403 });
      }
    }

    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (user && user.lockoutUntil && user.lockoutUntil > new Date()) {
      const lockRemaining = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { message: `Account is temporarily locked due to repeated failures. Try again in ${lockRemaining} minute(s).` },
        { status: 403 }
      );
    }

    if (!user || !(await user.comparePassword(password))) {
      if (user) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockoutUntil = new Date(Date.now() + 15 * 60_000); // 15 mins
        }
        await user.save();

        if (user.email === 'nira6studio@gmail.com' || ['admin', 'super_admin'].includes(user.role)) {
          await logAdminActivity(
            user.email,
            'LOGIN_FAILED',
            `Failed password attempt. Attempts count: ${user.failedLoginAttempts}. IP: ${clientIp}`,
            req
          );
        }
      }

      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Reset lock on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.lastLoginIp = clientIp;
    user.lastLoginDevice = userAgent.slice(0, 255);
    user.lastLoginAt = new Date();
    await user.save();

    if (user.email === 'nira6studio@gmail.com' || ['admin', 'super_admin'].includes(user.role)) {
      await logAdminActivity(
        user.email,
        'LOGIN_SUCCESS',
        `Successfully logged into session. IP: ${clientIp}, Device: ${userAgent}`,
        req
      );
    }

    const accessToken = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminApprovedByOwner: user.adminApprovedByOwner,
      token: accessToken,
      refreshToken,
    });
  } catch (err) {
    const error = err as Error;
    console.error('Login error:', error.message);
    return NextResponse.json({ message: 'Authentication service unavailable. Please try again.' }, { status: 503 });
  }
}
