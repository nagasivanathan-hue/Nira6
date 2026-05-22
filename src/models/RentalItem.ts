import mongoose from 'mongoose';

const rentalItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  dailyRate: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  available: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  location: { type: String, required: true },
  owner: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const RentalItem = mongoose.models.RentalItem || mongoose.model('RentalItem', rentalItemSchema);
export default RentalItem;
