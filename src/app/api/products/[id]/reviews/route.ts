import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id).select('reviews rating reviewCount');
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product.reviews || []);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { rating, comment, title } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!comment || comment.trim() === '') {
      return NextResponse.json({ message: 'Comment is required' }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Append new review
    const newReview = {
      userName: user.name || 'Anonymous User',
      rating: Number(rating),
      comment: String(comment).trim(),
      title: title ? String(title).trim() : '',
      date: new Date()
    };

    if (!product.reviews) {
      product.reviews = [];
    }
    product.reviews.push(newReview);

    // Recalculate average rating & review count
    const totalReviews = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc: number, rev: { rating: number }) => acc + rev.rating, 0);
    product.rating = Number((sumRatings / totalReviews).toFixed(1));
    product.reviewCount = totalReviews;

    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Review added successfully!',
      reviews: product.reviews,
      rating: product.rating,
      reviewCount: product.reviewCount
    }, { status: 201 });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
