import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Place from "@/models/Place";

export async function GET(req, { params }) {
  await connectToDB();

  try {
    const place = await Place.findById(params.id);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const obj = place.toObject();

    // If image is stored as a key, convert to full S3 URL
    if (obj.image) {
      obj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.image}`;
    }

    return NextResponse.json(obj, { status: 200 });
  } catch (error) {
    console.error("Error fetching place:", error);
    return NextResponse.json(
      { error: "Failed to fetch place" },
      { status: 500 }
    );
  }
}
