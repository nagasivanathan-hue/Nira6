import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Inventory from '@/models/Inventory';
import Warehouse from '@/models/Warehouse';
import Delivery from '@/models/Delivery';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if auth is valid (support admins for status changes)
    const user = await verifyAuth(req);
    const isAdmin = user && user.role === 'admin';

    await dbConnect();
    const { id } = await params;
    const { status, remarks, location } = await req.json();

    const order = await Order.findById(id).populate('items.product');
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    // Track description mapping
    let timelineDesc = remarks || `Order status updated to ${status}`;
    const loc = location || 'Mumbai Central Hub';

    // 1. CONFIRMED status actions
    if (status === 'confirmed') {
      timelineDesc = 'Your order has been verified and confirmed.';
      // Auto-assign a warehouse
      const warehouse = await Warehouse.findOne({ active: true });
      if (warehouse) {
        order.warehouse = warehouse._id;
      }
      
      // Auto-decrement inventory stock levels
      for (const item of order.items) {
        // Find by variant SKU or parent SKU
        const itemSku = item.sku || (item.product as any).sku;
        if (itemSku) {
          const inv = await Inventory.findOne({ sku: itemSku });
          if (inv) {
            inv.stockLevel = Math.max(0, inv.stockLevel - item.quantity);
            // decrement warehouse specific stock if warehouse assigned
            if (order.warehouse) {
              const whStock = inv.warehouseStock.find(
                (w: any) => w.warehouse.toString() === order.warehouse.toString()
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

      // Trigger notification
      await Notification.create({
        user: order.user || undefined,
        type: 'push',
        title: '🎉 Order Confirmed!',
        content: `Order #${order._id.toString().slice(-8).toUpperCase()} has been confirmed. Fulfillment starts shortly.`
      });
    }

    // 2. PROCESSING status actions
    else if (status === 'processing') {
      timelineDesc = 'Fulfillment picker request generated. Locating items on shelves.';
    }

    // 3. PACKED status actions
    else if (status === 'packed') {
      timelineDesc = 'Quality inspection passed. Items sealed & packed.';
    }

    // 4. SHIPPED status actions
    else if (status === 'shipped') {
      timelineDesc = 'Courier partner assigned. Tracking code generated.';
      
      // Generate a mock tracking code and assign NIRA Express delivery
      const trackingNumber = `NIRA-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const courierPartner = 'NIRA Express';
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);

      let delivery = await Delivery.findOne({ order: order._id });
      if (!delivery) {
        delivery = new Delivery({
          order: order._id,
          courierPartner,
          trackingNumber,
          estimatedDeliveryDate,
          shippingCost: order.shippingCost || 120,
          status: 'dispatched',
          routeHistory: [{
            status: 'dispatched',
            description: 'Package received at Hub logistics desk.',
            location: loc,
            timestamp: new Date()
          }],
          deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
          codAmount: order.paymentMethod === 'cod' ? order.totalAmount : 0
        });
        await delivery.save();
      }

      order.deliveryOtp = delivery.deliveryOtp;

      await Notification.create({
        user: order.user || undefined,
        type: 'push',
        title: '📦 Order Shipped!',
        content: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been shipped via ${courierPartner}. Track: ${trackingNumber}`
      });

      // Simulated SMS notification
      await Notification.create({
        user: order.user || undefined,
        type: 'sms',
        title: 'SMS: Order Shipped',
        content: `NIRA6: Package for Order #${order._id.toString().slice(-8).toUpperCase()} is shipped via ${courierPartner} (AWB: ${trackingNumber}). Est delivery: ${estimatedDeliveryDate.toDateString()}`
      });
    }

    // 5. IN TRANSIT status actions
    else if (status === 'in_transit') {
      timelineDesc = remarks || 'Package is in transit between shipping hubs.';
      const delivery = await Delivery.findOne({ order: order._id });
      if (delivery) {
        delivery.status = 'in_transit';
        delivery.routeHistory.push({
          status: 'in_transit',
          description: timelineDesc,
          location: loc,
          timestamp: new Date()
        });
        await delivery.save();
      }
    }

    // 6. OUT FOR DELIVERY status actions
    else if (status === 'out_for_delivery') {
      timelineDesc = 'Package has arrived at local hub and is out for delivery.';
      const delivery = await Delivery.findOne({ order: order._id });
      if (delivery) {
        delivery.status = 'out_for_delivery';
        delivery.routeHistory.push({
          status: 'out_for_delivery',
          description: 'Delivery executive is en route with your package.',
          location: loc,
          timestamp: new Date()
        });
        await delivery.save();
      }

      // Push notification
      await Notification.create({
        user: order.user || undefined,
        type: 'push',
        title: '🚚 Out For Delivery!',
        content: `Delivery agent is out with order #${order._id.toString().slice(-8).toUpperCase()}. Share OTP: ${order.deliveryOtp || '1234'} to verify.`
      });

      // SMS OTP notification
      await Notification.create({
        user: order.user || undefined,
        type: 'sms',
        title: 'SMS: Out for Delivery OTP',
        content: `NIRA6: Order #${order._id.toString().slice(-8).toUpperCase()} is out for delivery. Tell the delivery agent OTP ${order.deliveryOtp || '1234'} to confirm. COD due: ₹${order.paymentMethod === 'cod' ? order.totalAmount : 0}.`
      });
    }

    // 7. DELIVERED status actions
    else if (status === 'delivered') {
      timelineDesc = 'Delivered successfully. Thank you for shopping with NIRA6!';
      order.paymentStatus = 'completed';
      order.otpVerified = true;

      const delivery = await Delivery.findOne({ order: order._id });
      if (delivery) {
        delivery.status = 'delivered';
        delivery.actualDeliveryDate = new Date();
        delivery.otpVerified = true;
        if (order.paymentMethod === 'cod') {
          delivery.codCollected = true;
        }
        delivery.routeHistory.push({
          status: 'delivered',
          description: 'Package delivered safely.',
          location: loc,
          timestamp: new Date()
        });
        await delivery.save();
      }

      await Notification.create({
        user: order.user || undefined,
        type: 'push',
        title: '🎉 Order Delivered!',
        content: `Order #${order._id.toString().slice(-8).toUpperCase()} has been successfully delivered. Please review your gear!`
      });
    }

    // 8. CANCELLED status actions
    else if (status === 'cancelled') {
      timelineDesc = remarks || 'Order cancelled by customer or support executive.';
      
      // Restore stock levels
      for (const item of order.items) {
        const itemSku = item.sku || (item.product as any).sku;
        if (itemSku) {
          const inv = await Inventory.findOne({ sku: itemSku });
          if (inv) {
            inv.stockLevel = inv.stockLevel + item.quantity;
            if (order.warehouse) {
              const whStock = inv.warehouseStock.find(
                (w: any) => w.warehouse.toString() === order.warehouse.toString()
              );
              if (whStock) {
                whStock.stock = whStock.stock + item.quantity;
              }
            }
            inv.history.push({
              type: 'inward',
              quantity: item.quantity,
              description: `Restored stock from cancelled Order #${order._id.toString().slice(-8).toUpperCase()}`,
              referenceId: order._id.toString(),
              timestamp: new Date()
            });
            await inv.save();
          }
        }
      }

      // If paid via payment gateway or wallet, initiate refund to wallet
      if (order.paymentStatus === 'completed' && order.user) {
        const dbUser = await User.findById(order.user);
        if (dbUser) {
          dbUser.walletBalance = (dbUser.walletBalance || 0) + order.totalAmount;
          dbUser.walletTransactions.push({
            type: 'credit',
            amount: order.totalAmount,
            description: `Refund for Cancelled Order #${order._id.toString().slice(-8).toUpperCase()}`,
            date: new Date(),
            status: 'completed'
          });
          await dbUser.save();
        }
        order.paymentStatus = 'refunded';
      }

      await Notification.create({
        user: order.user || undefined,
        type: 'push',
        title: '⚠️ Order Cancelled',
        content: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled.`
      });
    }

    // 9. RETURN REQUESTED status actions
    else if (status === 'return_requested') {
      timelineDesc = remarks || 'Return inspection request submitted by customer.';
    }

    // 10. REFUND INITIATED status actions
    else if (status === 'refund_initiated') {
      timelineDesc = 'Fulfillment warehouse inspection passed. Refund process initiated.';
      order.paymentStatus = 'refunded';
    }

    // 11. REFUND COMPLETED status actions
    else if (status === 'refund_completed') {
      timelineDesc = 'Refund transaction fully settled back to NIRA Wallet.';
      order.paymentStatus = 'refunded';
      
      // Transfer money back to wallet
      if (order.user) {
        const dbUser = await User.findById(order.user);
        if (dbUser) {
          dbUser.walletBalance = (dbUser.walletBalance || 0) + order.totalAmount;
          dbUser.walletTransactions.push({
            type: 'credit',
            amount: order.totalAmount,
            description: `Full refund for returned Order #${order._id.toString().slice(-8).toUpperCase()}`,
            date: new Date(),
            status: 'completed'
          });
          await dbUser.save();
        }
      }

      // Restore inventory
      for (const item of order.items) {
        const itemSku = item.sku || (item.product as any).sku;
        if (itemSku) {
          const inv = await Inventory.findOne({ sku: itemSku });
          if (inv) {
            inv.stockLevel = inv.stockLevel + item.quantity;
            if (order.warehouse) {
              const whStock = inv.warehouseStock.find(
                (w: any) => w.warehouse.toString() === order.warehouse.toString()
              );
              if (whStock) {
                whStock.stock = whStock.stock + item.quantity;
              }
            }
            inv.history.push({
              type: 'return',
              quantity: item.quantity,
              description: `Restored stock from returned Order #${order._id.toString().slice(-8).toUpperCase()}`,
              referenceId: order._id.toString(),
              timestamp: new Date()
            });
            await inv.save();
          }
        }
      }

      await Notification.create({
        user: order.user || undefined,
        type: 'push',
        title: '↩️ Refund Completed!',
        content: `₹${order.totalAmount.toLocaleString('en-IN')} has been refunded back to your wallet for returned order #${order._id.toString().slice(-8).toUpperCase()}.`
      });

      await Notification.create({
        user: order.user || undefined,
        type: 'sms',
        title: 'SMS: Refund Completed',
        content: `NIRA6 REFUND: ₹${order.totalAmount.toLocaleString('en-IN')} credited back to your NIRA Wallet for returned order #${order._id.toString().slice(-8).toUpperCase()}.`
      });
    }

    // Append update to order tracking timeline
    order.trackingUpdates.push({
      status,
      description: timelineDesc,
      location: loc,
      timestamp: new Date()
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Status transitioned from ${previousStatus} to ${status}.`,
      order
    });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
