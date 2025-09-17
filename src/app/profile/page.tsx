"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const bgUrl = "/bg.png";

  const menuItems = [
    { label: "Personal Information", icon: "/icon1.png", path: "/personal-information" },
    { label: "Bookings", icon: "/icon2.png", path: "/bookings" },
    { label: "Help & Support", icon: "/icon3.png", path: "/help-support" },
    { label: "Settings & Privacy", icon: "/icon4.png", path: "/settings" },
    { label: "Give Feedback", icon: "/icon5.png", path: "/feedback" },
    { label: "Sign out", icon: "/icon6.png", action: "logout" },
  ];

  const handleMenuClick = (item: { label: string; action?: string; path?: string }) => {
    if (item.action === "logout") {
      logout();
      router.push("/signin");
    } else if (item.path) {
      router.push(item.path);
    }
  };

  // Helper to check if avatar is base64
  const isBase64Image = (src: string) => src.startsWith("data:image");

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
          {/* Avatar inside logo frame */}
          <div className="relative flex justify-center -mb-12">
            <div className="relative w-36 h-36">
             <Image
  src="/logo.png"
  alt="Logo Frame"
  width={144}
  height={144}
  className="object-contain"
  priority
/>

              {user && (
                <div className="absolute inset-5 rounded-full overflow-hidden border-4 border-white shadow-md">
                  {isBase64Image(user.avatar || "") ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/profile.jpg";
                      }}
                    />
                  ) : (
                    <Image
                      src={user.avatar || "/profile.jpg"}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="104px"
                      priority
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-8 pt-16 shadow-xl border border-gray-100">
            <h2 className="text-center text-lg font-medium text-gray-900">
              {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Guest User"}
            </h2>

            <ul className="mt-8 divide-y divide-gray-200">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <button
                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition"
                    onClick={() => handleMenuClick(item)}
                  >
                    <span className="flex items-center gap-3 text-gray-800">
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={22}
                        height={22}
                      />
                      <span className="text-sm">{item.label}</span>
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-center text-xs text-gray-400">Version 1.0</p>
          </div>
        </div>
      </div>
    </main>
  );
}
