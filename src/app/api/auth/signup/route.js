import connectToDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { NextResponse } from "next/server";

// 🔹 Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 🔹 Upload to S3
async function uploadToS3(file, keyPrefix) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const objectKey = `${keyPrefix}/${Date.now()}-${file.name}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: objectKey,
    Body: buffer,
    ContentType: file.type,
  };

  await s3.upload(params).promise();
  return objectKey;
}

// 🔹 Get public URL
function getS3Url(key) {
  if (!key) return null;
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export const POST = async (req) => {
  try {
    await connectToDB();

    const data = await req.formData();
    const firstName = data.get("firstName");
    const lastName = data.get("lastName");
    const email = data.get("email");
    const password = data.get("password");
    const avatarFile = data.get("avatar");

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // 🔹 Upload avatar to S3
    let avatarKey = null;
    if (avatarFile && avatarFile.size > 0) {
      avatarKey = await uploadToS3(avatarFile, "user-avatars");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      avatar: avatarKey, // store S3 key
      resetToken: null,
      resetTokenExpires: null,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        token,
        user: {
          id: user._id,
          firstName,
          lastName,
          email,
          avatar: getS3Url(user.avatar), // return full URL
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("User register error:", err);
    return NextResponse.json(
      { message: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
};
