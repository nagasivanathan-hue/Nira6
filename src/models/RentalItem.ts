import mongoose from 'mongoose';

const rentalItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true, enum: ['cameras', 'lenses', 'drones', 'gimbals', 'lighting', 'microphones', 'accessories'] },
  image: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String, default: '' },

  // Pricing
  dailyRate: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  weeklyRate: { type: Number },
  monthlyRate: { type: Number },
  securityDeposit: { type: Number, required: true },

  // Availability
  available: { type: Boolean, default: true },
  bookedDates: [{ start: Date, end: Date }],
  pickupLocations: [{ type: String }],

  // Technical Filters
  lensMount: { type: String, enum: ['E-mount', 'RF', 'Z', 'X', 'MFT', 'EF', 'PL', 'L-mount', 'F', 'A', 'N/A'], default: 'N/A' },
  sensorType: { type: String, enum: ['Full Frame', 'APS-C', 'Micro 4/3', '1-inch', 'Medium Format', 'Super 35', 'N/A'], default: 'N/A' },
  videoSpecs: { type: String, enum: ['8K', '6K', '5.2K', '4K', '1080p', 'N/A'], default: 'N/A' },

  // Quality & Trust
  conditionScore: { type: Number, min: 0, max: 100, default: 90 },
  shutterCount: { type: Number },
  insuranceAvailable: { type: Boolean, default: true },
  insuranceRate: { type: Number, default: 200 }, // per day

  // Tags & Discovery
  bestFor: [{ type: String }],  // e.g. ['YouTube', 'Weddings', 'Wildlife']
  specs: { type: Map, of: String },

  // Ratings
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  location: { type: String, required: true },
  owner: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Reviews
  reviews: [{
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

rentalItemSchema.index({ brand: 1, category: 1 });
rentalItemSchema.index({ available: 1 });
rentalItemSchema.index({ dailyRate: 1 });

const RentalItem = mongoose.models.RentalItem || mongoose.model('RentalItem', rentalItemSchema);
export default RentalItem;
