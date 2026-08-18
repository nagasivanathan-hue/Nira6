import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import NotedEmail from '@/models/NotedEmail';
import User from '@/models/User';
import { sanitizeEmail } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email is required', allowed: false }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    await dbConnect();

    // 1. Check NotedEmail collection
    const noted = await NotedEmail.findOne({ email: sanitizedEmail });
    if (noted) {
      return NextResponse.json({ allowed: true });
    }

    // 2. Check if User exists and has the flag
    const user = await User.findOne({ email: sanitizedEmail });
    if (user && user.emailNotedForContinue) {
      return NextResponse.json({ allowed: true });
    }

    return NextResponse.json({
      allowed: false,
      message: 'This email is not registered or did not complete manual registration. Please sign up and provide details manually first.'
    });
  } catch (err) {
    const error = err as Error;
    console.error('check-email error:', error.message);
    return NextResponse.json({ message: 'Internal server error', allowed: false }, { status: 500 });
  }
}
