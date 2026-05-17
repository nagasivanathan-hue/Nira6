import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const grade = searchParams.get('grade');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');

    const query: {
      category?: string;
      brand?: string;
      grade?: string;
      price?: {
        $gte?: number;
        $lte?: number;
      };
    } = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (grade) query.grade = grade;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let productQuery = Product.find(query);

    if (sort === 'price_asc') productQuery = productQuery.sort({ price: 1 });
    else if (sort === 'price_desc') productQuery = productQuery.sort({ price: -1 });
    else productQuery = productQuery.sort({ createdAt: -1 });

    const products = await productQuery;
    return NextResponse.json(products);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
