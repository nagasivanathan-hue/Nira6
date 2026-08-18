import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { verifyAdmin } from '@/lib/auth/auth';
import { logAdminActivity } from '@/lib/adminLogger';

export async function GET(req: Request) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'all'; // all, active, archived

    const query: Record<string, unknown> = {};

    if (category) {
      query.category = category;
    }

    if (status === 'active') {
      query.isArchived = { $ne: true };
    } else if (status === 'archived') {
      query.isArchived = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products);
  } catch (err: unknown) {
    return NextResponse.json({ message: (err as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const {
      name,
      brand,
      price,
      category,
      image,
      grade,
      conditionScore,
      featured,
      trending,
      originalPrice,
      specs,
      stock,
      description,
      warranty,
      variants,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords
    } = body;

    if (!name || !brand || !category || price === undefined || !image || !grade) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Auto SKU generation: NIRA-BRAND-NAME-RAND
    const nameAbbr = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const brandAbbr = brand.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const generatedSku = `NIRA-${brandAbbr}-${nameAbbr}-${randNum}`;

    const calculatedDiscount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const product = new Product({
      name,
      brand,
      price: Number(price),
      category,
      image,
      grade,
      conditionScore: conditionScore ? Number(conditionScore) : undefined,
      featured: !!featured,
      trending: !!trending,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: calculatedDiscount,
      specs: specs || {},
      stock: stock ? Number(stock) : 1,
      sku: generatedSku,
      variants: variants || [],
      description: description || '',
      seller: 'NIRA6 Certified',
      warranty: warranty || '6 Months NIRA6 Warranty',
      tags: tags || [],
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description || '',
      seoKeywords: seoKeywords || [],
      isArchived: false
    });

    const savedProduct = await product.save();

    await logAdminActivity(
      user.email,
      'PRODUCT_CREATE',
      `Created product: "${name}" (${brand}) - SKU: ${generatedSku}. Price: ${price}`,
      req
    );

    return NextResponse.json(savedProduct, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: (err as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
