import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;

    // Populate the referenced items
    const booking = await Booking.findById(id)
      .populate("eventId")    // change according to your schema
      .populate("tourId")
      .populate("eatId")
      .populate("featuredId");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (err) {
    console.error("Fetch booking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Your existing PATCH handler
export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const { paymentStatus } = await req.json();

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error("Update booking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
