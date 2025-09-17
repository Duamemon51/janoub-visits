import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    avatar: { type: String, default: '' }, // ✅ avatar field

    // 🔹 Password Reset fields
   resetToken: { type: String },              // 👈 added
  resetTokenExpires: { type: Date },  
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
