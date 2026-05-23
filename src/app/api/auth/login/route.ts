import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/auth';
import { sanitizeEmail } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    // Rate limit: 10 login attempts per minute per IP
    const clientIp = getClientIp(req);
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
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (err) {
    const error = err as Error;
    console.error('Login error:', error.message);
    return NextResponse.json({ message: 'Authentication service unavailable. Please try again.' }, { status: 503 });
  }
}
