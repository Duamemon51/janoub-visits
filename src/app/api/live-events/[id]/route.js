import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import LiveEvent from "@/models/LiveEvent";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { id } = params;
    const event = await LiveEvent.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const result = event.toObject();

    // Convert S3 key to full URL if image exists
    if (result.img) {
      result.img = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.img}`;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
