import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ message: 'Payload must be an array of products' }, { status: 400 });
    }

    if (body.length === 0) {
      return NextResponse.json({ message: 'Empty products list' }, { status: 400 });
    }

    // Server-side validation of products
    const validatedProducts = [];
    const validGrades = ['Like New', 'Excellent', 'Good', 'Fair'];

    for (const item of body) {
      if (!item.name || !item.brand || !item.price || !item.category || !item.image || !item.grade) {
        return NextResponse.json({
          message: 'Missing required fields on one or more products. Required: name, brand, price, category, image, grade.'
        }, { status: 400 });
      }

      if (!validGrades.includes(item.grade)) {
        return NextResponse.json({
          message: `Invalid product grade on product "${item.name}". Grade must be one of: 'Like New', 'Excellent', 'Good', 'Fair'.`
        }, { status: 400 });
      }

      // Specs conversion from arbitrary object/record to standard Map
      const specsMap = new Map<string, string>();
      if (item.specs && typeof item.specs === 'object') {
        Object.entries(item.specs).forEach(([k, v]) => {
          specsMap.set(k, String(v));
        });
      }

      validatedProducts.push({
        name: String(item.name).trim(),
        brand: String(item.brand).trim(),
        price: Number(item.price),
        category: String(item.category).trim(),
        image: String(item.image).trim(),
        grade: item.grade,
        conditionScore: item.conditionScore !== undefined ? Number(item.conditionScore) : undefined,
        featured: Boolean(item.featured),
        trending: Boolean(item.trending),
        specs: specsMap,
        stock: item.stock !== undefined ? Number(item.stock) : 1,
        description: item.description ? String(item.description).trim() : undefined,
        seller: item.seller ? String(item.seller).trim() : 'NIRA6 Certified',
        warranty: item.warranty ? String(item.warranty).trim() : '6 Months NIRA6 Warranty'
      });
    }

    // High performance bulk insertion
    const createdProducts = await Product.insertMany(validatedProducts);

    return NextResponse.json({
      success: true,
      message: `${createdProducts.length} products imported successfully!`,
      count: createdProducts.length
    }, { status: 201 });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
