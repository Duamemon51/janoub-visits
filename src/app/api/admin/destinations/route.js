import connectToDB from "@/lib/mongodb";
import Destination from "@/models/Destination";
import mongoose from "mongoose";
import AWS from "aws-sdk";

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload buffer to S3
async function uploadToS3(buffer, key, contentType = "image/jpeg") {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };
  await s3.upload(params).promise();
  return key; // store only the key in DB
}

// GET all destinations
export async function GET(req) {
  try {
    await connectToDB();

    const url = new URL(req.url);
    const categoryId = url.searchParams.get("category");
    const placeId = url.searchParams.get("place");

    const query = {};
    if (placeId && mongoose.Types.ObjectId.isValid(placeId)) query.placeId = placeId;
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) query.categoryId = categoryId;

    const destinations = await Destination.find(query)
      .populate("placeId", "name")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    // Convert S3 keys to full URLs
    const result = destinations.map(dest => {
      const obj = dest.toObject();
      ["img", "imagesMain", "imagesSmall1", "imagesSmall2", "imagesSmall3"].forEach(field => {
        if (obj[field]) {
          obj[field] = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj[field]}`;
        }
      });
      return obj;
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(JSON.stringify({ message: "Failed to fetch destinations" }), { status: 500 });
  }
}

// POST create destination
export async function POST(req) {
  try {
    await connectToDB();
    const data = await req.formData();

    const title = data.get("title")?.toString();
    const tag = data.get("tag")?.toString();
    const body = data.get("body")?.toString();
    const infoTitle = data.get("infoTitle")?.toString();
    const location = data.get("location")?.toString();
    const ages = data.get("ages")?.toString();
    const activities = data.getAll("activities").map(a => a.toString());
    const hoursValue = data.get("hoursValue")?.toString();
    const closedNow = data.get("closedNow")?.toString();
    const placeId = data.get("placeId")?.toString();
    const categoryId = data.get("categoryId")?.toString();

    if (!title || !tag || !placeId || !categoryId) {
      return new Response(JSON.stringify({ message: "Title, tag, placeId, and categoryId are required" }), { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(placeId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return new Response(JSON.stringify({ message: "Invalid placeId or categoryId" }), { status: 400 });
    }

    const files = ["img", "imagesMain", "imagesSmall1", "imagesSmall2", "imagesSmall3"];
    const uploadedFiles = {};

    for (const field of files) {
      const file = data.get(field);
      if (file?.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        uploadedFiles[field] = await uploadToS3(buffer, `destinations/${Date.now()}_${file.name}`, file.type);
      }
    }

    const newDestination = await Destination.create({
      title,
      tag,
      body,
      infoTitle,
      location,
      ages,
      activities,
      hoursValue,
      closedNow,
      placeId: new mongoose.Types.ObjectId(placeId),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      ...uploadedFiles
    });

    // Convert keys to URLs
    const result = newDestination.toObject();
    files.forEach(field => {
      if (result[field]) {
        result[field] = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result[field]}`;
      }
    });

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(JSON.stringify({ message: "Failed to create destination" }), { status: 500 });
  }
}
