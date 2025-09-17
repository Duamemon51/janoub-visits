"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Settings,
  User,
  ChevronDown,
  Menu,
  Bell,
  Search,
  Tag,
  Globe,
  Pin,
  Star,
  Video,
  ClipboardList,
  Map,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import Image from "next/image";

// ✅ NavLink Component
const NavLink = ({ href, icon, label, isActive }) => (
  <Link
    href={href}
    className={`group flex items-center gap-4 p-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out
      ${
        isActive
          ? "bg-purple-700 text-white shadow-lg transform translate-x-1"
          : "text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:transform hover:translate-x-1"
      }
    `}
  >
    <div
      className={`transition-all duration-300 ease-in-out group-hover:scale-110 ${
        isActive ? "text-white" : "text-gray-500 group-hover:text-purple-700"
      }`}
    >
      {icon}
    </div>
    <span className="truncate">{label}</span>
  </Link>
);

// ✅ Fetcher (with credentials)
const fetcher = async (url) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch data.");
  }
  return res.json();
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const path = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState("");

  // ✅ Signin / Signup page detect
  const isAuthPage = path === "/admin/signin" || path === "/admin/signup";

  // ✅ SWR fetch admin
  const { data: admin, error, isLoading } = useSWR(
    !isAuthPage ? "/api/admin/me" : null,
    fetcher,
    { shouldRetryOnError: false }
  );

  // ✅ Sidebar items
  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    {
      label: "User Management",
      icon: <Users size={20} />,
      children: [
        { href: "/admin/admins", label: "Admins" },
        { href: "/admin/users", label: "Users" },
      ],
    },
    { label: "Hero Section", href: "/admin/hero", icon: <Star size={20} /> },
    { label: "Destinations", href: "/admin/destinations", icon: <Pin size={20} /> },
    { label: "Places", href: "/admin/places", icon: <Globe size={20} /> },
    { label: "Categories", href: "/admin/categories", icon: <Tag size={20} /> },
    { label: "Live Events", href: "/admin/LiveEvents", icon: <Video size={20} /> },
    { label: "Janoub Eats", href: "/admin/AdminEats", icon: <Map size={20} /> },
    { label: "Event Bookings", href: "/admin/bookings", icon: <ClipboardList size={20} /> },
    { label: "Guided Tours", href: "/admin/tours", icon: <ShoppingBag size={20} /> },
    { label: "User Feedbacks", href: "/admin/feedback", icon: <ShieldCheck size={20} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  // ✅ Unauthorized → redirect
  useEffect(() => {
    if (!isLoading && error?.message === "Unauthorized") {
      router.replace("/admin/signin");
    }
  }, [error, isLoading, router]);

  // ✅ Active submenu setup
  useEffect(() => {
    const activeItem = navItems.find(
      (item) => item.children && item.children.some((child) => path === child.href)
    );
    if (activeItem) {
      setActiveSubmenu(activeItem.label);
    }
  }, [path]);

  // ✅ Logout
  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    mutate("/api/admin/me", null, false);
    router.push("/admin/signin");
  };

  // ✅ Auth pages → return directly
  if (isAuthPage) return <>{children}</>;

  // ✅ Loader while fetching
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Unauthorized (redirecting)
  if (!admin) return null;

  return (
    <>
      <style jsx global>{`
        .sidebar-transition {
          transition: transform 0.3s ease-in-out;
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.3s ease-in-out;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl flex flex-col transform md:translate-x-0 sidebar-transition
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center gap-4 p-6 border-b border-gray-100">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-600 text-white font-extrabold text-lg shadow-lg">
              JA
            </div>
            <h2 className="text-xl font-bold leading-tight text-gray-900">
              Janoub
              <span className="block text-sm font-medium text-gray-500 mt-1">
                Admin Panel
              </span>
            </h2>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto" aria-label="Main navigation">
            <ul className="space-y-2" role="menu">
              {navItems.map(({ href, icon, label, children }) => (
                <li key={label} role="none">
                  {href ? (
                    <NavLink href={href} icon={icon} label={label} isActive={path === href} />
                  ) : (
                    <div>
                      <button
                        onClick={() =>
                          setActiveSubmenu(activeSubmenu === label ? "" : label)
                        }
                        className={`w-full text-left flex items-center gap-4 p-3 rounded-xl text-sm font-semibold transition-colors duration-200
                          ${
                            activeSubmenu === label
                              ? "text-purple-700 bg-purple-50"
                              : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                          }
                        `}
                        aria-expanded={activeSubmenu === label}
                        aria-controls={`submenu-${label.replace(/\s/g, "")}`}
                      >
                        <div className="text-gray-500">{icon}</div>
                        <span className="flex-1 truncate">{label}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${
                            activeSubmenu === label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {children && (
                        <ul
                          id={`submenu-${label.replace(/\s/g, "")}`}
                          className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-500 ease-in-out ${
                            activeSubmenu === label
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                          role="menu"
                        >
                          {children.map((child) => (
                            <li key={child.href} role="none">
                              <Link
                                href={child.href}
                                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all duration-200
                                  ${
                                    path === child.href
                                      ? "bg-purple-500 text-white shadow-sm"
                                      : "text-gray-500 hover:bg-gray-100 hover:text-purple-500"
                                  }
                                `}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-64">
          {/* Header */}
          <header className="bg-white shadow-md px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-gray-600 hover:text-purple-600 transition"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-6">
              {/* Search */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 shadow-sm"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400">
                    <Image
                      src={admin?.avatar ? `/uploads/${admin.avatar}` : "/profile.jpg"}
                      alt="Admin Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm hidden lg:inline">
                    {admin?.name || "Admin"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform duration-300 ${
                      isProfileMenuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeInDown border border-gray-100">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 text-gray-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User size={18} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 font-medium"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="bg-white shadow-xl rounded-2xl p-8 min-h-[calc(100vh-180px)]">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 p-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-purple-600">Janoub Admin Panel</span>. All
            rights reserved.
          </footer>
        </div>
      </div>
    </>
  );
}
