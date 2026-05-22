import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import RentalItem from '@/models/RentalItem';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await RentalItem.findById(id).lean();

    if (!item) {
      return NextResponse.json({ message: 'Rental item not found' }, { status: 404 });
    }

    const formatted: any = {
      ...item,
      id: (item as any)._id.toString(),
      specs: (item as any).specs instanceof Map ? Object.fromEntries((item as any).specs) : (item as any).specs
    };

    // Fetch similar items (same category, excluding self)
    const similar = await RentalItem.find({
      category: (item as any).category,
      _id: { $ne: (item as any)._id },
      available: true
    }).limit(4).lean();

    const formattedSimilar = similar.map((r: any) => ({
      ...r,
      id: r._id.toString(),
      specs: r.specs instanceof Map ? Object.fromEntries(r.specs) : r.specs
    }));

    return NextResponse.json({ item: formatted, similar: formattedSimilar });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
