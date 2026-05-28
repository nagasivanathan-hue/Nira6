import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Inventory from '@/models/Inventory';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();

    // Fetch all orders
    const orders = await Order.find({});
    
    // Calculations
    const totalOrders = orders.length;
    
    const completedOrders = orders.filter(o => 
      ['confirmed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(o.orderStatus)
    );
    
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / completedOrders.length || 0) : 0;
    
    const returnedOrders = orders.filter(o => ['returned', 'refund_initiated', 'refund_completed'].includes(o.orderStatus));
    const returnRate = totalOrders > 0 ? Number(((returnedOrders.length / totalOrders) * 100).toFixed(1)) : 0;

    // Order status groupings
    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      packed: 0,
      shipped: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    };

    orders.forEach(o => {
      let status = o.orderStatus;
      if (['refund_initiated', 'refund_completed'].includes(status)) {
        status = 'returned';
      }
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts[status] = 1;
      }
    });

    // Inventory metrics
    const inventory = await Inventory.find({});
    const lowStockAlerts = inventory.filter(inv => inv.stockLevel <= inv.lowStockThreshold).length;
    const totalSKUs = inventory.length;

    // Daily Sales Chart Data for the last 7 days
    const dailySales: Record<string, { date: string; sales: number; ordersCount: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dailySales[key] = { date: key, sales: 0, ordersCount: 0 };
    }

    orders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (dailySales[key]) {
        dailySales[key].ordersCount++;
        if (['confirmed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(o.orderStatus)) {
          dailySales[key].sales += o.totalAmount;
        }
      }
    });

    const chartData = Object.values(dailySales);

    // Recent activities (last 5 status changes or orders)
    const recentActivities = orders
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(o => {
        let title = `Order #${o._id.toString().slice(-8).toUpperCase()} updated`;
        let description = `Status transitioned to ${o.orderStatus}`;
        if (o.createdAt.toString() === o.updatedAt.toString()) {
          title = `New order placed`;
          description = `Order #${o._id.toString().slice(-8).toUpperCase()} created for ₹${o.totalAmount.toLocaleString('en-IN')}`;
        }
        return {
          id: o._id,
          title,
          description,
          timestamp: o.updatedAt
        };
      });

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        returnRate,
        lowStockAlerts,
        totalSKUs
      },
      statusCounts,
      chartData,
      recentActivities
    });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
