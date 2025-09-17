// app/api/destinations/[id]/route.ts
import connectToDB from "@/lib/mongodb";
import Destination from "@/models/Destination";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    await connectToDB();
    const destination = await Destination.findById(id)
      .populate("categoryId", "name")
      .populate("placeId", "name");

    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    const result = destination.toObject();

    // Convert S3 keys to URLs
    ["img", "imagesMain", "imagesSmall1", "imagesSmall2", "imagesSmall3"].forEach(field => {
      if (result[field]) {
        result[field] = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result[field]}`;
      }
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET Destination Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch destination" },
      { status: 500 }
    );
  }
}
