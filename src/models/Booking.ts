import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageName: { type: String, required: true },
  eventType: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "10:00 AM - 12:00 PM"
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  escrowStatus: {
    type: String,
    enum: ['held', 'disbursed', 'refunded'],
    default: 'held'
  },
  notes: { type: String },
  contractAgreed: { type: Boolean, default: true }
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
