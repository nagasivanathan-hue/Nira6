import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ trending: true }).limit(8);
    return NextResponse.json(products);
  } catch (err) {
    console.error('Database connection failed in products/trending:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
