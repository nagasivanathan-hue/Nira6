import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { verifyAuth } from '@/lib/auth/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { status } = await req.json();
    const { id } = await params;

    if (!['confirmed', 'cancelled', 'completed', 'in_progress'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Only the creator or client can modify
    if (booking.creatorId.toString() !== user._id.toString() && booking.clientId.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Not authorized to modify this booking' }, { status: 403 });
    }

    booking.status = status;

    if (status === 'cancelled') {
      booking.escrowStatus = 'refunded';
    } else if (status === 'completed') {
      booking.escrowStatus = 'disbursed';
    }

    await booking.save();

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
