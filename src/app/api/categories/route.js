import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Category from "@/models/Category";
import AWS from "aws-sdk";

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload buffer to S3 and return object key
async function uploadToS3(buffer, key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg", // adjust based on file type
  };
  await s3.upload(params).promise();
  return key; // store only the key in DB
}

// Delete object from S3 by key
async function deleteFromS3(objectKey) {
  if (!objectKey) return;
  try {
    await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: objectKey }).promise();
    console.log(`Deleted S3 object: ${objectKey}`);
  } catch (err) {
    console.error("Error deleting S3 object:", err);
  }
}

// GET all categories
export async function GET() {
  try {
    await connectToDB();
    const categories = await Category.find();
    const result = categories.map(cat => {
      const catObj = cat.toObject();
      if (catObj.icon)
        catObj.icon = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.icon}`;
      if (catObj.image)
        catObj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.image}`;
      return catObj;
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
