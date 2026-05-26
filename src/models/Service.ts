import mongoose, { Schema, Document } from 'mongoose';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Creator Service Model
   Freelancer service listings (editing, photography, etc.)
   ═══════════════════════════════════════════════════════════ */

export interface IFreelancer {
  name: string;
  avatar: string;
  title: string;
  rating: number;
  completedJobs: number;
  location: string;
  verified: boolean;
  level: 'Rising' | 'Pro' | 'Top Rated' | 'Elite';
}

export interface IService extends Document {
  title: string;
  category: string;
  freelancer: IFreelancer;
  price: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
  active: boolean;
  createdAt: Date;
}

const FreelancerSchema = new Schema<IFreelancer>({
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  title: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  completedJobs: { type: Number, default: 0 },
  location: { type: String, default: 'India' },
  verified: { type: Boolean, default: false },
  level: { type: String, enum: ['Rising', 'Pro', 'Top Rated', 'Elite'], default: 'Rising' },
}, { _id: false });

const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  freelancer: { type: FreelancerSchema, required: true },
  price: { type: Number, required: true },
  deliveryDays: { type: Number, default: 3 },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  image: { type: String, default: '/assets/product-camera.png' },
  description: { type: String, default: '' },
  tags: { type: [String], default: [] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
