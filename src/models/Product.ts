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
  originalPrice: { type: Number },
  discount: { type: Number },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 10 },
  emiAvailable: { type: Boolean, default: false },
  specs: { type: Map, of: String },
  stock: { type: Number, default: 1 },
  sku: { type: String, unique: true, sparse: true },
  variants: [{
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    attributes: { type: Map, of: String } // e.g. color: 'Steel Gray', storage: '256GB'
  }],
  weight: { type: Number, default: 1000 }, // in grams, for shipping calculation
  dimensions: {
    length: { type: Number, default: 10 }, // in cm
    width: { type: Number, default: 10 },
    height: { type: Number, default: 10 }
  },
  description: { type: String },
  affiliateUrl: { type: String },
  seller: { type: String, default: 'NIRA6 Certified' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  warranty: { type: String, default: '6 Months NIRA6 Warranty' },
  reviews: [{
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    title: { type: String },
    date: { type: Date, default: Date.now }
  }],
  isArchived: { type: Boolean, default: false },
  tags: [{ type: String }],
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;

