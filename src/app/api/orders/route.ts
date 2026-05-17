import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { orderItems, shippingAddress, paymentMethod, totalAmount } = await req.json();

    if (orderItems && orderItems.length === 0) {
      return NextResponse.json({ message: 'No order items' }, { status: 400 });
    } else {
      const order = new Order({
        user: user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        totalAmount,
        paymentStatus: 'pending'
      });

      const createdOrder = await order.save();
      return NextResponse.json(createdOrder, { status: 201 });
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
