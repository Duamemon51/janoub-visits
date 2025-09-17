import connectToDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDB();
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    return new Response(JSON.stringify(admins), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to fetch admins" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const { name, email, password } = await req.json();

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return new Response(JSON.stringify({ message: "Email already exists" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ name, email, password: hashedPassword, role: "Admin" });

    return new Response(JSON.stringify(newAdmin), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to create admin" }), { status: 500 });
  }
}
