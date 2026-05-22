import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();

    interface UserWalletDoc {
      _id: mongoose.Types.ObjectId;
      walletBalance: number;
      walletTransactions: {
        type: 'credit' | 'debit';
        amount: number;
        description: string;
        date: Date;
        status: string;
      }[];
    }

    const dbUser = await User.findById(user._id).select('walletBalance walletTransactions').lean() as unknown as UserWalletDoc | null;

    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      walletBalance: dbUser.walletBalance || 0,
      transactions: dbUser.walletTransactions || []
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
    const { action, amount, description } = await req.json();

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const numericAmount = Number(amount);

    // If amount is negative, or action is debit/purchase, perform a debit
    if (numericAmount < 0 || action === 'debit' || action === 'purchase') {
      const debitAmount = Math.abs(numericAmount);
      if ((dbUser.walletBalance || 0) < debitAmount) {
        return NextResponse.json({ message: 'Insufficient wallet balance for purchase' }, { status: 400 });
      }

      dbUser.walletBalance -= debitAmount;
      dbUser.walletTransactions.push({
        type: 'debit',
        amount: debitAmount,
        description: description || 'Purchase payment',
        date: new Date(),
        status: 'completed'
      });
      await dbUser.save();

      return NextResponse.json({
        success: true,
        message: 'Wallet payment deducted successfully!',
        walletBalance: dbUser.walletBalance,
        transactions: dbUser.walletTransactions
      });
    }

    if (numericAmount <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than zero' }, { status: 400 });
    }

    if (action === 'deposit') {
      // Credit wallet
      dbUser.walletBalance = (dbUser.walletBalance || 0) + numericAmount;
      dbUser.walletTransactions.push({
        type: 'credit',
        amount: numericAmount,
        description: description || 'Deposit into wallet',
        date: new Date(),
        status: 'completed'
      });
      await dbUser.save();
      return NextResponse.json({
        success: true,
        message: 'Deposited successfully!',
        walletBalance: dbUser.walletBalance,
        transactions: dbUser.walletTransactions
      });
    }

    if (action === 'withdraw') {
      // Debit wallet (pending approval)
      if ((dbUser.walletBalance || 0) < numericAmount) {
        return NextResponse.json({ message: 'Insufficient wallet balance for withdrawal' }, { status: 400 });
      }

      dbUser.walletBalance -= numericAmount;
      dbUser.walletTransactions.push({
        type: 'debit',
        amount: numericAmount,
        description: description || 'Withdrawal request processed',
        date: new Date(),
        status: 'pending'
      });
      await dbUser.save();
      return NextResponse.json({
        success: true,
        message: 'Withdrawal request submitted successfully!',
        walletBalance: dbUser.walletBalance,
        transactions: dbUser.walletTransactions
      });
    }

    return NextResponse.json({ message: 'Invalid action parameter' }, { status: 400 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
