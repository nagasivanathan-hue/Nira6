import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import StudioGear from '@/models/StudioGear';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — AI DP Concierge API  (/api/studio/concierge)
   POST: Accepts a scene prompt + optional image URL,
         matches gear from DB, returns curated bundle.
   ═══════════════════════════════════════════════════════════ */

interface GearItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  image: string;
  buyPrice: number;
  rentRate: number;
}

const FALLBACK_GEAR: GearItem[] = [
  { id: 'cam-fx3', name: 'Sony FX3 Cinema Camera', category: 'camera', image: '/assets/product-camera.png', buyPrice: 295000, rentRate: 2500 },
  { id: 'cam-a7iv', name: 'Sony Alpha 7 IV Mirrorless', category: 'camera', image: '/assets/product-camera.png', buyPrice: 198000, rentRate: 1600 },
  { id: 'lens-85gm', name: 'Sony FE 85mm f/1.4 GM', category: 'lens', image: '/assets/product-lens.png', buyPrice: 145000, rentRate: 1100 },
  { id: 'lens-2470gm', name: 'Sony FE 24-70mm f/2.8 GM II', category: 'lens', image: '/assets/product-lens.png', buyPrice: 199000, rentRate: 1400 },
  { id: 'light-godox', name: 'Godox SZ150R Zoom RGB LED', category: 'lighting', image: '/assets/product-drone.png', buyPrice: 48000, rentRate: 500 },
  { id: 'light-aputure', name: 'Aputure LS 600d Pro Light', category: 'lighting', image: '/assets/product-drone.png', buyPrice: 185000, rentRate: 1800 },
  { id: 'audio-rodewp', name: 'Rode Wireless PRO Mic System', category: 'audio', image: '/assets/product-camera.png', buyPrice: 38000, rentRate: 400 },
  { id: 'audio-ntg5', name: 'Rode NTG5 Shotgun Mic Kit', category: 'audio', image: '/assets/product-camera.png', buyPrice: 42000, rentRate: 450 },
];

// Keyword-to-category matching intelligence
function matchGearToPrompt(prompt: string, allGear: GearItem[]): { packageName: string; items: GearItem[] } {
  const lower = prompt.toLowerCase();

  // Lighting-focused shoots
  if (lower.includes('light') || lower.includes('chiaroscuro') || lower.includes('studio') || lower.includes('portrait')) {
    const items = [
      allGear.find(g => g.category === 'camera') || allGear[0],
      allGear.find(g => g.category === 'lens') || allGear[2],
      ...allGear.filter(g => g.category === 'lighting').slice(0, 1),
    ].filter(Boolean) as GearItem[];
    return { packageName: 'Chiaroscuro Dark Cinema Kit', items };
  }

  // Audio / interview / documentary
  if (lower.includes('audio') || lower.includes('interview') || lower.includes('documentary') || lower.includes('podcast')) {
    const items = [
      allGear.find(g => g.category === 'camera') || allGear[0],
      allGear.find(g => g.category === 'lens') || allGear[2],
      ...allGear.filter(g => g.category === 'audio').slice(0, 1),
    ].filter(Boolean) as GearItem[];
    return { packageName: 'Documentary & Dialogue Kit', items };
  }

  // Wedding / event
  if (lower.includes('wedding') || lower.includes('event') || lower.includes('ceremony')) {
    const cameras = allGear.filter(g => g.category === 'camera').slice(0, 2);
    const lens = allGear.find(g => g.category === 'lens') || allGear[2];
    const light = allGear.find(g => g.category === 'lighting') || allGear[4];
    return { packageName: 'Wedding Cinematic Package', items: [...cameras, lens, light].filter(Boolean) as GearItem[] };
  }

  // Cinematic / film
  if (lower.includes('cinematic') || lower.includes('film') || lower.includes('movie') || lower.includes('short film')) {
    const items = allGear.slice(0, 4);
    return { packageName: 'Full Cinematic Production Kit', items };
  }

  // Default: Run-and-Gun commercial pack
  const items = [
    allGear.find(g => g.category === 'camera') || allGear[0],
    allGear.find(g => g.category === 'lens') || allGear[2],
    allGear.find(g => g.category === 'lighting') || allGear[4],
    allGear.find(g => g.category === 'audio') || allGear[6],
  ].filter(Boolean) as GearItem[];
  return { packageName: 'Run-and-Gun Commercial Pack', items };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string = body.prompt || '';
    const imageUrl: string = body.imageUrl || '';

    if (!prompt.trim() && !imageUrl.trim()) {
      return NextResponse.json(
        { error: 'Provide a scene description prompt or reference image URL.' },
        { status: 400 }
      );
    }

    // Fetch gear from DB or fallback
    let allGear: GearItem[];
    try {
      await dbConnect();
      const dbGear = await StudioGear.find({ inStock: true }).lean();
      allGear = dbGear.length > 0 ? dbGear.map(g => ({
        _id: String(g._id),
        id: String(g._id),
        name: g.name,
        category: g.category,
        image: g.image,
        buyPrice: g.buyPrice,
        rentRate: g.rentRate,
      })) : FALLBACK_GEAR;
    } catch {
      allGear = FALLBACK_GEAR;
    }

    // Build search string from prompt + image context
    const searchText = prompt + (imageUrl ? ' chiaroscuro light cinematic' : '');
    const { packageName, items } = matchGearToPrompt(searchText, allGear);

    const buyTotal = items.reduce((sum, item) => sum + item.buyPrice, 0);
    const rentRateTotal = items.reduce((sum, item) => sum + item.rentRate, 0);

    return NextResponse.json({
      packageName,
      items,
      buyTotal,
      rentRateTotal,
    }, { status: 200 });
  } catch (err) {
    console.error('[api/studio/concierge] Error:', err);
    return NextResponse.json({ error: 'Concierge recommendation failed.' }, { status: 500 });
  }
}
