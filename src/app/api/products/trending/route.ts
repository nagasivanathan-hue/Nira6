import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ trending: true }).limit(8);
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
