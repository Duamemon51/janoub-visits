import connectToDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectToDB();

    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    return Response.json(user);
  } catch (err) {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), { status: 403 });
  }
}
