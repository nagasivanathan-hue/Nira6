import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, index: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'creator', 'admin', 'super_admin', 'order_manager', 'support_agent', 'customer'], default: 'user', index: true },
  walletBalance: { type: Number, default: 0 },
  walletTransactions: [{
    type: { type: String, enum: ['credit', 'debit'] },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'completed' }
  }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  adminApprovedByOwner: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  lastLoginIp: { type: String },
  lastLoginDevice: { type: String },
  lastLoginAt: { type: Date }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
