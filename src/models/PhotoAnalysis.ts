import mongoose, { Schema, Document } from 'mongoose';

export interface IPhotoAnalysis extends Document {
  imageUrl: string;
  cameraModel: string;
  lensModel: string;
  aperture: string;
  iso: string;
  shutterSpeed: string;
  focalLength: string;
  lightingType: string;
  editingStyle: string;
  photographyStyle: string;
  difficultyLevel: string;
  confidenceScore: string;
  recreationTips: string[];
  beginnerTips: string[];
  createdAt: Date;
}

const PhotoAnalysisSchema: Schema = new Schema({
  imageUrl: { type: String, required: true },
  cameraModel: { type: String, default: 'Unknown' },
  lensModel: { type: String, default: 'Unknown' },
  aperture: { type: String, default: 'Unknown' },
  iso: { type: String, default: 'Unknown' },
  shutterSpeed: { type: String, default: 'Unknown' },
  focalLength: { type: String, default: 'Unknown' },
  lightingType: { type: String, default: 'Unknown' },
  editingStyle: { type: String, default: 'Unknown' },
  photographyStyle: { type: String, default: 'Unknown' },
  difficultyLevel: { type: String, default: 'Unknown' },
  confidenceScore: { type: String, default: '50%' },
  recreationTips: { type: [String], default: [] },
  beginnerTips: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PhotoAnalysis || mongoose.model<IPhotoAnalysis>('PhotoAnalysis', PhotoAnalysisSchema);
