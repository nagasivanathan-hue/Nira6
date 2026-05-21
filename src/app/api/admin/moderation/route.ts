import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    await dbConnect();

    // Fetch bookings in dispute or pending refund (or just all bookings to manage in admin panel)
    const bookings = await Booking.find({})
      .populate('clientId', 'name email avatar')
      .populate('creatorId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(bookings);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    await dbConnect();
    const { bookingId, resolution } = await req.json(); // resolution: 'refund' | 'disburse'

    if (!bookingId || !resolution) {
      return NextResponse.json({ message: 'Booking ID and resolution are required' }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    if (booking.escrowStatus !== 'held') {
      return NextResponse.json({ message: 'Escrow payment already settled' }, { status: 400 });
    }

    const amount = booking.advancePaid || 0;

    if (resolution === 'refund') {
      // 1. Update Booking status
      booking.status = 'cancelled';
      booking.escrowStatus = 'refunded';
      await booking.save();

      // 2. Refund client wallet
      const client = await User.findById(booking.clientId);
      if (client) {
        client.walletBalance = (client.walletBalance || 0) + amount;
        client.walletTransactions.push({
          type: 'credit',
          amount,
          description: `Dispute Refund for Booking #${booking._id.toString().slice(-6).toUpperCase()}`,
          date: new Date(),
          status: 'completed'
        });
        await client.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Escrow amount successfully refunded to client wallet.',
        booking
      });
    }

    if (resolution === 'disburse') {
      // 1. Update Booking status
      booking.status = 'completed';
      booking.escrowStatus = 'disbursed';
      await booking.save();

      // 2. Pay creator wallet
      const creator = await User.findById(booking.creatorId);
      if (creator) {
        creator.walletBalance = (creator.walletBalance || 0) + amount;
        creator.walletTransactions.push({
          type: 'credit',
          amount,
          description: `Dispute Disbursal for Booking #${booking._id.toString().slice(-6).toUpperCase()}`,
          date: new Date(),
          status: 'completed'
        });
        await creator.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Escrow amount successfully disbursed to creator wallet.',
        booking
      });
    }

    return NextResponse.json({ message: 'Invalid resolution parameter. Use refund or disburse.' }, { status: 400 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
