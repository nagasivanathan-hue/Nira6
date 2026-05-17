import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth/auth';

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

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const {
      name,
      brand,
      category,
      price,
      originalPrice,
      grade,
      description,
      image,
      specs
    } = body;

    if (!name || !brand || !category || !price || !grade || !image) {
      return NextResponse.json({ message: 'Missing required product parameters' }, { status: 400 });
    }

    const calculatedDiscount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const product = new Product({
      name,
      brand,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: calculatedDiscount,
      image,
      images: [image],
      grade,
      rating: 4.5,
      reviewCount: 0,
      inStock: true,
      specs: specs || {},
      description: description || '',
      seller: user.name || 'NIRA6 Creator'
    });

    const savedProduct = await product.save();
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
