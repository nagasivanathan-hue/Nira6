import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { verifyAdmin } from '@/lib/auth/auth';
import { logAdminActivity } from '@/lib/adminLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Update fields
    const allowedUpdates = [
      'name', 'brand', 'price', 'category', 'image', 'grade',
      'conditionScore', 'featured', 'trending', 'originalPrice',
      'specs', 'stock', 'description', 'warranty', 'variants',
      'tags', 'seoTitle', 'seoDescription', 'seoKeywords', 'isArchived'
    ];

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        product[field] = body[field];
      }
    });

    if (body.originalPrice && body.price) {
      product.discount = Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100);
    }

    const updatedProduct = await product.save();

    await logAdminActivity(
      user.email,
      'PRODUCT_EDIT',
      `Updated product "${product.name}" (${id}). Stock: ${product.stock}, Price: ${product.price}, Archived: ${product.isArchived}`,
      req
    );

    return NextResponse.json(updatedProduct);
  } catch (err: unknown) {
    return NextResponse.json({ message: (err as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Toggle archive instead of hard delete to preserve order history integrity
    product.isArchived = true;
    await product.save();

    await logAdminActivity(
      user.email,
      'PRODUCT_ARCHIVE',
      `Archived product "${product.name}" (${id}) to preserve transaction integrity.`,
      req
    );

    return NextResponse.json({ success: true, message: 'Product successfully archived' });
  } catch (err: unknown) {
    return NextResponse.json({ message: (err as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
