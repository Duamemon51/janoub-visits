// app/api/destinations/route.js
import connectToDB from "@/lib/mongodb";
import Destination from "@/models/Destination";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectToDB();

  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("place");
    const categoryId = searchParams.get("category");

    const filter = {};
    if (placeId) filter.placeId = placeId;
    if (categoryId) filter.categoryId = categoryId;

    const destinations = await Destination.find(filter)
      .populate("categoryId", "name") // populate category name
      .sort({ createdAt: -1 });

    // Convert S3 keys to URLs if your images are stored in S3
    const result = destinations.map(dest => {
      const obj = dest.toObject();
      ["img", "imagesMain", "imagesSmall1", "imagesSmall2", "imagesSmall3"].forEach(field => {
        if (obj[field]) {
          obj[field] = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj[field]}`;
        }
      });
      return obj;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
