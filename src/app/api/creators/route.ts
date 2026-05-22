import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import { verifyAuth } from '@/lib/auth/auth';

interface CreatorProfilePopulated {
  _id: { toString(): string };
  userId?: { _id?: { toString(): string }; name?: string; avatar?: string; email?: string; phone?: string };
  category: string;
  title: string;
  bio: string;
  location: string;
  coordinates?: {
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
    const category = url.searchParams.get('category');
    const minRating = url.searchParams.get('minRating');
    const maxBudget = url.searchParams.get('maxBudget');
    const search = url.searchParams.get('search');

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxBudget) {
      query.startingPrice = { $lte: parseFloat(maxBudget) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const profiles = await CreatorProfile.find(query)
      .populate('userId', 'name avatar email phone')
      .lean() as unknown as CreatorProfilePopulated[];

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
        lat: p.coordinates?.coordinates[1] || 9.9252,
        lng: p.coordinates?.coordinates[0] || 78.1131
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

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // Check if creator profile already exists
    let profile = await CreatorProfile.findOne({ userId: user._id });

    const coordinates = data.lat && data.lng 
      ? { type: 'Point', coordinates: [Number(data.lng), Number(data.lat)] }
      : { type: 'Point', coordinates: [78.1131, 9.9252] }; // default Madurai coords

    const profileData = {
      userId: user._id,
      category: data.category,
      title: data.title,
      bio: data.bio,
      location: data.location || 'Madurai, India',
      coordinates,
      startingPrice: Number(data.startingPrice || 1000),
      hourlyRate: Number(data.hourlyRate || 150),
      skills: data.skills || [],
      gear: data.gear || [],
      experience: Number(data.experience || 1),
      availability: 'available',
      verified: false,
      verificationLevel: 'none',
      portfolio: data.portfolio || [],
      styles: data.styles || [],
      languages: data.languages || ['English', 'Tamil'],
      tags: data.tags || [],
      socialLinks: data.socialLinks || {}
    };

    if (profile) {
      // Update existing
      profile = await CreatorProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: profileData },
        { new: true }
      );
    } else {
      // Create new
      profile = await CreatorProfile.create(profileData);
      
      // Update User role to 'creator' if not already admin
      if (user.role !== 'admin') {
        user.role = 'creator';
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Creator profile saved successfully',
      profile
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
