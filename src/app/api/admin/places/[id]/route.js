import connectToDB from "@/lib/mongodb";
import Place from "@/models/Place";
import AWS from "aws-sdk";

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

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

async function deleteFromS3(key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };
  await s3.deleteObject(params).promise();
}

export async function GET(req, { params }) {
  await connectToDB();
  const { id } = params;
  const place = await Place.findById(id);

  if (!place) return new Response("Place not found", { status: 404 });

  const obj = place.toObject();
  if (obj.image) {
    obj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.image}`;
  }

  return new Response(JSON.stringify(obj), { status: 200 });
}

export async function PUT(req, { params }) {
  await connectToDB();
  const { id } = params;
  const formData = await req.formData();

  const name = formData.get("name");
  const tagline = formData.get("tagline") || "";
  const description = formData.get("description") || "";
  const imageFile = formData.get("image");

  const place = await Place.findById(id);
  if (!place) return new Response("Place not found", { status: 404 });

  place.name = name || place.name;
  place.tagline = tagline;
  place.description = description;

  if (imageFile?.size > 0) {
    // delete old image if exists
    if (place.image) {
      await deleteFromS3(place.image);
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const newKey = `places/${Date.now()}-${imageFile.name}`;
    await uploadToS3(buffer, newKey, imageFile.type);
    place.image = newKey;
  }

  await place.save();

  const result = place.toObject();
  if (result.image) {
    result.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.image}`;
  }

  return new Response(JSON.stringify(result), { status: 200 });
}

export async function DELETE(req, { params }) {
  await connectToDB();
  const { id } = params;

  const place = await Place.findById(id);
  if (!place) return new Response("Place not found", { status: 404 });

  if (place.image) {
    await deleteFromS3(place.image);
  }

  await Place.findByIdAndDelete(id);
  return new Response(
    JSON.stringify({ message: "Place deleted successfully" }),
    { status: 200 }
  );
}
