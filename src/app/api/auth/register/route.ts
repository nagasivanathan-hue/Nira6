import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      return NextResponse.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      }, { status: 201 });
    } else {
      return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
