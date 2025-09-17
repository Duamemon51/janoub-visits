"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";

export default function HelpSupportPage() {
  const router = useRouter();
  const { user } = useAuth();

  const bgUrl = "/bg.png";
  const profileAvatar = user?.avatar ? `${user.avatar}?t=${Date.now()}` : "/profile.jpg";

  const [form, setForm] = useState({ name: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Message sent! We'll get back soon.");
    setForm({ name: "", message: "" });
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
            <Image src="/logo.png" alt="Logo Frame" fill className="object-contain" />
            {user && (
              <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-white shadow-md">
                <Image src={profileAvatar} alt="Profile" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 pt-14 shadow-xl border border-gray-100">
          <h2 className="text-center text-lg font-semibold text-gray-900">Help & Support</h2>

          {/* Quick Links */}
          <div className="mt-4 text-sm text-blue-600 space-y-1">
            <a href="/faq" className="block hover:underline">📘 FAQ</a>
            <a href="/terms" className="block hover:underline">📜 Terms & Conditions</a>
          </div>

          {/* Contact Info */}
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <p>📧 support@example.com</p>
            <p>📞 +92 300 1234567</p>
          </div>

          {/* Tiny Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 text-sm"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg p-2 text-sm"
              required
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Send
            </button>
          </form>

          {/* Back Button */}
          <button
            onClick={() => router.push("/profile")}
            className="mt-4 w-full py-2 rounded-lg bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
          >
            ← Back to Profile
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">Version 1.0</p>
        </div>
      </div>
    </main>
  );
}
