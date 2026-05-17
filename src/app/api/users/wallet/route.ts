import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const dbUser = await User.findById(user._id).select('walletBalance walletTransactions');
    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      walletBalance: dbUser.walletBalance || 0,
      walletTransactions: dbUser.walletTransactions || []
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { amount } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid deposit amount' }, { status: 400 });
    }

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    dbUser.walletBalance = (dbUser.walletBalance || 0) + Number(amount);
    
    // Add transaction history log
    dbUser.walletTransactions.push({
      type: 'credit',
      amount: Number(amount),
      description: 'Deposited funds via net banking/UPI',
      date: new Date(),
      status: 'completed'
    });

    await dbUser.save();

    return NextResponse.json({
      message: `Successfully deposited ₹${amount}!`,
      walletBalance: dbUser.walletBalance,
      walletTransactions: dbUser.walletTransactions
    }, { status: 200 });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
