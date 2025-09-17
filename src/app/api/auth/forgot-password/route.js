import connectToDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer"; // 👈 mailer import

export async function POST(req) {
  try {
    await connectToDB();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpiry;
    await user.save();

    // ✅ Reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    console.log("RESET LINK:", resetLink);

    // ✅ Send email
    const subject = "Reset your password - Janoub App";
    const html = `
      <p>Hello ${user.firstName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}" style="color: #6C2BD9; font-weight: bold;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    const sent = await sendEmail(user.email, subject, html);

    if (!sent) {
      return NextResponse.json(
        { message: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password reset link sent to email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
