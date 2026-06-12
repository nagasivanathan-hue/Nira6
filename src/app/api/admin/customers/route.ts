import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { verifyAdmin } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    // Find users who are customers
    const userQuery: any = { role: { $in: ['user', 'customer', 'creator'] } };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(userQuery).select('-password').lean();

    // Enrich with order summary metrics (total spending, orders list, active/inactive flag)
    const enrichedCustomers = await Promise.all(
      customers.map(async (c: any) => {
        const orders = await Order.find({ user: c._id }).lean();
        const totalSpent = orders
          .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          ...c,
          ordersCount: orders.length,
          totalSpent,
          averageOrderValue: orders.length > 0 ? Math.round(totalSpent / orders.length) : 0,
          lastOrderDate: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
          recentOrders: orders.slice(-3) // return last 3 orders
        };
      })
    );

    // Sort by total spent descending
    enrichedCustomers.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json(enrichedCustomers);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Support manual permission toggle by owner (approving staff accounts to access dashboard)
export async function PUT(req: Request) {
  try {
    const user = await verifyAdmin(req);
    // Strict ownership verification: ONLY nira6studio@gmail.com can grant/revoke staff permission
    if (!user || user.email !== 'nira6studio@gmail.com') {
      return NextResponse.json({ message: 'Forbidden. Owner approval required.' }, { status: 403 });
    }

    await dbConnect();
    const { targetUserId, action } = await req.json(); // action: 'approve_admin' | 'revoke_admin'

    if (!targetUserId || !action) {
      return NextResponse.json({ message: 'Target user ID and action are required' }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }

    if (action === 'approve_admin') {
      targetUser.role = 'admin';
      targetUser.adminApprovedByOwner = true;
    } else if (action === 'revoke_admin') {
      targetUser.role = 'user';
      targetUser.adminApprovedByOwner = false;
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: `User permissions updated. Role is now: ${targetUser.role}`,
      user: {
        _id: targetUser._id,
        email: targetUser.email,
        role: targetUser.role,
        adminApprovedByOwner: targetUser.adminApprovedByOwner
      }
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
