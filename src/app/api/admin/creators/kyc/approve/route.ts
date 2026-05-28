import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { creatorId, action } = await req.json(); // action: 'approve' or 'reject'
    
    await dbConnect();
    if (action === 'approve') {
      await CreatorProfile.findByIdAndUpdate(creatorId, { 
        verified: true, 
        verificationLevel: 'id_verified' 
      });
    } else {
      // Logic to notify user of rejection could go here
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: 'Error updating KYC' }, { status: 500 });
  }
}
