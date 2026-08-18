import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import ReturnRequest from '@/models/ReturnRequest';
import Notification from '@/models/Notification';
import Inventory from '@/models/Inventory';
import { verifyAdmin } from '@/lib/auth/auth';
import { logOrderAudit } from '@/lib/orderUtils';

export async function GET(req: Request) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const returns = await ReturnRequest.find({})
      .populate('user', 'name email')
      .populate({
        path: 'order',
        populate: { path: 'items.product' }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(returns);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAdmin(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { returnRequestId, action, adminNotes, pickupCourier, pickupDate, refundMethod } = await req.json();

    const returnReq = await ReturnRequest.findById(returnRequestId).populate('order').populate('user');
    if (!returnReq) {
      return NextResponse.json({ message: 'Return request not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = returnReq.order as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientUser = returnReq.user as any;

    if (action === 'approve') {
      returnReq.status = 'approved';
      returnReq.adminNotes = adminNotes || returnReq.adminNotes;
      returnReq.timeline.push({
        status: 'approved',
        description: 'Return request approved by admin. Preparing for pickup scheduling.',
        timestamp: new Date()
      });
      await returnReq.save();

      // Log Audit
      await logOrderAudit({
        orderId: returnReq.orderId,
        orderObjectId: order._id.toString(),
        eventName: 'return_approved',
        notes: `Return request approved. Admin notes: ${adminNotes}`,
        operator: user.name,
        role: user.role
      });
    } 
    
    else if (action === 'reject') {
      returnReq.status = 'rejected';
      returnReq.adminNotes = adminNotes || returnReq.adminNotes;
      returnReq.timeline.push({
        status: 'rejected',
        description: `Return request rejected by admin. Reason: ${adminNotes}`,
        timestamp: new Date()
      });
      await returnReq.save();

      // Reset order status
      order.orderStatus = 'delivered';
      order.trackingUpdates.push({
        status: 'delivered',
        description: `Return request rejected. Order restored to delivered status.`,
        location: 'Admin Desk',
        timestamp: new Date()
      });
      await order.save();

      // Log Audit
      await logOrderAudit({
        orderId: returnReq.orderId,
        orderObjectId: order._id.toString(),
        eventName: 'return_rejected',
        notes: `Return request rejected. Reason: ${adminNotes}`,
        operator: user.name,
        role: user.role
      });
    }

    else if (action === 'schedule_pickup') {
      const pickupAWB = `RET-${pickupCourier?.slice(0, 3).toUpperCase() || 'DEL'}-${Math.floor(100000 + Math.random() * 900000)}`;
      returnReq.status = 'pickup_scheduled';
      returnReq.pickupCourier = pickupCourier || 'Delhivery';
      returnReq.pickupAWB = pickupAWB;
      const pickupDateObj = pickupDate ? new Date(pickupDate) : new Date();
      returnReq.pickupDate = pickupDateObj;
      returnReq.timeline.push({
        status: 'pickup_scheduled',
        description: `Return pickup scheduled via ${returnReq.pickupCourier}. AWB: ${pickupAWB}. Scheduled Date: ${pickupDateObj.toDateString()}`,
        timestamp: new Date()
      });
      await returnReq.save();

      // Log Audit
      await logOrderAudit({
        orderId: returnReq.orderId,
        orderObjectId: order._id.toString(),
        eventName: 'return_pickup_scheduled',
        notes: `Return pickup scheduled. Courier: ${returnReq.pickupCourier}, AWB: ${pickupAWB}`,
        operator: user.name,
        role: user.role
      });
    }

    else if (action === 'receive') {
      returnReq.status = 'received';
      returnReq.timeline.push({
        status: 'received',
        description: 'Return shipment package received and inspected at warehouse hub.',
        timestamp: new Date()
      });
      await returnReq.save();

      // Log Audit
      await logOrderAudit({
        orderId: returnReq.orderId,
        orderObjectId: order._id.toString(),
        eventName: 'return_received',
        notes: `Return shipment received at warehouse hub. QC inspection passed.`,
        operator: user.name,
        role: user.role
      });
    }

    else if (action === 'process_refund') {
      const refundAmt = returnReq.refundAmount;
      const refMethod = refundMethod || returnReq.refundMethod;

      if (refMethod === 'wallet' && clientUser) {
        clientUser.walletBalance = (clientUser.walletBalance || 0) + refundAmt;
        clientUser.walletTransactions.push({
          type: 'credit',
          amount: refundAmt,
          description: `Refund for returned Order #${returnReq.orderId}`,
          date: new Date(),
          status: 'completed'
        });
        await clientUser.save();
      }

      returnReq.status = 'completed';
      returnReq.timeline.push({
        status: 'completed',
        description: `Refund of ₹${refundAmt} processed successfully via ${refMethod}.`,
        timestamp: new Date()
      });
      await returnReq.save();

      // Update Order
      order.orderStatus = 'returned';
      order.paymentStatus = 'refunded';
      order.trackingUpdates.push({
        status: 'returned',
        description: `Return processed. Refund of ₹${refundAmt} credited.`,
        location: 'Billing Desk',
        timestamp: new Date()
      });
      await order.save();

      // Restore Inventory levels
      for (const item of order.items) {
        const itemSku = item.sku;
        if (itemSku) {
          const inv = await Inventory.findOne({ sku: itemSku });
          if (inv) {
            inv.stockLevel += item.quantity;
            if (order.warehouse) {
              const whStock = inv.warehouseStock.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (w: any) => w.warehouse.toString() === order.warehouse.toString()
              );
              if (whStock) {
                whStock.stock += item.quantity;
              }
            }
            inv.history.push({
              type: 'inward',
              quantity: item.quantity,
              description: `Restored stock from returned Order #${returnReq.orderId}`,
              referenceId: order._id.toString(),
              timestamp: new Date()
            });
            await inv.save();
          }
        }
      }

      // Notification
      await Notification.create({
        user: clientUser?._id,
        type: 'push',
        title: '↩️ Refund Processed!',
        content: `₹${refundAmt.toLocaleString('en-IN')} has been refunded for returned order #${returnReq.orderId.slice(-8).toUpperCase()}.`
      });

      // SMS
      await Notification.create({
        user: clientUser?._id,
        type: 'sms',
        title: 'SMS: Refund Credited',
        content: `NIRA6 REFUND: ₹${refundAmt.toLocaleString('en-IN')} has been credited back to your wallet for order #${returnReq.orderId.slice(-8).toUpperCase()}.`
      });

      // Log Audit
      await logOrderAudit({
        orderId: returnReq.orderId,
        orderObjectId: order._id.toString(),
        eventName: 'return_refunded',
        notes: `Refund of ₹${refundAmt} processed via ${refMethod}. Stock restored to catalog.`,
        operator: user.name,
        role: user.role
      });
    }

    return NextResponse.json({ success: true, returnRequest: returnReq });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
