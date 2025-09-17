"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (url) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function ProfilePage() {
  const { data: admin, isLoading } = useSWR("/api/admin/me", fetcher);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  if (isLoading) return <p>Loading...</p>;
  if (!admin) return <p>Unauthorized</p>;

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name || admin.name);
    if (password) formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);

    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      body: formData, // 👈 no Content-Type, browser sets it automatically
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Profile updated successfully");
      mutate("/api/admin/me"); // refresh profile info
      setPassword(""); // clear password field
    } else {
      setMessage(data.message || "❌ Failed to update");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={handleUpdate} className="space-y-4" encType="multipart/form-data">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            defaultValue={admin.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={admin.email}
            disabled
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium">Upload Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
            className="w-full border rounded-lg px-3 py-2"
          />
          {admin.avatar && (
            <img
              src={`/uploads/${admin.avatar}`}
              alt="Avatar"
              className="mt-2 w-20 h-20 rounded-full object-cover"
            />
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank if not changing"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
