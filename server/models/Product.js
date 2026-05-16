import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  grade: { type: String, enum: ['Like New', 'Excellent', 'Good', 'Fair'], required: true },
  conditionScore: { type: Number, min: 0, max: 100 },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  specs: { type: Map, of: String },
  stock: { type: Number, default: 1 },
  description: { type: String },
  seller: { type: String, default: 'NIRA6 Certified' },
  warranty: { type: String, default: '6 Months NIRA6 Warranty' }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
