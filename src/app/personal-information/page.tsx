"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthProvider";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PersonalInformationPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const bgUrl = "/bg.png";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [newPassword, setNewPassword] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || "/profile.jpg");
  const [uploading, setUploading] = useState(false); // ✅ added
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // ✅ added
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setToast({ message: "Please select an image file", type: "error" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "Image size must be less than 5MB", type: "error" });
        return;
      }

      setUploading(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Avatar = event.target?.result as string;
        const cleanAvatar = base64Avatar.split("?")[0];
        setAvatar(cleanAvatar);
        setAvatarFile(file);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let avatarBase64 = avatar;
      if (avatarFile) {
        const reader = new FileReader();
        avatarBase64 = await new Promise((resolve) => {
          reader.onload = (event) => {
            const base64Data = event.target?.result as string;
            resolve(base64Data.split("?")[0]);
          };
          reader.readAsDataURL(avatarFile);
        });
      }

      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          newPassword,
          avatar: avatarBase64,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      if (updateUser) updateUser(data.user);

      setToast({ message: "Profile updated successfully!", type: "success" });
      setAvatarFile(null);
    } catch (err: any) {
      setToast({ message: err.message || "Something went wrong", type: "error" });
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

      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white transform transition-transform duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } animate-slide-in`}
        >
          {toast.message}
        </div>
      )}

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={() => router.push("/profile")}
            className="mb-4 flex items-center text-gray-700 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>

          <div className="relative flex flex-col items-center z-10">
            <div className="relative w-36 h-36">
              <Image src="/logo.png" alt="Logo Frame" fill className="object-contain" sizes="144px" priority />
              <div className="absolute inset-5 rounded-full overflow-hidden border-4 border-white shadow-md">
                <Image src={avatar} alt="Profile" fill className="object-cover" />
              </div>
            </div>

            <label
              className={`mt-3 cursor-pointer text-indigo-600 hover:text-indigo-800 text-sm font-medium ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Processing..." : "Change Avatar"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="rounded-2xl bg-white p-8 pt-24 shadow-xl border border-gray-100 -mt-20 relative z-0">
            <h2 className="text-center text-lg font-medium text-gray-900">Personal Information</h2>

            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-base h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base h-10"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading || uploading}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg shadow-sm transition"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>

            <p className="mt-6 text-center text-xs text-gray-400">Version 1.0</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
