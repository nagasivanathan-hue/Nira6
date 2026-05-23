import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { mockProducts } from '@/lib/mockData';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ trending: true }).limit(8);
    return NextResponse.json(products);
  } catch (err) {
    console.error('Database connection failed in products/trending, falling back to mock data:', err);
    const trendingProducts = mockProducts.filter(p => p.trending).slice(0, 8);
    return NextResponse.json(trendingProducts);
  }
}
