"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";

export default function SettingsPrivacyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const bgUrl = "/bg.png";
  const profileAvatar = user?.avatar ? `${user.avatar}?t=${Date.now()}` : "/profile.jpg";

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

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
          <h2 className="text-center text-lg font-semibold text-gray-900">Settings & Privacy</h2>

          {/* Settings Options */}
          <div className="mt-6 space-y-4 text-sm">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <span className="text-gray-800">🌙 Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="h-4 w-4"
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <span className="text-gray-800">🔔 Notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="h-4 w-4"
              />
            </div>

            {/* Privacy Policy */}
            <button
              onClick={() => router.push("/privacy-policy")}
              className="w-full text-left text-blue-600 hover:underline"
            >
              📜 Privacy Policy
            </button>
          </div>

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
