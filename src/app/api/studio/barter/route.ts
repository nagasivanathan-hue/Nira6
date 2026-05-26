import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import BarterListing from '@/models/BarterListing';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Barter Exchange Board API  (/api/studio/barter)
   GET: List active barter listings
   POST: Create a new barter listing
   PATCH: Update status (accept / counter / expire)
   ═══════════════════════════════════════════════════════════ */

const FALLBACK_BARTERS = [
  {
    _id: 'bart-1', id: 'bart-1',
    creatorName: 'Rahul Mehra',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    creatorRating: 4.9,
    offeredService: '10 Hours of Professional Video Color Grading (DaVinci Resolve Studio)',
    requestedGear: 'Sony FX3 Full-Frame Cinema Camera Body',
    duration: '3 Days Weekend Rental',
    status: 'active',
    counterProposal: '',
  },
  {
    _id: 'bart-2', id: 'bart-2',
    creatorName: 'Sonia Kapoor',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    creatorRating: 4.8,
    offeredService: 'High-End Wedding Album Retouching & Color Grading (50 Photos)',
    requestedGear: 'DJI Mavic 3 Pro Cine Drone Combo',
    duration: '2 Days Saturday-Sunday Rental',
    status: 'active',
    counterProposal: '',
  },
  {
    _id: 'bart-3', id: 'bart-3',
    creatorName: 'Karan Parikh',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    creatorRating: 4.7,
    offeredService: 'Cinematic Sound Design & Stereo Mixing for Short Films',
    requestedGear: 'Aputure LS 600d Pro + Light Dome II Kit',
    duration: '4 Days Shoot Rental',
    status: 'active',
    counterProposal: '',
  },
];

export async function GET() {
  try {
    let listings;
    try {
      await dbConnect();
      listings = await BarterListing.find({ status: { $in: ['active', 'countered'] } })
        .sort({ createdAt: -1 })
        .lean();
    } catch (dbErr) {
      console.warn('[api/studio/barter] DB unavailable, using fallback:', dbErr);
      listings = FALLBACK_BARTERS;
    }

    if (!listings || listings.length === 0) {
      listings = FALLBACK_BARTERS;
    }

    return NextResponse.json(listings, { status: 200 });
  } catch (err) {
    console.error('[api/studio/barter] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch barter listings.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.creatorName || !body.offeredService || !body.requestedGear || !body.duration) {
      return NextResponse.json(
        { error: 'Missing required fields: creatorName, offeredService, requestedGear, duration.' },
        { status: 400 }
      );
    }

    const listing = await BarterListing.create({
      ...body,
      status: 'active',
    });
    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error('[api/studio/barter] POST error:', err);
    return NextResponse.json({ error: 'Failed to create barter listing.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, status, counterProposal } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status.' },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { status };
    if (counterProposal) {
      update.counterProposal = counterProposal;
    }

    const listing = await BarterListing.findByIdAndUpdate(id, update, { new: true }).lean();

    if (!listing) {
      return NextResponse.json({ error: 'Barter listing not found.' }, { status: 404 });
    }

    return NextResponse.json(listing, { status: 200 });
  } catch (err) {
    console.error('[api/studio/barter] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update barter listing.' }, { status: 500 });
  }
}
