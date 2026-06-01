import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { reason } = await req.json();

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ message: 'Return reason is required' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Verify order owner
    if (!order.user || order.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Not authorized to modify this order' }, { status: 403 });
    }

    if (order.orderStatus === 'cancelled' || order.orderStatus === 'returned') {
      return NextResponse.json({ message: 'Order cannot be returned (already cancelled/returned)' }, { status: 400 });
    }

    // Update order status
    order.orderStatus = 'returned';
    order.paymentStatus = 'refunded';
    order.returnReason = String(reason).trim();
    await order.save();

    // Refund the amount to User's NIRA Wallet Balance
    const dbUser = await User.findById(user._id);
    if (dbUser) {
      const refundAmount = order.totalAmount;
      dbUser.walletBalance = (dbUser.walletBalance || 0) + refundAmount;
      
      // Add wallet credit transaction log
      dbUser.walletTransactions.push({
        type: 'credit',
        amount: refundAmount,
        description: `Full refund for returned Order #${order._id.toString().slice(-8).toUpperCase()}`,
        date: new Date(),
        status: 'completed'
      });
      await dbUser.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Return approved! Refund of ₹' + order.totalAmount.toLocaleString('en-IN') + ' has been credited to your NIRA Wallet.',
      order
    });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
