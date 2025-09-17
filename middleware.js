import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("adminToken")?.value;

  // Agar token hi nahi mila → redirect to signin
  if (!token) {
    return NextResponse.redirect(new URL("/admin/signin", req.url));
  }

  try {
    // Token verify karo
    jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    return NextResponse.next();
  } catch (err) {
    // Token invalid ya expired → redirect to signin
    return NextResponse.redirect(new URL("/admin/signin", req.url));
  }
}

// ✅ Sirf /admin routes protect karo
export const config = {
  matcher: ["/admin/:path*"],
};
