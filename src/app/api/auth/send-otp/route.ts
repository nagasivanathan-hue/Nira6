import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, sendEmailOTP, sendSmsOTP } from '@/lib/otp';
import { sanitizeEmail } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Send OTP API  (/api/auth/send-otp)
   
   Called AFTER password validation succeeds.
   Generates a 6-digit code, stores it, and sends via
   email (Resend) and optionally SMS (Twilio).
   ═══════════════════════════════════════════════════════════ */

export async function POST(req: Request) {
  try {
    // Rate limit: 5 OTP requests per minute per IP
    const clientIp = getClientIp(req);
    const { allowed, resetIn } = checkRateLimit(`otp-send:${clientIp}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });

    if (!allowed) {
      return NextResponse.json(
        { message: 'Too many OTP requests. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);
    await dbConnect();

    // Verify password first
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Invalidate any existing OTPs for this user
    await OTP.deleteMany({ userId: user._id });

    // Generate and store new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Send via Email
    const emailSent = await sendEmailOTP(sanitizedEmail, code, user.name);

    // Attempt SMS if phone exists
    let smsSent = false;
    if (user.phone) {
      smsSent = await sendSmsOTP(user.phone, code);
    }

    if (!emailSent && !smsSent) {
      return NextResponse.json(
        { message: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    // Store OTP in database (single code for both channels)
    await OTP.create({
      userId: user._id,
      code,
      channel: emailSent ? 'email' : 'sms',
      destination: sanitizedEmail,
      expiresAt,
    });

    // Build response showing where OTP was sent
    const sentTo: string[] = [];
    if (emailSent) {
      const maskedEmail = sanitizedEmail.replace(
        /(.{2}).+(@.+)/,
        '$1***$2'
      );
      sentTo.push(maskedEmail);
    }
    if (smsSent && user.phone) {
      const maskedPhone = user.phone.replace(/.(?=.{4})/g, '*');
      sentTo.push(maskedPhone);
    }

    return NextResponse.json({
      requiresOTP: true,
      userId: user._id,
      sentTo,
      message: `Verification code sent to ${sentTo.join(' and ')}.`,
    });
  } catch (err) {
    const error = err as Error;
    console.error('[send-otp] Error:', error.message);
    return NextResponse.json(
      { message: 'OTP service unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
