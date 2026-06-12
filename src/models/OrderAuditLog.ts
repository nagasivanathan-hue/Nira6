import mongoose from 'mongoose';

const orderAuditLogSchema = new mongoose.Schema({
  orderId: { type: String, required: true, index: true },
  orderObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false },
  eventName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String, required: true },
  operator: { type: String, default: 'System' },
  role: { type: String, default: 'system' },
  ipAddress: { type: String, default: '127.0.0.1' }
}, { timestamps: true });

const OrderAuditLog = mongoose.models.OrderAuditLog || mongoose.model('OrderAuditLog', orderAuditLogSchema);
export default OrderAuditLog;
