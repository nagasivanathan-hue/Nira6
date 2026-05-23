import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { mockProducts } from '@/lib/mockData';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ featured: true }).limit(8);
    return NextResponse.json(products);
  } catch (err) {
    console.error('Database connection failed in products/featured, falling back to mock data:', err);
    const featuredProducts = mockProducts.filter(p => p.featured).slice(0, 8);
    return NextResponse.json(featuredProducts);
  }
}
