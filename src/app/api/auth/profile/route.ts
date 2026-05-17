import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    
    if (user) {
      return NextResponse.json(user);
    } else {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
