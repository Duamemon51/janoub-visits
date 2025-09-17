"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";

export default function FeedbackPage() {
  const router = useRouter();
  const { user } = useAuth();

  const bgUrl = "/bg.png";
  const profileAvatar = user?.avatar ? `${user.avatar}?t=${Date.now()}` : "/profile.jpg";

  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || !user) return;

    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          message: feedback,
        }),
      });

      if (!res.ok) throw new Error("Failed to send feedback");

      setSubmitted(true);
      setFeedback("");
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting feedback, please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="relative mx-auto max-w-md px-4 py-12">
        {/* Avatar inside logo frame */}
        <div className="relative flex justify-center -mb-12">
          <div className="relative w-28 h-28">
            <Image src="/Logo.png" alt="Logo Frame" fill className="object-contain" />
            {user && (
              <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-white shadow-md">
                <Image src={profileAvatar} alt="Profile" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 pt-14 shadow-xl border border-gray-100">
          <h2 className="text-center text-lg font-semibold text-gray-900">Give Feedback</h2>

          {submitted ? (
            <p className="mt-6 text-center text-green-600 text-sm">
              ✅ Thank you for your feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback here..."
                className="w-full h-28 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg text-white text-sm font-medium transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          )}

          {/* Back Button */}
          <button
            onClick={() => router.push("/profile")}
            className="mt-6 w-full py-2 rounded-lg bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
          >
            ← Back to Profile
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">Version 1.0</p>
        </div>
      </div>
    </main>
  );
}
