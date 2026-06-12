import mongoose from 'mongoose';

const adminActivityLogSchema = new mongoose.Schema({
  adminEmail: { type: String, required: true, index: true },
  action: { type: String, required: true }, // e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'PRODUCT_CREATE', 'PRODUCT_EDIT', 'INVENTORY_ADJUST', 'REFUND_APPROVE', 'SETTINGS_UPDATE'
  details: { type: String },
  ipAddress: { type: String },
  device: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const AdminActivityLog = mongoose.models.AdminActivityLog || mongoose.model('AdminActivityLog', adminActivityLogSchema);
export default AdminActivityLog;
