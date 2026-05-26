import mongoose from 'mongoose';

const capabilitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  iconName: { type: String, required: true }, // e.g. 'Clapperboard', 'Compass', 'DollarSign', 'Cpu', 'Activity', 'Layers'
  glow: { type: String, required: true }, // tailwind class string for gradients
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Capability = mongoose.models.Capability || mongoose.model('Capability', capabilitySchema);
export default Capability;
