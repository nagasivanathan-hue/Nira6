import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { productId } = await req.json();
    
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const index = dbUser.wishlist.indexOf(productId);
    if (index === -1) {
      dbUser.wishlist.push(productId);
    } else {
      dbUser.wishlist.splice(index, 1);
    }

    await dbUser.save();
    return NextResponse.json(dbUser.wishlist);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
