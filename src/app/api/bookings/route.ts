import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();

    // Fetch bookings where user is either client or creator
    const bookings = await Booking.find({
      $or: [{ clientId: user._id }, { creatorId: user._id }]
    })
      .populate('clientId', 'name avatar email phone')
      .populate('creatorId', 'name avatar email phone')
      .sort({ date: -1 })
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
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    const {
      creatorId,
      packageName,
      eventType,
      description,
      price,
      date,
      timeSlot,
      location,
      totalAmount,
      advancePaid,
      notes
    } = data;

    if (!creatorId || !packageName || !price || !date || !timeSlot || !location) {
      return NextResponse.json({ message: 'Missing required booking parameters' }, { status: 400 });
    }

    const bookingDate = new Date(date);
    // Start of the day for date comparison
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    // Conflict prevention check: does creator have a booking on this date and timeSlot?
    const existingConflict = await Booking.findOne({
      creatorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingConflict) {
      return NextResponse.json({
        message: 'This time slot is already booked for the selected date. Please choose a different timing or date.'
      }, { status: 400 });
    }

    // Create the booking
    const booking = await Booking.create({
      clientId: user._id,
      creatorId,
      packageName,
      eventType,
      description,
      price: Number(price),
      date: startOfDay,
      timeSlot,
      location,
      totalAmount: Number(totalAmount || price),
      advancePaid: Number(advancePaid || 0),
      escrowStatus: 'held',
      notes,
      status: 'pending'
    });

    // Optional: deduct advancePaid from wallet balance if wallet payment used
    // (handled in payments module or wallet update)

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully!',
      booking
    }, { status: 201 });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
