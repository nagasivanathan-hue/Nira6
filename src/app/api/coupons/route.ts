import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Coupon from '@/models/Coupon';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

    if (!coupon) {
      return NextResponse.json({ message: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json({ message: 'Coupon has expired' }, { status: 400 });
    }

    if (orderAmount < coupon.minOrderValue) {
      return NextResponse.json({
        message: `Minimum order value of ₹${coupon.minOrderValue} is required to apply this coupon.`
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderAmount * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discountAmount: discount
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
