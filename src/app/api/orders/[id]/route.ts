import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Delivery from '@/models/Delivery';
import Warehouse from '@/models/Warehouse';
import '@/models/Product'; // Ensure Product schema is registered
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Fetch order with products and warehouse details populated
    const order = await Order.findById(id)
      .populate('items.product')
      .populate({ path: 'warehouse', model: Warehouse });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Try to find if there is a corresponding delivery
    const delivery = await Delivery.findOne({ order: order._id });

    return NextResponse.json({
      order,
      delivery: delivery || null
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
