import mongoose, { Schema, Document } from 'mongoose';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — OTP Verification Model
   Stores time-limited codes for email & SMS 2FA login
   ═══════════════════════════════════════════════════════════ */

export interface IOTP extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  channel: 'email' | 'sms';
  destination: string; // email address or phone number
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true },
  channel: { type: String, enum: ['email', 'sms'], required: true },
  destination: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index — auto-delete after expiry
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
