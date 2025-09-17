"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  X,
  Ticket,
  User,
  Mail,
  Phone,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";

export default function TicketBookingPage() {
  const brand = "#56008D";
  const search = useSearchParams();
  const router = useRouter();

  const eventId = search.get("eventId");
  const tourId = search.get("tourId");
  const featuredId = search.get("featuredId") || search.get("featured");
  const eatId = search.get("eatId");

  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tier, setTier] = useState("standard");
  const [alreadyBookedSeats, setAlreadyBookedSeats] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id || null;
  };

  useEffect(() => {
    if (!eventId && !tourId && !featuredId && !eatId) {
      setLoading(false);
      return;
    }

    const fetchEntityAndBookings = async () => {
      try {
        let entityUrl = "";
        let bookingQuery = "";

        if (eventId) {
          entityUrl = `/api/live-events/${eventId}`;
          bookingQuery = `eventId=${eventId}`;
        } else if (tourId) {
          entityUrl = `/api/tours?tour_id=${tourId}`;
          bookingQuery = `tourId=${tourId}`;
        } else if (featuredId) {
          entityUrl = `/api/eats?featuredId=${featuredId}`;
          bookingQuery = `featuredId=${featuredId}`;
        } else if (eatId) {
          entityUrl = `/api/eats?eatId=${eatId}`;
          bookingQuery = `eatId=${eatId}`;
        }

        const res = await fetch(entityUrl);
        if (!res.ok) throw new Error(`Failed to fetch entity: ${res.status}`);
        const data = await res.json();

        // Determine entityData based on type
        let entityData = null;
        if (eventId) {
          entityData = data; // single event object
        } else if (tourId) {
          entityData = data; // single tour object returned by API
        } else if (featuredId) {
          entityData = data.eats?.find((e) => e._id === featuredId) || null;
        } else if (eatId) {
          entityData = data.eats?.find((e) => e._id === eatId) || null;
        }

        if (!entityData) {
          setEntity(null);
          setLoading(false);
          return;
        }

        setEntity(entityData);

        // Fetch already booked seats
        let bookedSeats = 0;
        const userId = getUserId();
        if (userId && (eventId || tourId || featuredId || eatId)) {
          const bookingRes = await fetch(
            `/api/bookings?${bookingQuery}&userId=${userId}`
          );
          if (bookingRes.ok) {
            const bookings = await bookingRes.json();
            bookedSeats = bookings.reduce((sum, b) => sum + b.qty, 0);
          }
        }
        setAlreadyBookedSeats(bookedSeats);

        // Set initial qty respecting limits
        if (firstLoad) {
          const remainingSeats = entityData.availableSeats - bookedSeats;
          const remainingLimit = entityData.perPersonLimit
            ? entityData.perPersonLimit - bookedSeats
            : remainingSeats;

          // Set initial quantity to 1 if there's space, otherwise 0
          setQty(remainingLimit > 0 ? 1 : 0);
          setFirstLoad(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setEntity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEntityAndBookings();
    const interval = setInterval(fetchEntityAndBookings, 5000); // auto refresh every 5s
    return () => clearInterval(interval);
  }, [eventId, tourId, featuredId, eatId, firstLoad]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-600 bg-gray-50">
        Loading...
      </div>
    );

  if (!entity)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-600 bg-gray-50">
        {eventId
          ? "Event not found"
          : tourId
          ? "Tour not found"
          : featuredId
          ? "Featured item not found"
          : "Eat item not found"}
      </div>
    );

  const basePrice = entity.price || 0;
  const tierMultiplier = tier === "vip" ? 1.6 : tier === "vvip" ? 2.2 : 1;
  const subtotal = basePrice * tierMultiplier * qty;
  const serviceFee = subtotal * 0.06;
  const tax = (subtotal + serviceFee) * 0.15;
  const total = subtotal + serviceFee + tax;

  const remainingLimit = entity.perPersonLimit
    ? entity.perPersonLimit - alreadyBookedSeats
    : entity.availableSeats;

  const maxQty = Math.min(entity.availableSeats || 1000, remainingLimit || 1000);

  // Check if the user has reached their personal booking limit
  const hasReachedLimit = remainingLimit <= 0;
  const canBook = maxQty > 0;

  // ✅ Quantity handlers
  const increaseQty = () => {
    setQty((q) => Math.min(q + 1, maxQty));
  };
  const decreaseQty = () => setQty((q) => Math.max(1, q - 1));

  const handleCheckout = async () => {
    console.log({
      availableSeats: entity.availableSeats,
      perPersonLimit: entity.perPersonLimit,
      alreadyBookedSeats,
      remainingLimit,
      maxQty,
      qty,
    });

    const userId = getUserId();
    if (!userId) {
      router.push("/signin");
      return;
    }

    if (!userName || !userEmail || !userPhone) {
      alert("Please fill in all your details.");
      return;
    }

    // Check against the calculated remaining limit before proceeding
    if (qty > remainingLimit) {
      setShowLimitModal(true);
      return;
    }
    
    // Check if the user is attempting to book more than the available seats
    if (qty > entity.availableSeats - alreadyBookedSeats) {
        alert("Not enough available seats.");
        return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId || undefined,
          tourId: tourId || undefined,
          featuredId: featuredId || undefined,
          eatId: eatId || undefined,
          userId,
          qty,
          tier,
          total,
          userName,
          userEmail,
          userPhone,
        }),
      });

      if (!res.ok) throw new Error(`Checkout API error: ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setShowLimitModal(true);
        return;
      }

      router.push(data.url);
    } catch (err) {
      console.error("Checkout error:", err);
      setShowLimitModal(true);
    }
  };

  return (
    <>
      <Head>
        <title>Book Tickets for {entity.title}</title>
      </Head>
      <main className="bg-gray-50 min-h-screen text-gray-900 py-12 px-4 md:px-8 font-sans">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
          {/* Left Column: Entity Details + Booking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-10"
          >
            {/* Entity Details Section */}
            <div className="relative rounded-3xl shadow-2xl overflow-hidden h-72 md:h-96">
              <img
                src={entity.img}
                alt={entity.title}
                className="w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-8">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
                  {entity.title}
                </h1>
                {entity.location && (
                  <div className="mt-4 space-y-2 text-sm text-gray-300 font-medium">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>{entity.location}</span>
                    </p>
                    {entity.dateFrom && (
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>
                          {new Date(entity.dateFrom).toLocaleDateString()} -{" "}
                          {new Date(entity.dateTo).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form Section */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl space-y-10 border border-gray-200">
              {/* Ticket Selection */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Ticket className="w-7 h-7 text-purple-600" /> Select Your
                  Tickets
                </h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  {["standard", "vip", "vvip"].map((type) => (
                    <motion.label
                      key={type}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out border-2 border-gray-300
                      ${
                        tier === type
                          ? "ring-4 ring-purple-500 bg-purple-100 shadow-purple-200/40"
                          : "hover:border-purple-500/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={type}
                        checked={tier === type}
                        onChange={() => setTier(type)}
                        className="hidden"
                      />
                      <span className="capitalize font-bold text-lg text-gray-900">
                        {type}
                      </span>
                      <span className="text-xs mt-1 text-gray-600">
                        {type === "standard"
                          ? "Basic Seating"
                          : type === "vip"
                          ? "Premium View"
                          : "Front Row Access"}
                      </span>
                    </motion.label>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div className="mt-8 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-800">
                      Quantity
                    </span>
                    <div className="flex items-center bg-gray-100 rounded-full overflow-hidden border border-gray-300">
                      <button
                        type="button"
                        onClick={decreaseQty}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={qty <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-12 text-center text-lg font-medium text-gray-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={increaseQty}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={qty >= maxQty || hasReachedLimit}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {/* Status message */}
                  <div className="mt-4 text-center">
                    {hasReachedLimit ? (
                      <p className="text-red-600 text-sm font-semibold">
                        You've reached your booking limit of {entity.perPersonLimit} tickets.
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Remaining seats: {entity.availableSeats - alreadyBookedSeats}, Your per-person limit: {remainingLimit}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* User Details */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Your Details
                </h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-gray-100 text-gray-900 rounded-full px-12 py-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-gray-100 text-gray-900 rounded-full px-12 py-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full bg-gray-100 text-gray-900 rounded-full px-12 py-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </section>
            </div>
          </motion.div>

          {/* Right Column: Summary & Checkout */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 sticky top-12 h-fit"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ShoppingCart className="w-7 h-7 text-purple-600" /> Booking
                Summary
              </h2>
              <div className="space-y-4 text-gray-700 text-lg">
                <div className="flex justify-between">
                  <span>Tickets Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    SAR {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span className="font-semibold text-gray-900">
                    SAR {serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold text-gray-900">
                    SAR {tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-6 mt-4 flex justify-between items-center text-2xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>SAR {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-10 py-4 rounded-full text-white font-bold text-xl hover:bg-purple-700 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-105"
                style={{ backgroundColor: brand }}
                onClick={handleCheckout}
                disabled={
                  entity.availableSeats === 0 ||
                  hasReachedLimit || // Added this condition
                  !userName ||
                  !userEmail ||
                  !userPhone
                }
              >
                {entity.availableSeats === 0
                  ? "Seats Full"
                  : hasReachedLimit
                  ? "Booking Limit Reached"
                  : "Proceed to Checkout"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showLimitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative"
              >
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <X className="h-9 w-9 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Booking Limit Reached
                  </h2>
                  <p className="text-sm text-gray-600">
                    You have already booked {alreadyBookedSeats} tickets. You can book a maximum of{" "}
                    {entity.perPersonLimit} tickets per person for this{" "}
                    {eventId
                      ? "event"
                      : tourId
                      ? "tour"
                      : featuredId
                      ? "featured item"
                      : "eat item"}
                    .
                  </p>
                  <div className="mt-6">
                    <button
                      className="w-full py-3 rounded-full text-white font-semibold bg-red-600 hover:bg-red-700 transition transform hover:scale-105"
                      onClick={() => setShowLimitModal(false)}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}