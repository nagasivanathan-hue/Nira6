import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    try {
      await dbConnect();
      const user = await User.findOne({ email });

      if (user && (await user.comparePassword(password))) {
        return NextResponse.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id.toString()),
        });
      }
    } catch (dbErr: any) {
      console.warn("Database connection failed in login, trying mock fallback:", dbErr.message);
    }

    // Fallback to mock users if database is down or credentials match mock
    const mockUsers: Record<string, { id: string, name: string }> = {
      'client@nira.com': { id: 'mock_client_id', name: 'Client User' },
      'creator@nira.com': { id: 'mock_creator_id', name: 'Creator User' },
      'admin@nira.com': { id: 'mock_admin_id', name: 'Admin User' }
    };

    if (mockUsers[email] && password === 'password123') {
      const mockUser = mockUsers[email];
      return NextResponse.json({
        _id: mockUser.id,
        name: mockUser.name,
        email: email,
        token: generateToken(mockUser.id),
      });
    }

    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
