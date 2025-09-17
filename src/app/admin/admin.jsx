"use client";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <div className="bg-green-700 text-white p-4">
        <h1 className="text-lg font-bold">Admin Panel</h1>
      </div>

      {/* Page content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
