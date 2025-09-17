"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-confetti to avoid SSR issues
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");
  const [status, setStatus] = useState("Updating booking...");
 const [success, setSuccess] = useState(null);


  useEffect(() => {
    if (!bookingId) return;

    const updateBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: "paid" }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("Booking confirmed!");
          setSuccess(true);

          // Redirect to bookings page after 3 seconds
          setTimeout(() => {
            router.push("/bookings");
          }, 1000);
        } else {
          setStatus("Failed to update booking");
          setSuccess(false);
        }
      } catch (err) {
        setStatus("Error updating booking");
        setSuccess(false);
      }
    };

    updateBooking();
  }, [bookingId, router]);

  const accentColor =
    success === true ? "bg-green-500" :
    success === false ? "bg-red-500" :
    "bg-gray-300";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100 p-6">
      {success && <Confetti numberOfPieces={200} recycle={false} />}
      <div className="max-w-lg mx-auto mt-10">
        <div className={`border-l-4 ${accentColor} bg-white shadow-xl rounded-xl p-6 transition-all transform hover:scale-105`}>
          <div className="flex items-center space-x-4">
            <div className="text-5xl">
              {success === true && <span className="animate-bounce">🎉</span>}
              {success === false && <span className="animate-pulse">❌</span>}
              {success === null && <span>⏳</span>}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">{status}</h1>
              {success && (
                <>
                  <p className="text-gray-600 mt-2">
                    Thank you for your booking! Redirecting to your bookings page...
                  </p>
                  <button
                    onClick={() => router.push("/bookings")}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    See Your Bookings
                  </button>
                </>
              )}
              {!success && success !== null && (
                <p className="text-gray-600 mt-2">
                  Please try again or contact support.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
