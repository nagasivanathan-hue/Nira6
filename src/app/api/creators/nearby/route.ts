import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import CreatorProfile from '@/models/CreatorProfile';

interface CreatorProfilePopulated {
  _id: { toString(): string };
  userId?: { _id?: { toString(): string }; name?: string; avatar?: string; email?: string; phone?: string };
  category: string;
  title: string;
  bio: string;
  location: string;
  coordinates: {
    type: string;
    coordinates: number[];
  };
  rating: number;
  reviewCount: number;
  completedJobs: number;
  startingPrice: number;
  hourlyRate: number;
  availability: string;
  verified: boolean;
  verificationLevel: string;
  trustScore: number;
  portfolio: string[];
  skills: string[];
  styles: string[];
  gear: string[];
  languages: string[];
  experience: number;
  responseTime: string;
  featured: boolean;
  tags: string[];
  socialLinks?: { instagram?: string; youtube?: string; website?: string };
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const latStr = url.searchParams.get('lat');
    const lngStr = url.searchParams.get('lng');
    const radiusStr = url.searchParams.get('radius'); // in kilometers
    const category = url.searchParams.get('category');
    const availability = url.searchParams.get('availability');

    const lat = latStr ? parseFloat(latStr) : 9.9252;
    const lng = lngStr ? parseFloat(lngStr) : 78.1131;
    const radiusInMeters = radiusStr ? parseFloat(radiusStr) * 1000 : 50000; // default 50km radius

    const query: Record<string, unknown> = {
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      }
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    // Populate user info from User model associated with profile
    const profiles = await CreatorProfile.find(query)
      .populate('userId', 'name avatar email phone')
      .lean() as unknown as CreatorProfilePopulated[];

    // Map DB structure to front-end Creator interface format
    const creators = profiles.map((p: CreatorProfilePopulated) => ({
      id: p._id.toString(),
      userId: p.userId?._id?.toString(),
      name: p.userId?.name || 'Anonymous Creator',
      avatar: p.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      category: p.category,
      title: p.title,
      bio: p.bio,
      location: p.location,
      coordinates: {
        lat: p.coordinates.coordinates[1],
        lng: p.coordinates.coordinates[0]
      },
      rating: p.rating,
      reviewCount: p.reviewCount,
      completedJobs: p.completedJobs,
      startingPrice: p.startingPrice,
      hourlyRate: p.hourlyRate,
      availability: p.availability,
      verified: p.verified,
      verificationLevel: p.verificationLevel,
      trustScore: p.trustScore,
      portfolio: p.portfolio,
      skills: p.skills,
      styles: p.styles,
      gear: p.gear,
      languages: p.languages,
      experience: p.experience,
      responseTime: p.responseTime,
      featured: p.featured,
      tags: p.tags,
      socialLinks: p.socialLinks || {}
    }));

    return NextResponse.json(creators);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
