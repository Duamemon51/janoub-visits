import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

export async function POST(req) {
  try {
    await connectToDB();

    const { userId, message } = await req.json();

    if (!userId || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const feedback = await Feedback.create({ userId, message });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (err) {
    console.error("Feedback save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
