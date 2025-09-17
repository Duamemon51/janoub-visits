import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveEvent", // event ke liye
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour", // tour ke liye
    },
    eatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Eat", // eat ke liye
    },
    featuredId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Eat", // featured Eat ke liye (agar direct featuredId use ho)
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Extra user details
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ["standard", "vip", "vvip"],
      default: "standard",
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ Custom validation: at least one of eventId, tourId, eatId, or featuredId must exist
BookingSchema.pre("validate", function (next) {
  if (!this.eventId && !this.tourId && !this.eatId && !this.featuredId) {
    return next(
      new Error("Booking must have either an eventId, tourId, eatId, or featuredId.")
    );
  }
  next();
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
