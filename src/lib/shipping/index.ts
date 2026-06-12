import dbConnect from '../db/mongodb';
import Order from '@/models/Order';
import { logOrderAudit } from '../orderUtils';

export interface CourierService {
  partner: 'Shiprocket' | 'Delhivery' | 'Blue Dart' | 'DTDC' | 'XpressBees' | 'Ecom Express';
  serviceName: string;
  rate: number;
  estimatedDays: number;
}

export interface ShipmentResult {
  success: boolean;
  courierPartner: string;
  trackingNumber: string;
  estimatedDeliveryDate: Date;
  shippingLabelUrl: string;
}

export interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  timestamp: Date;
}

const COURIER_PARTNERS = [
  { name: 'Shiprocket', service: 'Air Cargo Premium', baseRate: 150, minDays: 2, maxDays: 3 },
  { name: 'Delhivery', service: 'Delhivery Direct', baseRate: 110, minDays: 3, maxDays: 5 },
  { name: 'Blue Dart', service: 'Dart Apex', baseRate: 220, minDays: 1, maxDays: 2 },
  { name: 'DTDC', service: 'DTDC Lite', baseRate: 120, minDays: 3, maxDays: 4 },
  { name: 'XpressBees', service: 'XpressBees Priority', baseRate: 100, minDays: 4, maxDays: 6 },
  { name: 'Ecom Express', service: 'Ecom Saver', baseRate: 95, minDays: 4, maxDays: 7 }
] as const;

export class ShippingService {
  /**
   * Fetch rates and estimated delivery times for all available couriers
   */
  static async getCourierEstimates(pincode: string, weightKg = 1.5): Promise<CourierService[]> {
    // Generate estimates dynamically based on pincode distance (simulated by last digit)
    const pinFactor = Number(pincode.slice(-1)) || 5;
    
    return COURIER_PARTNERS.map(partner => {
      const rate = partner.baseRate + (weightKg * 15) + (pinFactor * 4);
      const estimatedDays = Math.max(partner.minDays, Math.round(partner.minDays + (pinFactor / 3)));
      return {
        partner: partner.name,
        serviceName: partner.service,
        rate: Math.round(rate),
        estimatedDays
      };
    });
  }

  /**
   * Create shipment with selected courier, generating mock waybill (AWB) and label
   */
  static async createShipment(
    orderObjectId: string,
    orderId: string,
    partnerName: string
  ): Promise<ShipmentResult> {
    const courier = COURIER_PARTNERS.find(c => c.name === partnerName) || COURIER_PARTNERS[0];
    const prefix = courier.name.slice(0, 3).toUpperCase();
    const trackingNumber = `${prefix}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + courier.minDays);
    
    // Simulate invoice and shipping label URL
    const shippingLabelUrl = `/api/orders/${orderObjectId}/label?awb=${trackingNumber}`;

    await dbConnect();
    const order = await Order.findById(orderObjectId);
    if (order) {
      order.courierPartner = courier.name;
      order.trackingNumber = trackingNumber;
      order.estimatedDeliveryDate = estimatedDeliveryDate;
      order.shippingLabelUrl = shippingLabelUrl;
      order.orderStatus = 'shipped';
      
      // Add timeline event
      order.trackingUpdates.push({
        status: 'shipped',
        description: `Shipment package picked up by courier partner ${courier.name}. Waybill Generated.`,
        location: order.shippingAddress?.city || 'Warehouse Hub',
        timestamp: new Date()
      });
      await order.save();

      // Log Audit Trail
      await logOrderAudit({
        orderId,
        orderObjectId,
        eventName: 'shipment_dispatched',
        notes: `Courier ${courier.name} assigned with AWB: ${trackingNumber}. Est delivery: ${estimatedDeliveryDate.toDateString()}`,
        operator: 'System Fulfillment Coordinator'
      });
    }

    return {
      success: true,
      courierPartner: courier.name,
      trackingNumber,
      estimatedDeliveryDate,
      shippingLabelUrl
    };
  }

  /**
   * Simulate a status webhook update from a courier partner
   */
  static async triggerWebhookUpdate(
    trackingNumber: string,
    status: 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled',
    location: string,
    remarks?: string
  ): Promise<boolean> {
    await dbConnect();
    const order = await Order.findOne({ trackingNumber });
    if (!order) return false;

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    let desc = remarks || `Package status updated to ${status} by courier partner.`;
    if (status === 'in_transit') {
      desc = remarks || 'Package is in transit between shipping sorting hubs.';
    } else if (status === 'out_for_delivery') {
      desc = remarks || `Out for delivery. Share OTP ${order.deliveryOtp || '1234'} with delivery agent.`;
    } else if (status === 'delivered') {
      desc = remarks || 'Package delivered and signature verified.';
      order.paymentStatus = 'completed';
      order.actualDeliveryDate = new Date();
    }

    order.trackingUpdates.push({
      status,
      description: desc,
      location,
      timestamp: new Date()
    });

    await order.save();

    // Log Audit Trail
    await logOrderAudit({
      orderId: order.orderId || `order-${order._id}`,
      orderObjectId: order._id.toString(),
      eventName: `courier_status_${status}`,
      notes: `Courier status synced: ${status}. Current location: ${location}. Message: ${desc}`,
      operator: `${order.courierPartner || 'Courier'} API Webhook`
    });

    return true;
  }
}
