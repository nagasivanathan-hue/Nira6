import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth/auth';
import { mockProducts } from '@/lib/mockData';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Auto-seed if database is empty
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[Seeding] Products collection is empty. Seeding mockProducts...');
      const seeded = mockProducts.map(p => {
        const specMap = new Map();
        if (p.specs) {
          Object.entries(p.specs).forEach(([key, val]) => {
            specMap.set(key, val);
          });
        }
        return {
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discount,
          image: p.image || '/assets/product-camera.png',
          images: p.images || [p.image || '/assets/product-camera.png'],
          grade: p.condition === 'Like New' || p.condition === 'Excellent' || p.condition === 'Good' || p.condition === 'Fair' 
            ? p.condition 
            : 'Excellent',
          featured: p.featured || false,
          trending: p.trending || false,
          rating: p.rating || 4.5,
          reviewCount: p.reviewCount || 10,
          emiAvailable: p.emiAvailable || false,
          specs: specMap,
          stock: p.inStock ? 1 : 0,
          sku: `SKU-${p.id || Math.floor(Math.random() * 1000000)}`,
          description: p.description || '',
          seller: p.sellerName || 'NIRA6 Certified'
        };
      });
      await Product.insertMany(seeded);
    }
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const grade = searchParams.get('grade');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const keyword = searchParams.get('keyword');

    const query: {
      category?: string;
      brand?: string;
      grade?: string;
      price?: {
        $gte?: number;
        $lte?: number;
      };
      $or?: Array<{
        name?: { $regex: string; $options: string };
        brand?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
    } = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (grade) query.grade = grade;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    let productQuery = Product.find(query);

    if (sort === 'price_asc') productQuery = productQuery.sort({ price: 1 });
    else if (sort === 'price_desc') productQuery = productQuery.sort({ price: -1 });
    else productQuery = productQuery.sort({ createdAt: -1 });

    const products = await productQuery;
    return NextResponse.json(products);
  } catch (err) {
    console.error('Database connection or query failed in products GET, falling back to mock data:', err);
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category')?.toLowerCase();
      const brand = searchParams.get('brand')?.toLowerCase();
      const grade = searchParams.get('grade')?.toLowerCase();
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const sort = searchParams.get('sort');
      const keyword = searchParams.get('keyword')?.toLowerCase();

      let products = [...mockProducts];

      if (category && category !== 'all') {
        products = products.filter(p => p.category?.toLowerCase() === category);
      }
      if (brand && brand !== 'all') {
        products = products.filter(p => p.brand?.toLowerCase() === brand);
      }
      if (grade && grade !== 'all') {
        products = products.filter(p => p.grade?.toLowerCase() === grade || p.condition?.toLowerCase() === grade);
      }
      if (minPrice) {
        products = products.filter(p => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        products = products.filter(p => p.price <= Number(maxPrice));
      }
      if (keyword) {
        products = products.filter(p => 
          p.name?.toLowerCase().includes(keyword) || 
          p.brand?.toLowerCase().includes(keyword) || 
          p.description?.toLowerCase().includes(keyword)
        );
      }

      if (sort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else {
        products.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }

      return NextResponse.json(products);
    } catch (fallbackErr) {
      const error = fallbackErr as Error;
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
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
