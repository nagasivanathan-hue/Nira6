import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderId: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  photos: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['pending_approval', 'approved', 'rejected', 'pickup_scheduled', 'in_transit', 'received', 'refund_processed', 'completed'],
    default: 'pending_approval'
  },
  refundAmount: { type: Number, required: true },
  refundMethod: {
    type: String,
    enum: ['wallet', 'original_payment'],
    default: 'wallet'
  },
  pickupCourier: { type: String },
  pickupAWB: { type: String },
  pickupDate: { type: Date },
  adminNotes: { type: String },
  timeline: [{
    status: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const ReturnRequest = mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', returnRequestSchema);
export default ReturnRequest;
