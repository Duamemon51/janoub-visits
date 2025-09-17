"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAuthPage = path === "/signin" || path === "/signup";
  const isAdminPage = path.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}
      <main className="page-container grow">{children}</main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </>
  );
}
