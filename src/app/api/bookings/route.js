import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import LiveEvent from "@/models/LiveEvent";
import Tour from "@/models/Tour";
import Eat from "@/models/Eat";

// ---------------- GET ----------------
export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const tourId = searchParams.get("tourId");
    const eatId = searchParams.get("eatId");
    const featuredId = searchParams.get("featuredId");
    const userId = searchParams.get("userId");

    let query = {};
    if (userId) query.userId = userId;
    if (eventId) query.eventId = eventId;
    else if (tourId) query.tourId = tourId;
    else if (eatId) query.eatId = eatId;
    else if (featuredId) query.featuredId = featuredId;

    console.log("📌 GET bookings query:", query);

    const bookings = await Booking.find(query)
      .populate("eventId")
      .populate("tourId")
      .populate("eatId")
      .populate("featuredId");

    return NextResponse.json(bookings, { status: 200 });
  } catch (err) {
    console.error("❌ Failed to fetch bookings", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------- POST ----------------
export async function POST(req) {
  await connectToDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let {
      eventId,
      tourId,
      eatId,
      featuredId,
      userId,
      tier,
      qty,
      total,
      userName,
      userEmail,
      userPhone,
    } = await req.json();

    console.log("📥 Incoming booking data:", {
      eventId,
      tourId,
      eatId,
      featuredId,
      userId,
      qty,
      total,
    });

    // Resolve eatId from featuredId if needed
    if (featuredId && !eatId) {
      const eatData = await Eat.findById(featuredId).session(session);
      if (!eatData) throw new Error("Featured item not found");
      eatId = eatData._id.toString();
    }

    let entity = null;

    if (eventId) entity = await LiveEvent.findById(eventId).session(session);
    else if (tourId) entity = await Tour.findById(tourId).session(session);
    else if (eatId) {
      entity = await Eat.findById(eatId).session(session);
      if (typeof entity.availableSeats !== "number") entity.availableSeats = 1000;
      if (typeof entity.perPersonLimit !== "number") entity.perPersonLimit = 1000;
    }

    if (!entity) {
      await session.abortTransaction();
      return NextResponse.json({ error: "Event/Tour/Eat not found" }, { status: 404 });
    }

    // Determine booking query field
    let bookingField = {};
    if (eventId) bookingField.eventId = eventId;
    else if (tourId) bookingField.tourId = tourId;
    else if (eatId) bookingField.eatId = eatId;

    // Check existing bookings for this user
    const existingBookings = await Booking.find({
      userId,
      ...bookingField,
    }).session(session);

    const alreadyBookedSeats = existingBookings.reduce((sum, b) => sum + b.qty, 0);

    if (entity.perPersonLimit && alreadyBookedSeats + qty > entity.perPersonLimit) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          error: `Booking limit reached. You already booked ${alreadyBookedSeats}, trying to book ${qty}. Maximum allowed per person is ${entity.perPersonLimit}.`,
        },
        { status: 400 }
      );
    }

    // Atomically decrement seats
    const updatedEntity = await entity.constructor.findOneAndUpdate(
      { _id: entity._id, availableSeats: { $gte: qty } },
      { $inc: { availableSeats: -qty } },
      { new: true, session }
    );

    if (!updatedEntity) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Sorry, seats are full or not enough available!" },
        { status: 400 }
      );
    }

    // Create booking
    const newBooking = await Booking.create(
      {
        eventId: eventId || undefined,
        tourId: tourId || undefined,
        eatId: eatId || undefined,
        featuredId: featuredId || undefined,
        userId,
        userName,
        userEmail,
        userPhone,
        tier,
        qty,
        total,
        paymentStatus: "pending",
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log("🎉 Booking created:", newBooking);

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Booking save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}