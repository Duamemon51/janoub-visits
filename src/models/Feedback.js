import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// Duplicate model problem se bachne ke liye
export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
