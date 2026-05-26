import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  roleNeeded: { type: String, required: true }, // e.g. Colorist, DP, Editor
  locationType: { type: String, enum: ['Remote', 'On-Site'], default: 'Remote' },
  location: { type: String }, // e.g. Madurai, Mumbai
  budget: { type: String, default: 'Unpaid / Collaboration' },
  projectType: { type: String, default: 'Short Film' }, // e.g. Music Video, Commercial
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Open', 'Filled', 'Closed'], default: 'Open' }
}, { timestamps: true });

const Collaboration = mongoose.models.Collaboration || mongoose.model('Collaboration', collaborationSchema);
export default Collaboration;
