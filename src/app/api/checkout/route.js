// File: src/app/api/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import LiveEvent from "@/models/LiveEvent";
import Tour from "@/models/Tour";
import Eat from "@/models/Eat";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await connectToDB();

    const {
      eventId,
      tourId,
      eatId: rawEatId,
      featuredId,
      userId,
      tier,
      qty,
      total,
      userName,
      userEmail,
      userPhone,
    } = await req.json();

    if (!userId || !userName || !userEmail || !userPhone) {
      return NextResponse.json(
        { error: "User ID, Name, Email, and Phone are required" },
        { status: 400 }
      );
    }

    let entity;
    let eatId = rawEatId;
    let successUrl, cancelUrl;

    // Resolve featuredId to Eat ID
    if (featuredId && !eatId) {
      const eatData = await Eat.findById(featuredId); // Ensure featuredId matches Eat._id
      if (eatData) eatId = eatData._id.toString();
    }

    // Fetch entity and set URLs
    if (eventId) {
      entity = await LiveEvent.findById(eventId);
      successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?bookingId=`;
      cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-booking?eventId=${eventId}`;
    } else if (tourId) {
      entity = await Tour.findById(tourId);
      successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?bookingId=`;
      cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-booking?tourId=${tourId}`;
    } else if (eatId) {
      entity = await Eat.findById(eatId);
      successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?bookingId=`;
      cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ticket-booking?eatId=${eatId}`;
    } else {
      return NextResponse.json(
        { error: "No eventId, tourId, eatId, or featuredId provided" },
        { status: 400 }
      );
    }

    if (!entity) {
      return NextResponse.json(
        { error: "Selected item not found" },
        { status: 404 }
      );
    }

    // Check per-person limit
    const orConditions = [];
    if (eventId) orConditions.push({ eventId });
    if (tourId) orConditions.push({ tourId });
    if (eatId) orConditions.push({ eatId });
    if (featuredId) orConditions.push({ featuredId });

    const existingBookings = await Booking.find({
      userId,
      $or: orConditions,
    });

    const alreadyBookedSeats = existingBookings.reduce((sum, b) => sum + b.qty, 0);

    if (entity.perPersonLimit && alreadyBookedSeats + qty > entity.perPersonLimit) {
      return NextResponse.json(
        {
          error: `You have already booked ${alreadyBookedSeats} tickets. 
                  You can book a maximum of ${entity.perPersonLimit} tickets per person for this item.`,
        },
        { status: 400 }
      );
    }

    // Atomic decrement of seats
    const updatedEntity = await entity.constructor.findOneAndUpdate(
      { _id: entity._id, availableSeats: { $gte: qty } },
      { $inc: { availableSeats: -qty } },
      { new: true }
    );

    if (!updatedEntity) {
      return NextResponse.json(
        { error: "Sorry, not enough seats available!" },
        { status: 400 }
      );
    }

    // Save booking (pending)
    const bookingData = {
      userId,
      userName,
      userEmail,
      userPhone,
      tier,
      qty,
      total,
      paymentStatus: "pending",
    };

    if (eventId) bookingData.eventId = eventId;
    else if (tourId) bookingData.tourId = tourId;
    else if (eatId) bookingData.eatId = eatId;
    if (featuredId) bookingData.featuredId = featuredId;

    const booking = await Booking.create(bookingData);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "sar",
            product_data: {
              name: entity.title || entity.name || `Ticket (${tier})`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${successUrl}${booking._id}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
