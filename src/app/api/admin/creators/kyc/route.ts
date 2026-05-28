import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const pendingCreators = await CreatorProfile.find({ verified: false })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pendingCreators);
  } catch (err) {
    return NextResponse.json({ message: 'Error fetching KYC' }, { status: 500 });
  }
}
