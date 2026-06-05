import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { mockProducts } from '@/lib/mockData';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    await dbConnect();
    // Validate if ID looks like a valid Mongo ObjectId to avoid Mongoose CastError logs if possible
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const product = await Product.findById(id);
      if (product) {
        return NextResponse.json(product);
      }
    }
  } catch (err) {
    console.error('Database connection or query failed in products/[id], falling back to mock data:', err);
  }

  // Fallback to mock data
  try {
    const product = mockProducts.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (fallbackErr) {
    const error = fallbackErr as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
