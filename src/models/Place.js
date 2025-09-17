import mongoose from "mongoose";

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, 
  tagline: { type: String },       // ✅ Short tagline for hero section
  description: { type: String },   // ✅ Long description for about section
});

const Place = mongoose.models.Place || mongoose.model("Place", PlaceSchema);
export default Place;
