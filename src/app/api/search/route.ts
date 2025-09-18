import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";

// ✅ Import models
import Place from "@/models/Place";
import Category from "@/models/Category";
import Eat from "@/models/Eat";
import LiveEvent from "@/models/LiveEvent";
import Tour from "@/models/Tour";
import Destination from "@/models/Destination";

// ✅ S3 URL helper
const s3BaseUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

function getS3Url(key?: string) {
  if (!key) return null;
  if (key.startsWith("http")) return key; // already a URL
  return `${s3BaseUrl}/${key}`;
}

export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // 🔎 Case-insensitive regex
    const regex = new RegExp(query, "i");

    // 🔎 Parallel search in all collections
    const [places, categories, eats, liveEvents, tours, destinations] =
      await Promise.all([
        Place.find({ name: regex }).limit(5).lean(),
        Category.find({ name: regex }).limit(5).lean(),
        Eat.find({ $or: [{ name: regex }, { title: regex }] }).limit(5).lean(),
        LiveEvent.find({ title: regex }).limit(5).lean(),
        Tour.find({ title: regex }).limit(5).lean(),
        Destination.find({ title: regex }).limit(5).lean(),
      ]);

    // ✅ Format + attach type
    const formattedResults = [
      ...places.map((p) => ({
        ...p,
        type: "Place",
        image: getS3Url(p.image),
      })),
      ...categories.map((c) => ({
        ...c,
        type: "Category",
        icon: getS3Url(c.icon),
      })),
      ...eats.map((e) => ({
        ...e,
        type: "Eat",
        images: e.images?.map((img) => getS3Url(img)) || [],
        location: e.location || null,
      })),
      ...liveEvents.map((l) => ({
        ...l,
        type: "LiveEvent",
        img: getS3Url(l.img),
      })),
      ...tours.map((t) => ({
        ...t,
        type: "Tour",
        img: getS3Url(t.img),
      })),
      ...destinations.map((d) => ({
        ...d,
        type: "Destination",
        img: getS3Url(d.img),
        tag: d.tag,
        location: d.location,
      })),
    ];

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error("❌ Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
