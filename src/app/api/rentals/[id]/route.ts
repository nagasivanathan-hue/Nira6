import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import RentalItem from '@/models/RentalItem';
import mongoose from 'mongoose';
import { RentalItem as SharedRentalItem } from '@/types';

interface LeanRentalItemDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  brand: string;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  dailyRate: number;
  hourlyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  securityDeposit: number;
  available: boolean;
  bookedDates?: { start: Date; end: Date }[];
  pickupLocations?: string[];
  lensMount?: string;
  sensorType?: string;
  videoSpecs?: string;
  conditionScore?: number;
  shutterCount?: number;
  insuranceAvailable?: boolean;
  insuranceRate?: number;
  bestFor?: string[];
  specs?: Map<string, string> | Record<string, string>;
  rating: number;
  reviewCount: number;
  location: string;
  owner: string;
  ownerId?: mongoose.Types.ObjectId;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await RentalItem.findById(id).lean() as unknown as LeanRentalItemDoc | null;

    if (!item) {
      return NextResponse.json({ message: 'Rental item not found' }, { status: 404 });
    }

    const formatted: SharedRentalItem = {
      ...item,
      id: item._id.toString(),
      specs: item.specs instanceof Map ? Object.fromEntries(item.specs) : (item.specs as Record<string, string>)
    } as unknown as SharedRentalItem;

    // Fetch similar items (same category, excluding self)
    const similar = await RentalItem.find({
      category: item.category,
      _id: { $ne: item._id },
      available: true
    }).limit(4).lean() as unknown as LeanRentalItemDoc[];

    const formattedSimilar: SharedRentalItem[] = similar.map((r) => ({
      ...r,
      id: r._id.toString(),
      specs: r.specs instanceof Map ? Object.fromEntries(r.specs) : (r.specs as Record<string, string>)
    }) as unknown as SharedRentalItem);

    return NextResponse.json({ item: formatted, similar: formattedSimilar });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
