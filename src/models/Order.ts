import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
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
  paymentMethod: { type: String, enum: ['razorpay', 'cod', 'emi', 'wallet'], default: 'razorpay' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'], default: 'processing' },
  returnReason: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
