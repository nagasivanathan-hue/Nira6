import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  category: {
    type: String,
    enum: ['photographer', 'videographer', 'editor', 'drone_operator', 'model', 'studio', 'makeup_artist', 'anchor', 'decorator', 'video_editing', 'photo_editing', 'photography', 'videography', 'thumbnail_design', 'drone_piloting', 'color_grading', 'motion_graphics'],
    required: true,
    index: true
  },
  secondarySkills: { type: [String], default: [] },
  businessName: { type: String },
  gstNumber: { type: String },
  teamSize: { type: Number, default: 1 },
  availableForTravel: { type: Boolean, default: true },
  serviceRadius: { type: Number, default: 50 }, // in km
  workingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  govtIdUrl: { type: String },
  selfieUrl: { type: String },
  acceptTerms: { type: Boolean, default: false },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  location: { type: String, required: true, index: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  rating: { type: Number, default: 5.0, index: true },
  reviewCount: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  startingPrice: { type: Number, required: true, index: true },
  hourlyRate: { type: Number, required: true },
  availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  verified: { type: Boolean, default: false, index: true },
  verificationLevel: { type: String, enum: ['none', 'basic', 'id_verified', 'pro', 'elite'], default: 'none' },
  trustScore: { type: Number, default: 100 },
  portfolio: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  styles: { type: [String], default: [] },
  gear: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  experience: { type: Number, default: 1 },
  responseTime: { type: String, default: 'Within 2 hours' },
  featured: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  socialLinks: {
    instagram: { type: String },
    youtube: { type: String },
    website: { type: String },
    behance: { type: String }
  }
}, { timestamps: true });

// Setup 2dsphere index on coordinates
creatorProfileSchema.index({ coordinates: '2dsphere' });

const CreatorProfile = mongoose.models.CreatorProfile || mongoose.model('CreatorProfile', creatorProfileSchema);
export default CreatorProfile;
