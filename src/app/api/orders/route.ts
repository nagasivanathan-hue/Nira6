import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    // Check if auth header is valid, otherwise allow anonymous
    let user = null;
    try {
      user = await verifyAuth(req);
    } catch {
      // allow guest checkout to proceed
    }

    await dbConnect();
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      totalAmount,
      taxAmount,
      platformFee,
      discountAmount,
      couponApplied,
      isGuestCheckout,
      guestEmail,
      guestPhone
    } = await req.json();

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: 'No order items' }, { status: 400 });
    }

    if (!user && !isGuestCheckout) {
      return NextResponse.json({ message: 'Authorization required for member checkout' }, { status: 401 });
    }

    const order = new Order({
      user: user ? user._id : undefined,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      taxAmount: taxAmount || 0,
      platformFee: platformFee || 0,
      discountAmount: discountAmount || 0,
      couponApplied: couponApplied || '',
      guestEmail: isGuestCheckout ? guestEmail : undefined,
      guestPhone: isGuestCheckout ? guestPhone : undefined,
      paymentStatus: paymentMethod === 'wallet' ? 'completed' : 'pending',
      orderStatus: 'processing'
    });

    const createdOrder = await order.save();
    return NextResponse.json(createdOrder, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
