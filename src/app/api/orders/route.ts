import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Inventory from '@/models/Inventory';
import Warehouse from '@/models/Warehouse';
import { verifyAuth } from '@/lib/auth/auth';
import { generateOrderId, generateInvoiceNumber, logOrderAudit } from '@/lib/orderUtils';

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

    // Generate custom sequential Order ID and Invoice Number
    const oId = await generateOrderId();
    const invNo = await generateInvoiceNumber();

    // 3. Dynamic GST Invoicing Calculation
    const state = (shippingAddress?.state || 'Tamil Nadu').toLowerCase().trim();
    const isLocal = state.includes('tamil nadu') || state === 'tn' || state === 'tamilnadu';
    let cgstVal = 0;
    let sgstVal = 0;
    let igstVal = 0;
    const taxableAmount = totalAmount - (discountAmount || 0);

    if (isLocal) {
      cgstVal = Math.round(taxableAmount * 0.09);
      sgstVal = Math.round(taxableAmount * 0.09);
    } else {
      igstVal = Math.round(taxableAmount * 0.18);
    }

    const calculatedTax = cgstVal + sgstVal + igstVal;

    // 4. Create the Order
    const orderStatus = paymentMethod === 'wallet' ? 'confirmed' : 'pending';

    const order = new Order({
      orderId: oId,
      invoiceNumber: invNo,
      user: user ? user._id : undefined,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod: shippingMethod || 'Standard',
      shippingCost: shippingCost || 0,
      paymentMethod,
      totalAmount,
      taxAmount: taxAmount || calculatedTax,
      cgst: cgstVal,
      sgst: sgstVal,
      igst: igstVal,
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

    // 5. If orderStatus is immediately confirmed, deduct stock
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
              description: `Ordered in Order #${oId.slice(-8).toUpperCase()}`,
              referenceId: order._id.toString(),
              timestamp: new Date()
            });
            await inv.save();
          }
        }
      }
    }

    const createdOrder = await order.save();

    // Log Placement Audit Trail
    await logOrderAudit({
      orderId: oId,
      orderObjectId: createdOrder._id.toString(),
      eventName: 'order_placed',
      notes: `Order placed successfully. Sequential ID: ${oId}. Total: ₹${totalAmount}. Payment method: ${paymentMethod}`,
      operator: user ? user.name : 'Guest Customer',
      role: user ? user.role : 'customer'
    });

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
          orderId: createdOrder.orderId || createdOrder._id.toString(),
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
        
        // Construct the item names as a comma-separated string for easy Excel viewing
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

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

