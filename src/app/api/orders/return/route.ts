import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import ReturnRequest from '@/models/ReturnRequest';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth/auth';
import { logOrderAudit } from '@/lib/orderUtils';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();
    const { orderObjectId, reason, photos, refundMethod } = await req.json();

    const order = await Order.findById(orderObjectId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Verify ownership
    if (!order.user || order.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Access denied: You do not own this order' }, { status: 403 });
    }

    // Verify order status
    if (order.orderStatus !== 'delivered') {
      return NextResponse.json({ message: 'Only delivered orders can be returned' }, { status: 400 });
    }

    // Check if return request already exists
    const existingReturn = await ReturnRequest.findOne({ order: order._id });
    if (existingReturn) {
      return NextResponse.json({ message: 'Return request already submitted for this order' }, { status: 400 });
    }

    const returnRequest = new ReturnRequest({
      order: order._id,
      orderId: order.orderId || `order-${order._id}`,
      user: user._id,
      reason,
      photos: photos || [],
      status: 'pending_approval',
      refundAmount: order.totalAmount,
      refundMethod: refundMethod || 'wallet',
      timeline: [{
        status: 'pending_approval',
        description: 'Return request submitted by customer. Awaiting admin moderation.',
        timestamp: new Date()
      }]
    });

    const savedReturn = await returnRequest.save();

    // Update order status
    order.orderStatus = 'return_requested';
    order.trackingUpdates.push({
      status: 'return_requested',
      description: 'Customer return request submitted. Awaiting inspection approval.',
      location: order.shippingAddress?.city || 'Customer Location',
      timestamp: new Date()
    });
    await order.save();

    // Log Audit Trail
    await logOrderAudit({
      orderId: order.orderId || `order-${order._id}`,
      orderObjectId: order._id.toString(),
      eventName: 'return_initiated',
      notes: `Return request submitted by customer. Reason: ${reason}. Refund method: ${refundMethod}`,
      operator: user.name,
      role: user.role
    });

    // Create system notification
    await Notification.create({
      user: user._id,
      type: 'push',
      title: '↩️ Return Requested',
      content: `Your return request for order #${(order.orderId || order._id.toString()).slice(-8).toUpperCase()} has been submitted successfully.`
    });

    return NextResponse.json({
      success: true,
      message: 'Return request created successfully',
      returnRequest: savedReturn
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
