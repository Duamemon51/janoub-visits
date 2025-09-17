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