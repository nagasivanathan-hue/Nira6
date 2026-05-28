import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    let user = null;
    try {
      user = await verifyAuth(req);
    } catch {
      // allow guest verification to proceed
    }

    await dbConnect();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      shippingAddress,
      billingAddress,
      shippingMethod,
      shippingCost,
      paymentMethod,
      totalAmount,
      taxAmount,
      platformFee,
      discountAmount,
      couponApplied,
      isGuestCheckout,
      guestEmail,
      guestPhone
    } = await req.json();

    if (!user && !isGuestCheckout) {
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = new Order({
        user: user ? user._id : undefined,
        items: orderItems,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        shippingMethod: shippingMethod || 'Standard',
        shippingCost: shippingCost || 0,
        paymentMethod,
        totalAmount,
        taxAmount: taxAmount || 0,
        platformFee: platformFee || 0,
        discountAmount: discountAmount || 0,
        couponApplied: couponApplied || '',
        guestEmail: isGuestCheckout ? guestEmail : undefined,
        guestPhone: isGuestCheckout ? guestPhone : undefined,
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      const createdOrder = await order.save();

      // Trigger confirmation email asynchronously
      try {
        const { sendOrderConfirmationEmail } = await import('@/lib/email/email');
        const populatedOrder = await Order.findById(createdOrder._id).populate('items.product', 'name');
        
        const emailItems = populatedOrder?.items.map((item: any) => ({
          name: item.product?.name || 'Camera Equipment',
          quantity: item.quantity,
          price: item.price
        })) || [];

        const customerEmail = isGuestCheckout ? guestEmail : user?.email;
        const customerName = isGuestCheckout ? shippingAddress.name : user?.name;

        if (customerEmail) {
          sendOrderConfirmationEmail({
            orderId: createdOrder._id.toString(),
            totalAmount: createdOrder.totalAmount,
            items: emailItems,
            customerName: customerName || 'Valued Creator',
            customerEmail: customerEmail
          }).catch(e => console.error('Background email failed:', e));
        }
      } catch (emailErr) {
        console.error('Failed to trigger order confirmation email:', emailErr);
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully", order: createdOrder });
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
