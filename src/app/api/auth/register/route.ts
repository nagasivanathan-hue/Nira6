import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeEmail } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const { allowed, resetIn } = checkRateLimit(`register:${clientIp}`, {
      maxRequests: 5,
      windowMs: 60_000 * 5, // 5 requests per 5 minutes
    });

    if (!allowed) {
      return NextResponse.json(
        { message: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) },
        }
      );
    }
    const { name, email, password, role = 'user', phone } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ message: 'Invalid name' }, { status: 400 });
    }
    
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }
    
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    
    const sanitizedEmail = sanitizeEmail(email);

    try {
      await dbConnect();
      const userExists = await User.findOne({ email: sanitizedEmail });
      if (userExists) {
        return NextResponse.json({ message: 'User already exists' }, { status: 400 });
      }

      const user = await User.create({ name: name.trim(), email: sanitizedEmail, password, role, phone: phone || undefined });

      if (user) {
        return NextResponse.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id.toString()),
        }, { status: 201 });
      } else {
        return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
      }
    } catch (dbErr: any) {
      console.error("Database connection failed in register:", dbErr.message);
      return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
