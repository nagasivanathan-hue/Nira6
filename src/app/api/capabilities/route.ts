import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Capability from '@/models/Capability';

const DEFAULT_CAPABILITIES = [
  {
    title: "Vertical Reels Ecosystem",
    desc: "Full-screen edge-to-edge cinematic short-form media hub customized for visual storytellers and filmmakers.",
    iconName: "Clapperboard",
    glow: "from-purple-500/20 to-indigo-500/20",
    order: 0
  },
  {
    title: "Smart Camera Rentals",
    desc: "Instantly reserve cinema rigs, prime glass, or heavy-lift drones near you with real-time slot checking.",
    iconName: "Compass",
    glow: "from-amber-500/20 to-orange-500/20",
    order: 1
  },
  {
    title: "Refurbished Gear Recommerce",
    desc: "P2P verified marketplace for buying and selling gear with 50+ points inspection certificates.",
    iconName: "DollarSign",
    glow: "from-emerald-500/20 to-teal-500/20",
    order: 2
  },
  {
    title: "Creator AI Matchmaker",
    desc: "Programmatic algorithmic pairing matching brands with top photographers, models, and directors.",
    iconName: "Cpu",
    glow: "from-blue-500/20 to-cyan-500/20",
    order: 3
  },
  {
    title: "Creator Studio Analytics",
    desc: "Real-time viewer retention analytics, completion metrics, and earnings telemetry log dashboard.",
    iconName: "Activity",
    glow: "from-red-500/20 to-pink-500/20",
    order: 4
  },
  {
    title: "Modular Cloud Portfolios",
    desc: "Host high-bitrate showreels, EXIF data archives, and customized interactive digital portfolios.",
    iconName: "Layers",
    glow: "from-violet-500/20 to-fuchsia-500/20",
    order: 5
  }
];

export async function GET() {
  try {
    await dbConnect();
    
    // Check count and seed if empty
    const count = await Capability.countDocuments();
    if (count === 0) {
      await Capability.insertMany(DEFAULT_CAPABILITIES);
    }
    
    const capabilities = await Capability.find({}).sort({ order: 1 }).lean();
    return NextResponse.json(capabilities);
  } catch (err) {
    console.error('Database connection or query failed in capabilities GET, falling back to mock data:', err);
    return NextResponse.json(DEFAULT_CAPABILITIES);
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, desc, iconName, glow, order } = body;

    if (!title || !desc || !iconName || !glow) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    const capability = await Capability.create({
      title,
      desc,
      iconName,
      glow,
      order: order !== undefined ? Number(order) : 0
    });

    return NextResponse.json({
      success: true,
      message: 'Capability created successfully',
      capability
    }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
