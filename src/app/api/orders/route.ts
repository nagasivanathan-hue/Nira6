import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Inventory from '@/models/Inventory';
import Warehouse from '@/models/Warehouse';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    // Check if auth header is valid, otherwise allow anonymous
    let user = null;
    try {
      user = await verifyAuth(req);
    } catch {
      // allow guest checkout to proceed
    }

    await dbConnect();
    const { 
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

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: 'No order items' }, { status: 400 });
    }

    if (!user && !isGuestCheckout) {
      return NextResponse.json({ message: 'Authorization required for member checkout' }, { status: 401 });
    }

    // 1. INVENTORY STOCK CHECK (Out-of-stock prevention)
    for (const item of orderItems) {
      const parentSku = item.sku || '';
      if (parentSku) {
        const inv = await Inventory.findOne({ sku: parentSku });
        if (inv && inv.stockLevel < item.quantity) {
          return NextResponse.json({ 
            message: `Product variant with SKU ${parentSku} is out of stock or has insufficient quantity.` 
          }, { status: 400 });
        }
      }
    }

    // 2. Locate active Warehouse
    const warehouse = await Warehouse.findOne({ active: true });

    // 3. Create the Order
    const orderStatus = paymentMethod === 'wallet' ? 'confirmed' : 'pending';
    const cgstVal = Math.round((totalAmount - (discountAmount || 0)) * 0.09);
    const sgstVal = Math.round((totalAmount - (discountAmount || 0)) * 0.09);

    const order = new Order({
      user: user ? user._id : undefined,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod: shippingMethod || 'Standard',
      shippingCost: shippingCost || 0,
      paymentMethod,
      totalAmount,
      taxAmount: taxAmount || (cgstVal + sgstVal),
      cgst: cgstVal,
      sgst: sgstVal,
      platformFee: platformFee || 0,
      discountAmount: discountAmount || 0,
      couponApplied: couponApplied || '',
      guestEmail: isGuestCheckout ? guestEmail : undefined,
      guestPhone: isGuestCheckout ? guestPhone : undefined,
      paymentStatus: paymentMethod === 'wallet' ? 'completed' : 'pending',
      orderStatus,
      warehouse: warehouse ? warehouse._id : undefined,
      trackingUpdates: [{
        status: orderStatus,
        description: orderStatus === 'confirmed' 
          ? 'Your order has been confirmed and warehouse picker assigned.' 
          : 'Order placed, awaiting payment confirmation.',
        location: warehouse ? warehouse.city : 'Mumbai Hub',
        timestamp: new Date()
      }]
    });

    // 4. If orderStatus is immediately confirmed, deduct stock
    if (orderStatus === 'confirmed') {
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
              description: `Ordered in Order #${order._id.toString().slice(-8).toUpperCase()}`,
              referenceId: order._id.toString(),
              timestamp: new Date()
            });
            await inv.save();
          }
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

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

