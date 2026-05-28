import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    await dbConnect();

    // Query notifications. If authenticated, fetch user specific + anonymous ones. Otherwise fetch only anonymous ones.
    const query: any = {};
    if (user) {
      query.$or = [
        { user: user._id },
        { user: { $exists: false } }
      ];
    } else {
      query.user = { $exists: false };
    }

    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(30);

    return NextResponse.json(notifications);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    await dbConnect();

    const { action, id } = await req.json();

    if (action === 'mark_read') {
      if (id) {
        await Notification.findByIdAndUpdate(id, { read: true });
      } else if (user) {
        // Mark all read for this user
        await Notification.updateMany({ user: user._id, read: false }, { read: true });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
