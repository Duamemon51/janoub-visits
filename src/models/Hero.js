import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  image: { type: String }, // URL of uploaded image
}, { timestamps: true });

const Hero = mongoose.models.Hero || mongoose.model("Hero", HeroSchema);
export default Hero;
