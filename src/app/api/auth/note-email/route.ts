import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import NotedEmail from '@/models/NotedEmail';
import User from '@/models/User';
import { sanitizeEmail } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing email' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    await dbConnect();

    // 1. Add to NotedEmail collection if it doesn't exist
    const existing = await NotedEmail.findOne({ email: sanitizedEmail });
    if (!existing) {
      await NotedEmail.create({ email: sanitizedEmail });
    }

    // 2. Also flag the User document if it exists
    await User.findOneAndUpdate(
      { email: sanitizedEmail },
      { emailNotedForContinue: true }
    );

    return NextResponse.json({ message: 'Email noted successfully', email: sanitizedEmail });
  } catch (err) {
    const error = err as Error;
    console.error('note-email error:', error.message);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
