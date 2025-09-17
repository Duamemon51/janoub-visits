import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload function returns only the S3 object key
async function uploadToS3(base64Image: string, key: string) {
  const base64Data = Buffer.from(
    base64Image.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const extension = base64Image.split(";")[0].split("/")[1];
  const objectKey = `${key}.${extension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: objectKey,
    Body: base64Data,
    ContentEncoding: "base64",
    ContentType: `image/${extension}`,
    // ACL removed for bucket with owner enforced
  };

  await s3.upload(params).promise();
  return objectKey; // store only the key in DB
}

// Delete object from S3 by key
async function deleteFromS3(objectKey: string) {
  if (!objectKey) return;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: objectKey,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`Deleted old avatar from S3: ${objectKey}`);
  } catch (err) {
    console.error("Error deleting old avatar from S3:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, newPassword, avatar } = body;

    console.log("Update profile request received");

    // Get JWT token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Connect to DB
    await connectToDB();

    // Find user
    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let avatarKey = user.avatar; // store S3 object key

    // Upload avatar to S3 if it's a new base64 image
    if (avatar && avatar.startsWith("data:image")) {
      console.log("Uploading new avatar to S3");

      // Delete old avatar if exists
      if (avatarKey) {
        await deleteFromS3(avatarKey);
      }

      const fileName = `avatars/${user._id}-${Date.now()}`;
      avatarKey = await uploadToS3(avatar, fileName);
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.avatar = avatarKey; // save only the key in DB

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Construct full URL for frontend
    const avatarFullUrl = avatarKey
      ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${avatarKey}`
      : null;

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: avatarFullUrl,
      },
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { message: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
