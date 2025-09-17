"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { use, useEffect, useState } from "react"; // ✅ `use` import kiya

export default function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ params ko promise type diya
}) {
  const { id } = use(params); // ✅ unwrap params
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bgUrl = "/bg.png"; // Background image

  const profileAvatar = user?.avatar
    ? `${user.avatar}?t=${Date.now()}`
    : "/profile.jpg";
  const userName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Guest User";

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (!res.ok) throw new Error("Failed to fetch booking");
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]); // ✅ ab dependency me sirf id hai

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading booking details...
      </p>
    );
  if (!booking)
    return (
      <p className="text-center mt-10 text-gray-500">Booking not found.</p>
    );

  const item =
    booking.eventId || booking.tourId || booking.eatId || booking.featuredId;

  return (
    <main
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative mx-auto max-w-md px-4 py-12 mt-20">
        {/* Card */}
        <div className="rounded-2xl bg-white p-8 pt-16 shadow-xl border border-gray-100 relative z-10">
          {/* Avatar half-over card */}
          {user && (
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-36 h-36">
              <div className="relative w-36 h-36">
                {/* Background frame */}
                <Image
                  src="/logo.png"
                  alt="Avatar Frame"
                  fill
                  className="object-contain"
                />

                {/* User avatar inside */}
                <div className="absolute inset-5 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <Image
                    src={profileAvatar}
                    alt={userName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* User name */}
          <h2 className="text-center text-lg font-medium text-gray-900 mb-4">
            {userName}
          </h2>
          <h3 className="mt-6 mb-3 text-gray-700 font-semibold text-base">
            Booking Details
          </h3>

          <div className="rounded-2xl border border-gray-100 shadow-xl p-4 mb-6 hover:shadow-2xl hover:-translate-y-1 transition duration-300 bg-white/90 backdrop-blur-sm">
            {/* Booking image */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden group mb-4">
              <Image
                src={item?.img || item?.images?.[0] || "/placeholder.jpg"}
                alt={item?.title || item?.name || "Booking"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-lg font-semibold text-white drop-shadow-lg tracking-wide">
                {item?.title || item?.name || "Booking"}
              </h3>
            </div>

            {/* Booking details */}
            <div className="space-y-2 text-sm">
              {item?.location && (
                <p className="flex items-center gap-2 text-gray-700">
                  <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full text-xs shadow-sm">
                    📍
                  </span>
                  <span className="font-medium">{item.location}</span>
                </p>
              )}

              {item?.dateFrom && (
                <p className="flex items-center gap-2 text-gray-700">
                  <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full text-xs shadow-sm">
                    📅
                  </span>
                  <span>
                    {new Date(item.dateFrom).toLocaleDateString()}{" "}
                    {item.dateTo &&
                      `→ ${new Date(item.dateTo).toLocaleDateString()}`}
                  </span>
                </p>
              )}

              <p className="flex items-center gap-2 text-gray-700">
                <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full text-xs shadow-sm">
                  👥
                </span>
                <span>
                  {booking.qty} seats | {booking.tier?.toUpperCase()}
                </span>
              </p>

              {booking.total && (
                <p className="flex items-center gap-2 text-gray-800 font-semibold">
                  <span className="p-1.5 bg-green-100 text-green-600 rounded-full text-xs shadow-sm">
                    💰
                  </span>
                  <span>Total: ₹{booking.total.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Payment status */}
            <div className="mt-4">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-sm ${
                  booking.paymentStatus === "paid"
                    ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                    : booking.paymentStatus === "pending"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                    : "bg-gradient-to-r from-red-400 to-red-600 text-white"
                }`}
              >
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            ← Back
          </button>
        </div>
      </div>
    </main>
  );
}
