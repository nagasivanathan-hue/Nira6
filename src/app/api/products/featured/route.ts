import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ featured: true }).limit(8);
    return NextResponse.json(products);
  } catch (err) {
    console.error('Database connection failed in products/featured:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
