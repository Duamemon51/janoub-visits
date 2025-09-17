import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },          // small icon
  image: { type: String },         // ✅ hero image for the category
  tagline: { type: String },       // category tagline
  description: { type: String },   // category description
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export default Category;
