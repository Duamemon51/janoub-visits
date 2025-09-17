import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Gauge, Users, Ticket, Utensils, MapPin, MessageSquare } from "lucide-react";

// ✅ Server Component me async lagao, kyunki cookies() ab async hai
export default async function AdminDashboard() {
  const cookieStore = await cookies(); // ✅ await is required
  const token = cookieStore.get("adminToken");

  if (!token) {
    redirect("/admin/signin");
  }

  // Dashboard metrics for events, restaurants, and places
  const dashboardData = [
    {
      title: "Total Events Booked",
      value: "1,560",
      icon: <Ticket size={24} />,
      color: "bg-indigo-100 text-indigo-600",
      description: "Bookings for all events.",
    },
    {
      title: "Restaurant Reservations",
      value: "789",
      icon: <Utensils size={24} />,
      color: "bg-rose-100 text-rose-600",
      description: "Total restaurant table reservations.",
    },
    {
      title: "Places Visited",
      value: "2,350",
      icon: <MapPin size={24} />,
      color: "bg-teal-100 text-teal-600",
      description: "Total visits to designated places.",
    },
    {
      title: "Active Users",
      value: "1,120",
      icon: <Users size={24} />,
      color: "bg-purple-100 text-purple-600",
      description: "Currently active users on the platform.",
    },
    {
      title: "New Reviews",
      value: "45",
      icon: <MessageSquare size={24} />,
      color: "bg-orange-100 text-orange-600",
      description: "New reviews from users.",
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Janoub Admin Dashboard 📈
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Gauge size={20} />
          <span>Platform Overview</span>
        </div>
      </div>

      {/* Dashboard Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {dashboardData.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full ${item.color} shadow-inner`}
            >
              {item.icon}
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500">
              {item.title}
            </p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {item.value}
            </h2>
            <p className="mt-2 text-xs text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">
          Recent Bookings & Activity
        </h2>
        <p className="mt-2 text-gray-500">
          View the latest user activities and new bookings.
        </p>
        <div className="mt-6 border-t border-gray-200 pt-6">
          {/* Placeholder for a list or table of recent bookings */}
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
              <span className="font-semibold">Jane Doe</span> booked{" "}
              <span className="text-indigo-600 font-semibold">
                "Live Concert Ticket"
              </span>
            </li>
            <li className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
              <span className="font-semibold">John Smith</span> reserved a
              table at{" "}
              <span className="text-rose-600 font-semibold">
                "The Grand Restaurant"
              </span>
            </li>
            <li className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
              <span className="font-semibold">Fatima Ali</span> visited{" "}
              <span className="text-teal-600 font-semibold">
                "Historic Fort"
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
