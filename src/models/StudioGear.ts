import mongoose, { Schema, Document } from 'mongoose';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Studio Gear Inventory Model
   Equipment items available in Creator Studio
   ═══════════════════════════════════════════════════════════ */

export interface IStudioGear extends Document {
  name: string;
  category: 'camera' | 'lens' | 'lighting' | 'audio';
  image: string;
  buyPrice: number;
  rentRate: number;
  brand: string;
  description: string;
  specs: Record<string, string>;
  inStock: boolean;
  createdAt: Date;
}

const StudioGearSchema = new Schema<IStudioGear>({
  name: { type: String, required: true },
  category: { type: String, enum: ['camera', 'lens', 'lighting', 'audio'], required: true, index: true },
  image: { type: String, default: '/assets/product-camera.png' },
  buyPrice: { type: Number, required: true },
  rentRate: { type: Number, required: true },
  brand: { type: String, default: '' },
  description: { type: String, default: '' },
  specs: { type: Schema.Types.Mixed, default: {} },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.StudioGear || mongoose.model<IStudioGear>('StudioGear', StudioGearSchema);
