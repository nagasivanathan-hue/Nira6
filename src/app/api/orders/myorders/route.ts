import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth/auth';
import '@/models/Product'; // Ensure Product model is registered for populate

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');
      
    return NextResponse.json(orders);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
