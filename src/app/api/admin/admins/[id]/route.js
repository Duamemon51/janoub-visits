import connectToDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const { name, email, password } = await req.json();
    const updateData = { name, email };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(params.id, updateData, { new: true }).select("-password");

    return new Response(JSON.stringify(updatedAdmin), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to update admin" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    await Admin.findByIdAndDelete(params.id);
    return new Response(JSON.stringify({ message: "Admin deleted successfully" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Failed to delete admin" }), { status: 500 });
  }
}
