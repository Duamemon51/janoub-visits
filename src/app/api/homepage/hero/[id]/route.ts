import connectToDB from "@/lib/mongodb";
import Hero from "@/models/Hero";
import AWS from "aws-sdk";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 🔹 Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 🔹 Upload to S3
async function uploadToS3(file: File, keyPrefix: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const objectKey = `${keyPrefix}/${Date.now()}-${file.name}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: objectKey,
    Body: buffer,
    ContentType: file.type,
  };

  await s3.upload(params).promise();
  return objectKey;
}

// 🔹 Delete from S3
async function deleteFromS3(key: string) {
  if (!key) return;
  await s3
    .deleteObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    })
    .promise();
}

// 🔹 Get public URL
function getS3Url(key?: string | null) {
  if (!key) return null;
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// ================= UPDATE =================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  const { id } = params;

  const data = await req.formData();
  const title = data.get("title") as string;
  const subtitle = data.get("subtitle") as string;
  const imageFile = data.get("image") as File | null;

  const hero = await Hero.findById(id);
  if (!hero) {
    return NextResponse.json({ message: "Hero not found" }, { status: 404 });
  }

  hero.title = title || hero.title;
  hero.subtitle = subtitle || hero.subtitle;

  // 🔹 If new image uploaded
  if (imageFile && imageFile.size > 0) {
    if (hero.image) {
      await deleteFromS3(hero.image); // delete old image
    }
    const newKey = await uploadToS3(imageFile, "hero-images");
    hero.image = newKey;
  }

  await hero.save();

  const heroObj = hero.toObject();
  heroObj.image = getS3Url(hero.image);

  return NextResponse.json(heroObj, { status: 200 });
}

// ================= DELETE =================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  const { id } = params;

  const hero = await Hero.findById(id);
  if (!hero) {
    return NextResponse.json({ message: "Hero not found" }, { status: 404 });
  }

  if (hero.image) {
    await deleteFromS3(hero.image); // delete from S3
  }

  await Hero.findByIdAndDelete(id);

  return NextResponse.json({ message: "Hero deleted" }, { status: 200 });
}
