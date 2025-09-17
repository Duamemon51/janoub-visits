import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'Admin' },
  avatar: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
