import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    // Existing fields
    title: { type: String, required: true },
    img: { type: String, required: true },
    tag: { type: String, required: true },

       placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
categoryId: {                // ✅ Add category reference
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",           // make sure you have a Category model
      required: true,
    },


    // New About/Body fields
    body: { type: String },
    imagesMain: { type: String },
    imagesSmall1: { type: String },
    imagesSmall2: { type: String },
    imagesSmall3: { type: String },

    // Info Card fields
    infoTitle: { type: String },
    location: { type: String },
    ages: { type: String },
    activities: [{ type: String }], // array of tags like ['SHOPPING', 'DINING']
    hoursValue: { type: String },
    closedNow: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Destination || mongoose.model("Destination", destinationSchema);
