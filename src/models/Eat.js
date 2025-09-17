import mongoose from "mongoose";

const EatsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    images: { type: [String], required: true }, // ✅ 4 images

    placeId: { // ✅ reference to Place
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    categoryId: { // ✅ reference to Category
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    description: { type: String },
    location: { type: String },
    hours: { type: String }, // 🕒 opening/closing hours
    price: { type: Number, required: true }, // 💲 price field

    // 👇 Seats information
    totalSeats: { type: Number, default: 0 },        // total seats
    availableSeats: { type: Number, default: 0 },    // remaining seats
    perPersonLimit: { type: Number, default: 1 },    // max seats per person
  },
  { timestamps: true }
);

export default mongoose.models.Eat || mongoose.model("Eat", EatsSchema);
