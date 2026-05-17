import { NextResponse } from 'next/server';
import crypto from 'crypto';
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount
    } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = new Order({
        user: user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        totalAmount,
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      const createdOrder = await order.save();
      return NextResponse.json({ success: true, message: "Payment verified successfully", order: createdOrder });
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
