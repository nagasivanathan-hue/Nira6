import mongoose from 'mongoose';

const notedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  notedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const NotedEmail = mongoose.models.NotedEmail || mongoose.model('NotedEmail', notedEmailSchema);
export default NotedEmail;
