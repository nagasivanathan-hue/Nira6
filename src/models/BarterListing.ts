import mongoose, { Schema, Document } from 'mongoose';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Barter Listing Model
   Service-for-gear exchange board in Creator Studio
   ═══════════════════════════════════════════════════════════ */

export interface IBarterListing extends Document {
  creatorName: string;
  creatorAvatar: string;
  creatorRating: number;
  offeredService: string;
  requestedGear: string;
  duration: string;
  status: 'active' | 'accepted' | 'countered' | 'expired';
  counterProposal: string;
  createdAt: Date;
}

const BarterListingSchema = new Schema<IBarterListing>({
  creatorName: { type: String, required: true },
  creatorAvatar: { type: String, default: '' },
  creatorRating: { type: Number, default: 4.5 },
  offeredService: { type: String, required: true },
  requestedGear: { type: String, required: true },
  duration: { type: String, required: true },
  status: { type: String, enum: ['active', 'accepted', 'countered', 'expired'], default: 'active', index: true },
  counterProposal: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BarterListing || mongoose.model<IBarterListing>('BarterListing', BarterListingSchema);
