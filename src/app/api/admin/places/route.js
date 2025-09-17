import connectToDB from "@/lib/mongodb";
import Place from "@/models/Place";
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

export async function GET() {
  await connectToDB();
  const places = await Place.find();

  // Convert image keys to S3 URLs
  const placesWithImg = places.map((pl) => {
    const obj = pl.toObject();
    if (obj.image) {
      obj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.image}`;
    }
    return obj;
  });

  return new Response(JSON.stringify(placesWithImg), { status: 200 });
}

export async function POST(req) {
  await connectToDB();
  const formData = await req.formData();
  const name = formData.get("name");
  const tagline = formData.get("tagline") || "";
  const description = formData.get("description") || "";
  const imageFile = formData.get("image");

  let imgKey = "";

  if (imageFile?.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imgKey = await uploadToS3(
      buffer,
      `places/${Date.now()}-${imageFile.name}`,
      imageFile.type
    );
  }

  const place = await Place.create({
    name,
    tagline,
    description,
    image: imgKey,
  });

  const result = place.toObject();
  if (result.image) {
    result.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.image}`;
  }

  return new Response(JSON.stringify(result), { status: 201 });
}
