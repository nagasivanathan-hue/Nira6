import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import Service from '@/models/Service';
import { verifyAuth } from '@/lib/auth/auth';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    await dbConnect();

    // 1. Update User
    await User.findByIdAndUpdate(user._id, {
      role: 'creator',
      phone: data.phone || user.phone,
      name: data.fullName || user.name,
      avatar: data.profilePhoto || user.avatar,
    });

    // 2. Create CreatorProfile
    const profile = await CreatorProfile.create({
      userId: user._id,
      category: data.primaryServiceCategory,
      title: data.serviceTitle,
      bio: data.bio,
      location: `${data.city}, ${data.state}, ${data.country}`,
      coordinates: { type: 'Point', coordinates: [0, 0] }, // Mock coordinates
      startingPrice: data.startingPrice,
      hourlyRate: data.startingPrice, // simplified
      businessName: data.businessName,
      gstNumber: data.gstNumber,
      teamSize: data.teamSize || 1,
      availableForTravel: data.availableForTravel,
      serviceRadius: data.serviceRadius || 50,
      workingDays: data.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      govtIdUrl: data.govtIdUrl,
      selfieUrl: data.selfieUrl,
      acceptTerms: data.acceptTerms,
      secondarySkills: data.secondarySkills || [],
      languages: data.languages || [],
      experience: data.yearsOfExperience || 1,
      socialLinks: {
        instagram: data.instagram,
        youtube: data.youtube,
        website: data.website,
        behance: data.behance,
      },
      portfolio: data.portfolioUrls || [],
    });

    // 3. Create initial Service Listing
    if (data.serviceTitle && data.startingPrice) {
      await Service.create({
        title: data.serviceTitle,
        category: data.primaryServiceCategory,
        creatorId: profile._id,
        price: data.startingPrice,
        pricingType: data.pricingType || 'Per Project',
        description: data.serviceDescription,
        deliveryDays: data.deliveryTime || 3,
        tags: data.secondarySkills || [],
        freelancer: {
          name: data.fullName || user.name,
          avatar: data.profilePhoto || user.avatar,
          title: data.serviceTitle,
          rating: 5.0,
          completedJobs: 0,
          location: data.city,
          verified: false,
          level: 'Rising'
        }
      });
    }

    return NextResponse.json({ message: 'Onboarding complete', profileId: profile._id }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    console.error('Onboarding API Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
