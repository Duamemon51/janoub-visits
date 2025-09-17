import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import "@/models/User";
// Get all feedbacks (Admin side)
export async function GET() {
  try {
    await connectToDB();
    const feedbacks = await Feedback.find().populate("userId", "firstName lastName email");
    return NextResponse.json(feedbacks, { status: 200 });
  } catch (err) {
    console.error("Feedback fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete feedback by ID
export async function DELETE(req) {
  try {
    await connectToDB();
    const { id } = await req.json();
    await Feedback.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete feedback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
