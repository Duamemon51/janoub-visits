import Eat from "@/models/Eat";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Convert key -> full S3 URL
function s3Url(key) {
  return key
    ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    : "";
}

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const featuredId = url.searchParams.get("featured");

    let eatsQuery;

    if (featuredId) {
      if (!mongoose.Types.ObjectId.isValid(featuredId)) {
        return NextResponse.json(
          { success: false, error: "Invalid featured ID" },
          { status: 400 }
        );
      }

      eatsQuery = await Eat.find({ _id: new mongoose.Types.ObjectId(featuredId) })
        .populate("categoryId", "name")
        .populate("placeId", "name");
    } else {
      eatsQuery = await Eat.find({})
        .populate("categoryId", "name")
        .populate("placeId", "name")
        .sort({ createdAt: 1 });
    }

    const formatted = eatsQuery.map((eat) => {
      const images = eat.images?.length
        ? eat.images.map((key) => s3Url(key))
        : ["/default.png"];

      return {
        title: eat.name,
        img: images[0], // first image as cover
        location: eat.location,
        price: eat.price,
        hours: eat.hours,
        category: eat.categoryId?.name || "",
        place: eat.placeId?.name || "",
        description: eat.description,
        _id: eat._id.toString(),
        images,
        availableSeats: eat.availableSeats ?? 0,
        perPersonLimit: eat.perPersonLimit ?? 1,
      };
    });

    return NextResponse.json({ success: true, eats: formatted }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
