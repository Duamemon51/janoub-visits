import connectToDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const user = await User.findById(params.id).select("-password");
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to fetch user" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const updates = await req.json();
    const updatedUser = await User.findByIdAndUpdate(params.id, updates, { new: true }).select("-password");
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to update user" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    await User.findByIdAndDelete(params.id);
    return new Response(JSON.stringify({ message: "User deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to delete user" }), { status: 500 });
  }
}
