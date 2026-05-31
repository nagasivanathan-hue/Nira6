import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth/auth';
import Inventory from '@/models/Inventory';
import Warehouse from '@/models/Warehouse';

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
      const warehouse = await Warehouse.findOne({ active: true });

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
        orderStatus: 'confirmed',
        warehouse: warehouse ? warehouse._id : undefined,
        trackingUpdates: [{
          status: 'confirmed',
          description: 'Payment verified and order has been confirmed.',
          location: warehouse ? warehouse.city : 'Mumbai Hub',
          timestamp: new Date()
        }],
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      // Deduct stock for confirmed order
      for (const item of order.items) {
        const itemSku = item.sku;
        if (itemSku) {
          const inv = await Inventory.findOne({ sku: itemSku });
          if (inv) {
            inv.stockLevel = Math.max(0, inv.stockLevel - item.quantity);
            if (warehouse) {
              const whStock = inv.warehouseStock.find(
                (w: any) => w.warehouse.toString() === warehouse._id.toString()
              );
              if (whStock) {
                whStock.stock = Math.max(0, whStock.stock - item.quantity);
              }
            }
            inv.history.push({
              type: 'outward',
              quantity: item.quantity,
              description: `Ordered via Razorpay in Order #${order._id.toString().slice(-8).toUpperCase()}`,
              referenceId: order._id.toString(),
              timestamp: new Date()
            });
            await inv.save();
          }
        }
      }

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

      // Webhook Integration for Excel/Google Sheets
      try {
        const webhookUrl = process.env.ORDER_WEBHOOK_URL;
        if (webhookUrl) {
          const customerEmail = isGuestCheckout ? guestEmail : user?.email;
          const customerName = isGuestCheckout ? shippingAddress.name : user?.name;
          
          const itemNames = (orderItems || []).map((item: any) => `${item.quantity}x ${item.sku || 'Item'}`).join(', ');

          const webhookPayload = {
            orderId: createdOrder._id.toString(),
            date: new Date().toISOString(),
            customerName: customerName || 'Guest',
            customerEmail: customerEmail || 'Unknown',
            customerPhone: isGuestCheckout ? guestPhone : (shippingAddress.phone || 'Unknown'),
            totalAmount: createdOrder.totalAmount,
            paymentMethod: createdOrder.paymentMethod,
            shippingCity: shippingAddress.city || 'Unknown',
            items: itemNames,
            orderStatus: createdOrder.orderStatus
          };

          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
          }).catch(e => console.error('Background webhook failed:', e));
        }
      } catch (webhookErr) {
        console.error('Failed to trigger order webhook:', webhookErr);
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
