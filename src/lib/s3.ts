import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadToS3(base64Image: string, key: string) {
  // Remove "data:image/...;base64," prefix
  const base64Data = Buffer.from(
    base64Image.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const extension = base64Image.split(";")[0].split("/")[1];

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!, // make sure this matches your env variable
    Key: `${key}.${extension}`,
    Body: base64Data,
    ContentEncoding: "base64",
    ContentType: `image/${extension}`,
    // ACL: "public-read", <-- REMOVE THIS
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // returns the public URL of the uploaded image
}
