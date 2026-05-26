import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Service from '@/models/Service';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Creator Services API  (/api/services)
   GET: List services (optional ?category= filter)
   POST: Create a new service listing
   ═══════════════════════════════════════════════════════════ */

// Fallback mock data when DB is unreachable
const FALLBACK_SERVICES = [
  {
    _id: 's1', id: 's1', title: 'Professional Video Editing for YouTube', category: 'Video Editing',
    freelancer: { name: 'Arjun Mehta', avatar: '', title: 'Senior Video Editor', rating: 4.9, completedJobs: 234, location: 'Mumbai', verified: true, level: 'Elite' },
    price: 5000, deliveryDays: 3, rating: 4.9, reviewCount: 178, image: '/assets/product-camera.png',
    description: 'High-quality video editing with color grading, transitions, and sound design for YouTube creators.',
    tags: ['YouTube', 'Color Grading', 'Premiere Pro'],
  },
  {
    _id: 's2', id: 's2', title: 'Product Photography Session', category: 'Photography',
    freelancer: { name: 'Priya Sharma', avatar: '', title: 'Professional Photographer', rating: 4.8, completedJobs: 178, location: 'Delhi', verified: true, level: 'Top Rated' },
    price: 8000, deliveryDays: 2, rating: 4.8, reviewCount: 92, image: '/assets/product-camera.png',
    description: 'Professional product photography with studio lighting setup and post-processing.',
    tags: ['Product', 'Studio', 'E-commerce'],
  },
  {
    _id: 's3', id: 's3', title: 'Cinematic Drone Videography', category: 'Drone Piloting',
    freelancer: { name: 'Rahul Verma', avatar: '', title: 'Drone Pilot & Filmmaker', rating: 4.7, completedJobs: 92, location: 'Bangalore', verified: true, level: 'Pro' },
    price: 15000, deliveryDays: 5, rating: 4.7, reviewCount: 56, image: '/assets/product-drone.png',
    description: 'Stunning aerial videography for real estate, events, and commercial projects.',
    tags: ['Aerial', 'Cinematic', '4K'],
  },
  {
    _id: 's4', id: 's4', title: 'Advanced Photo Retouching', category: 'Photo Editing',
    freelancer: { name: 'Sneha Patel', avatar: '', title: 'Photo Retoucher', rating: 4.9, completedJobs: 312, location: 'Hyderabad', verified: true, level: 'Elite' },
    price: 2000, deliveryDays: 1, rating: 4.9, reviewCount: 234, image: '/assets/product-camera.png',
    description: 'Professional retouching including skin smoothing, color correction, and compositing.',
    tags: ['Retouching', 'Photoshop', 'Beauty'],
  },
  {
    _id: 's5', id: 's5', title: 'Motion Graphics & VFX', category: 'Motion Graphics',
    freelancer: { name: 'Vikram Singh', avatar: '', title: 'Motion Graphics Artist', rating: 4.6, completedJobs: 145, location: 'Chennai', verified: true, level: 'Pro' },
    price: 12000, deliveryDays: 7, rating: 4.6, reviewCount: 67, image: '/assets/product-camera.png',
    description: 'Custom motion graphics, intro animations, and visual effects for videos.',
    tags: ['After Effects', '3D', 'Animation'],
  },
  {
    _id: 's6', id: 's6', title: 'YouTube Thumbnail Design Pack', category: 'Thumbnail Design',
    freelancer: { name: 'Ananya Krishnan', avatar: '', title: 'Thumbnail Designer', rating: 4.8, completedJobs: 456, location: 'Pune', verified: true, level: 'Top Rated' },
    price: 1500, deliveryDays: 1, rating: 4.8, reviewCount: 345, image: '/assets/product-camera.png',
    description: 'Eye-catching YouTube thumbnail designs with high CTR optimization.',
    tags: ['YouTube', 'Thumbnails', 'Design'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let services;
    try {
      await dbConnect();
      const filter: Record<string, unknown> = { active: true };
      if (category && category !== 'All') {
        filter.category = category;
      }
      services = await Service.find(filter).sort({ rating: -1 }).lean();
    } catch (dbErr) {
      console.warn('[api/services] DB unavailable, using fallback:', dbErr);
      services = category && category !== 'All'
        ? FALLBACK_SERVICES.filter(s => s.category === category)
        : FALLBACK_SERVICES;
    }

    // If DB returned empty, use fallback
    if (!services || services.length === 0) {
      services = category && category !== 'All'
        ? FALLBACK_SERVICES.filter(s => s.category === category)
        : FALLBACK_SERVICES;
    }

    return NextResponse.json(services, { status: 200 });
  } catch (err) {
    console.error('[api/services] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch services.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.title || !body.category || !body.freelancer || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, freelancer, price.' },
        { status: 400 }
      );
    }

    const service = await Service.create(body);
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error('[api/services] POST error:', err);
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 });
  }
}
