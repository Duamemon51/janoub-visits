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

// POST create category
export async function POST(req) {
  try {
    await connectToDB();
    const formData = await req.formData();
    const name = formData.get("name");
    const tagline = formData.get("tagline");
    const description = formData.get("description");
    const iconFile = formData.get("icon");
    const imageFile = formData.get("image");

    let iconKey = "";
    if (iconFile && iconFile.size > 0) {
      const buffer = Buffer.from(await iconFile.arrayBuffer());
      iconKey = await uploadToS3(buffer, `categories/icon-${Date.now()}-${iconFile.name}`);
    }

    let imageKey = "";
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageKey = await uploadToS3(buffer, `categories/image-${Date.now()}-${imageFile.name}`);
    }

    const category = await Category.create({
      name,
      tagline,
      description,
      icon: iconKey,
      image: imageKey,
    });

    const catObj = category.toObject();
    if (catObj.icon)
      catObj.icon = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.icon}`;
    if (catObj.image)
      catObj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.image}`;

    return NextResponse.json(catObj, { status: 201 });
  } catch (err) {
    console.error("Error creating category:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// PUT update category
export async function PUT(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const formData = await req.formData();
    const name = formData.get("name");
    const tagline = formData.get("tagline");
    const description = formData.get("description");
    const iconFile = formData.get("icon");
    const imageFile = formData.get("image");

    const existingCategory = await Category.findById(id);
    if (!existingCategory)
      return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const updateData = { name, tagline, description };

    if (iconFile && iconFile.size > 0) {
      if (existingCategory.icon) await deleteFromS3(existingCategory.icon);
      const buffer = Buffer.from(await iconFile.arrayBuffer());
      updateData.icon = await uploadToS3(buffer, `categories/icon-${Date.now()}-${iconFile.name}`);
    }

    if (imageFile && imageFile.size > 0) {
      if (existingCategory.image) await deleteFromS3(existingCategory.image);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      updateData.image = await uploadToS3(buffer, `categories/image-${Date.now()}-${imageFile.name}`);
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
    const catObj = updated.toObject();
    if (catObj.icon)
      catObj.icon = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.icon}`;
    if (catObj.image)
      catObj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${catObj.image}`;

    return NextResponse.json(catObj, { status: 200 });
  } catch (err) {
    console.error("Error updating category:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = await Category.findById(id);
    if (category) {
      if (category.icon) await deleteFromS3(category.icon);
      if (category.image) await deleteFromS3(category.image);
      await Category.findByIdAndDelete(id);
    }
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting category:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
