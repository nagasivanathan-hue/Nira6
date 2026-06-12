import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import OrderAuditLog from '@/models/OrderAuditLog';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const isAdmin = ['admin', 'super_admin', 'order_manager', 'support_agent'].includes(user.role);
    const isOwner = order.user && order.user.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: 'Access denied: You are not authorized to view audit logs' }, { status: 403 });
    }

    const query: any = {
      $or: [
        { orderObjectId: order._id }
      ]
    };

    if (order.orderId) {
      query.$or.push({ orderId: order.orderId });
    }

    const auditLogs = await OrderAuditLog.find(query).sort({ timestamp: 1 });

    return NextResponse.json(auditLogs);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
