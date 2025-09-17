import connectToDB from "@/lib/mongodb";
import Hero from "@/models/Hero";
import AWS from "aws-sdk";

// 🔹 Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 🔹 Helper to upload file to S3
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
  return objectKey; // return stored key
}

// 🔹 Helper to build public URL
function getS3Url(key?: string | null) {
  if (!key) return null;
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// ========== GET (list heroes) ==========
export async function GET() {
  await connectToDB();
  const heroes = await Hero.find().sort({ createdAt: -1 });

  // add full S3 URLs
  const heroesWithUrl = heroes.map((h) => ({
    ...h.toObject(),
    image: getS3Url(h.image),
  }));

  return new Response(JSON.stringify(heroesWithUrl), { status: 200 });
}

// ========== POST (create hero) ==========
export async function POST(req: Request) {
  try {
    await connectToDB();

    const data = await req.formData();
    const title = data.get("title") as string;
    const subtitle = data.get("subtitle") as string;
    const imageFile = data.get("image") as File | null;

    if (!title || !subtitle) {
      return new Response(
        JSON.stringify({ message: "Title and subtitle are required" }),
        { status: 400 }
      );
    }

    let imageKey: string | null = null;
    if (imageFile && imageFile.size > 0) {
      imageKey = await uploadToS3(imageFile, "hero-images");
    }

    const hero = new Hero({
      title,
      subtitle,
      image: imageKey, // store key in DB
    });

    await hero.save();

    const heroObj = hero.toObject();
    heroObj.image = getS3Url(hero.image);

    return new Response(JSON.stringify(heroObj), { status: 201 });
  } catch (err: any) {
    console.error("Hero POST error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to create hero" }),
      { status: 500 }
    );
  }
}
