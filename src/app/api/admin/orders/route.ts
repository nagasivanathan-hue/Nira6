import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import '@/models/Product'; // Ensure Product model is registered
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('items.product')
      .populate({ path: 'user', model: User, select: 'name email' });

    return NextResponse.json(orders);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
