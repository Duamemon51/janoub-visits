"use client";

import { useEffect, useState } from "react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();

      // Ensure array hi mile
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 animate-pulse">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📑 All Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-gray-100 text-gray-600 p-6 rounded-xl text-center shadow">
          No bookings found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Booked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((b) => (
                <tr
                  key={b._id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {b._id}
                  </td>
                  <td className="px-4 py-3">{b.eventId}</td>
                  <td className="px-4 py-3 font-medium">{b.userName}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{b.userEmail}</div>
                    <div className="text-xs text-gray-500">{b.userPhone}</div>
                  </td>
                  <td className="px-4 py-3">{b.tier}</td>
                  <td className="px-4 py-3">{b.qty}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ${b.total}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        b.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
