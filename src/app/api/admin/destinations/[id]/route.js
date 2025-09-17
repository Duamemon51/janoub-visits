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
  return key;
}

// Delete object from S3
async function deleteFromS3(key) {
  if (!key) return;
  try {
    await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key }).promise();
    console.log(`Deleted S3 object: ${key}`);
  } catch (err) {
    console.error("Error deleting S3 object:", err);
  }
}

// PUT update destination
export async function PUT(req, { params }) {
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

    if (!title || !tag) {
      return new Response(JSON.stringify({ message: "Title and tag are required" }), { status: 400 });
    }

    const updateData = { title, tag, body, infoTitle, location, ages, activities, hoursValue, closedNow };

    if (placeId && mongoose.Types.ObjectId.isValid(placeId)) {
      updateData.placeId = new mongoose.Types.ObjectId(placeId);
    }
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      updateData.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    const existing = await Destination.findById(params.id);
    if (!existing) return new Response(JSON.stringify({ message: "Destination not found" }), { status: 404 });

    const files = ["img", "imagesMain", "imagesSmall1", "imagesSmall2", "imagesSmall3"];
    for (const field of files) {
      const file = data.get(field);
      if (file?.size > 0) {
        // Delete old S3 object
        if (existing[field]) await deleteFromS3(existing[field]);

        // Upload new file
        const buffer = Buffer.from(await file.arrayBuffer());
        updateData[field] = await uploadToS3(buffer, `destinations/${Date.now()}_${file.name}`, file.type);
      }
    }

    const updated = await Destination.findByIdAndUpdate(params.id, updateData, { new: true });

    // Convert S3 keys to URLs for response
    const result = updated.toObject();
    files.forEach(field => {
      if (result[field]) {
        result[field] = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result[field]}`;
      }
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to update destination" }), { status: 500 });
  }
}

// DELETE destination
export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const dest = await Destination.findById(params.id);
    if (!dest) return new Response(JSON.stringify({ message: "Destination not found" }), { status: 404 });

    const files = ["img", "imagesMain", "imagesSmall1", "imagesSmall2", "imagesSmall3"];
    for (const field of files) {
      if (dest[field]) await deleteFromS3(dest[field]);
    }

    await Destination.findByIdAndDelete(params.id);
    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to delete destination" }), { status: 500 });
  }
}
