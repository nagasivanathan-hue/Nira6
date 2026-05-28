import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  zones: [{ type: String }], // e.g., ['Zone A', 'Zone B', 'Zone C']
  active: { type: Boolean, default: true }
}, { timestamps: true });

const Warehouse = mongoose.models.Warehouse || mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;
