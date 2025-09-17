import connectToDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to fetch users" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const { firstName, lastName, email, password, role } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "Email already exists" }), { status: 400 });
    }

    const newUser = await User.create({ firstName, lastName, email, password, role });
    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to create user" }), { status: 500 });
  }
}
