// app/api/admin/bookings/route.js
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    // Build the query object to filter for 'paid' bookings.
    const query = { paymentStatus: "paid" };

    // If an eventId is provided, add it to the query.
    if (eventId) {
      query.eventId = eventId;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    return NextResponse.json(bookings, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch bookings", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}