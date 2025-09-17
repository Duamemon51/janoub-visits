import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";

export async function PUT(req) {
  try {
    await connectToDB();

    const token = cookies().get("adminToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formData = await req.formData();

    const name = formData.get("name");
    const password = formData.get("password");
    const file = formData.get("avatar");

    const updates = {};

    if (name) updates.name = name;

    // ✅ Password encrypt karke update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // ✅ Avatar upload (agar file bheja ho)
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);

      await writeFile(filePath, buffer);
      updates.avatar = fileName; // sirf filename DB me save hoga
    }

    const admin = await Admin.findByIdAndUpdate(decoded.id, updates, { new: true }).select(
      "name email avatar role"
    );

    return NextResponse.json({ message: "Profile updated", admin }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
