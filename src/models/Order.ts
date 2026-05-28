import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    sku: { type: String, default: '' },
    variant: { type: String, default: '' }
  }],
  totalAmount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponApplied: { type: String, default: '' },
  guestEmail: { type: String },
  guestPhone: { type: String },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  billingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  shippingMethod: { type: String, default: 'Standard' },
  shippingCost: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['razorpay', 'cod', 'emi', 'wallet'], default: 'razorpay' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { 
    type: String, 
    enum: [
      'pending', 'confirmed', 'processing', 'packed', 'shipped', 
      'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 
      'return_requested', 'returned', 'refund_initiated', 'refund_completed'
    ], 
    default: 'pending' 
  },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  deliveryOtp: { type: String },
  otpVerified: { type: Boolean, default: false },
  trackingUpdates: [{
    status: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  returnReason: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;

