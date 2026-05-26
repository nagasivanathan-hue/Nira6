import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import StudioGear from '@/models/StudioGear';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Studio Gear Inventory API  (/api/studio/gear)
   GET: List gear (optional ?category= filter)
   POST: Add new gear to inventory
   ═══════════════════════════════════════════════════════════ */

const FALLBACK_GEAR = [
  { _id: 'cam-fx3', id: 'cam-fx3', name: 'Sony FX3 Cinema Camera', category: 'camera', image: '/assets/product-camera.png', buyPrice: 295000, rentRate: 2500, brand: 'Sony' },
  { _id: 'cam-a7iv', id: 'cam-a7iv', name: 'Sony Alpha 7 IV Mirrorless', category: 'camera', image: '/assets/product-camera.png', buyPrice: 198000, rentRate: 1600, brand: 'Sony' },
  { _id: 'lens-85gm', id: 'lens-85gm', name: 'Sony FE 85mm f/1.4 GM', category: 'lens', image: '/assets/product-lens.png', buyPrice: 145000, rentRate: 1100, brand: 'Sony' },
  { _id: 'lens-2470gm', id: 'lens-2470gm', name: 'Sony FE 24-70mm f/2.8 GM II', category: 'lens', image: '/assets/product-lens.png', buyPrice: 199000, rentRate: 1400, brand: 'Sony' },
  { _id: 'light-godox', id: 'light-godox', name: 'Godox SZ150R Zoom RGB LED', category: 'lighting', image: '/assets/product-drone.png', buyPrice: 48000, rentRate: 500, brand: 'Godox' },
  { _id: 'light-aputure', id: 'light-aputure', name: 'Aputure LS 600d Pro Light', category: 'lighting', image: '/assets/product-drone.png', buyPrice: 185000, rentRate: 1800, brand: 'Aputure' },
  { _id: 'audio-rodewp', id: 'audio-rodewp', name: 'Rode Wireless PRO Mic System', category: 'audio', image: '/assets/product-camera.png', buyPrice: 38000, rentRate: 400, brand: 'Rode' },
  { _id: 'audio-ntg5', id: 'audio-ntg5', name: 'Rode NTG5 Shotgun Mic Kit', category: 'audio', image: '/assets/product-camera.png', buyPrice: 42000, rentRate: 450, brand: 'Rode' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let gear;
    try {
      await dbConnect();
      const filter: Record<string, unknown> = { inStock: true };
      if (category) {
        filter.category = category;
      }
      gear = await StudioGear.find(filter).sort({ buyPrice: 1 }).lean();
    } catch (dbErr) {
      console.warn('[api/studio/gear] DB unavailable, using fallback:', dbErr);
      gear = category
        ? FALLBACK_GEAR.filter(g => g.category === category)
        : FALLBACK_GEAR;
    }

    if (!gear || gear.length === 0) {
      gear = category
        ? FALLBACK_GEAR.filter(g => g.category === category)
        : FALLBACK_GEAR;
    }

    return NextResponse.json(gear, { status: 200 });
  } catch (err) {
    console.error('[api/studio/gear] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch gear inventory.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.name || !body.category || !body.buyPrice || !body.rentRate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, buyPrice, rentRate.' },
        { status: 400 }
      );
    }

    const item = await StudioGear.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('[api/studio/gear] POST error:', err);
    return NextResponse.json({ error: 'Failed to add gear.' }, { status: 500 });
  }
}
