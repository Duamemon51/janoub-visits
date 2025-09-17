"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useEffect, useState } from "react";

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const bgUrl = "/bg.png";
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const profileAvatar = user?.avatar
    ? `${user.avatar}?t=${Date.now()}`
    : "/profile.jpg";

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  return (
    <main
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-md">
          {/* Avatar */}
          <div className="relative flex justify-center -mb-12">
            <div className="relative w-36 h-36">
              <Image src="/logo.png" alt="Logo Frame" fill className="object-contain" />
              {user && (
                <div className="absolute inset-5 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <Image src={profileAvatar} alt="Profile" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-8 pt-16 shadow-xl border border-gray-100">
            <h2 className="text-center text-lg font-medium text-gray-900">
              {user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : "Guest User"}
            </h2>

            <h3 className="mt-6 text-gray-700 font-semibold text-base">My Bookings</h3>

            {loading ? (
              <p className="text-center text-sm text-gray-500 mt-4">Loading...</p>
            ) : bookings.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {bookings.map((booking) => {
                  // Choose the first populated entity
                  const item =
                    booking.eventId ||
                    booking.tourId ||
                    booking.eatId ||
                    booking.featuredId;

                  return (
                    <li
  key={booking._id}
  onClick={() => router.push(`/bookings/${booking._id}`)}
  className="flex items-center gap-4 p-4 border rounded-xl shadow-sm hover:bg-gray-50 transition cursor-pointer"
>
  {/* Image */}
  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
    <Image
      src={item?.img || item?.images?.[0] || "/placeholder.jpg"}
      alt={item?.title || item?.name || "Booking"}
      fill
      className="object-cover"
    />
  </div>

  {/* Info */}
  <div className="flex-1">
    <p className="text-sm font-medium text-gray-900">
      {item?.title || item?.name || "Booking"}
    </p>
    {item?.dateFrom && (
      <p className="text-xs text-gray-500">
        {new Date(item.dateFrom).toLocaleDateString()} →{" "}
        {item.dateTo && new Date(item.dateTo).toLocaleDateString()}
      </p>
    )}
    <p className="text-xs text-gray-500">
      {booking.qty} seats | {booking.tier?.toUpperCase()}
    </p>
  </div>

  {/* Status */}
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      booking.paymentStatus === "paid"
        ? "bg-green-100 text-green-700"
        : booking.paymentStatus === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {booking.paymentStatus}
  </span>
</li>

                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-sm text-gray-500 mt-4">No bookings found.</p>
            )}

            {/* Back Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push("/profile")}
                className="px-6 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition"
              >
                ← Back to Profile
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">Version 1.0</p>
          </div>
        </div>
      </div>
    </main>
  );
}
