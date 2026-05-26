import mongoose from 'mongoose';

const creativeWorkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  specs: {
    cameraModel: { type: String, default: 'Unknown' },
    lensType: { type: String, default: 'Unknown' },
    aperture: { type: String, default: 'N/A' },
    focalLength: { type: String, default: 'N/A' },
    iso: { type: String, default: 'N/A' },
    shutterSpeed: { type: String, default: 'N/A' },
  },
  lighting: { type: String, default: 'Unknown' }, // e.g. Chiaroscuro, Studio, Golden-Hour
  tags: [{ type: String }], // e.g. ["85mm", "golden-hour", "high-contrast"]
}, { timestamps: true });

creativeWorkSchema.index({ tags: 1 });
creativeWorkSchema.index({ 'specs.lensType': 1 });

const CreativeWork = mongoose.models.CreativeWork || mongoose.model('CreativeWork', creativeWorkSchema);
export default CreativeWork;
