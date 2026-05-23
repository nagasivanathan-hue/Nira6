import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { mockProducts } from '@/lib/mockData';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const id = (await params).id;
    const product = await Product.findById(id);
    if (!product) {
      const mockProduct = mockProducts.find(p => p.id === id);
      if (mockProduct) {
        return NextResponse.json(mockProduct);
      }
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error('Database connection or query failed in products/[id], falling back to mock data:', err);
    try {
      const id = (await params).id;
      const mockProduct = mockProducts.find(p => p.id === id);
      if (mockProduct) {
        return NextResponse.json(mockProduct);
      }
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    } catch (fallbackErr) {
      const error = fallbackErr as Error;
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
