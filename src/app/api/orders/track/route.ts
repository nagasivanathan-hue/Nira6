import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Delivery from '@/models/Delivery';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { trackingId, verification } = await req.json();

    if (!trackingId || !verification) {
      return NextResponse.json({ message: 'Both Tracking ID/Order ID and Email/Phone verification are required.' }, { status: 400 });
    }

    const cleanTrackingId = trackingId.trim();
    const cleanVerification = verification.trim().toLowerCase();

    // Query order by Order ID, AWB (trackingNumber), or database _id
    const query: any = {
      $or: [
        { orderId: cleanTrackingId },
        { trackingNumber: cleanTrackingId }
      ]
    };

    // If cleanTrackingId is a valid MongoDB ObjectId, we can check by _id too
    if (cleanTrackingId.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: cleanTrackingId });
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!order) {
      return NextResponse.json({ message: 'No active order found matching the provided tracking reference.' }, { status: 404 });
    }

    // Verify ownership/guest authorization (via email or phone number)
    const orderUser = order.user as any;
    const matchEmail = (order.guestEmail || orderUser?.email || '').toLowerCase();
    const matchPhone = (order.guestPhone || order.shippingAddress?.phone || orderUser?.phone || '').toLowerCase();

    const isVerified = (matchEmail === cleanVerification) || (matchPhone === cleanVerification);

    if (!isVerified) {
      return NextResponse.json({ message: 'Verification details do not match the order records.' }, { status: 403 });
    }

    // Load delivery logs if they exist
    const delivery = await Delivery.findOne({ order: order._id });

    return NextResponse.json({
      success: true,
      order,
      delivery
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
