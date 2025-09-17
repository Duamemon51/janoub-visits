"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/LanguageProvider";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthProvider";

export default function SignInPage() {
  const { t, dir, locale } = useI18n();
  const router = useRouter();
  const { login } = useAuth(); // 👈 context se login function

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful!");

        // 👇 ab sirf context ka login use karo
        login(data.user, data.token);

        setTimeout(() => router.push("/profile"), 1500);
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-screen h-screen relative overflow-hidden font-[Montserrat]"
      dir={dir}
      lang={locale}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "8px", color: "#fff", fontWeight: "500" },
          success: { duration: 4000, style: { background: "#6C2BD9" } },
          error: { duration: 4000, style: { background: "#FF4D4F" } },
        }}
      />

      <img
        src="/castle.png"
        alt={t("auth.signIn.bgAlt")}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-20 gap-8 md:gap-0">
        <div className="text-white max-w-[600px] text-center md:text-left">
          <h1 className="text-[28px] md:text-[48px] font-bold leading-tight mb-2">
            {t("auth.hero.title")}
          </h1>
          <p className="text-[16px] md:text-[20px]">
            {t("auth.signIn.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-10 w-full max-w-[344px]">
          <h2 className="text-[18px] font-semibold text-gray-800 mb-6">
            {t("auth.signIn.heading")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.labels.email")}
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="user@email.com"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.labels.password")}
              </label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="**************"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-purple-600" />
                {t("auth.signIn.remember")}
              </label>
             <a href="/forgot-password" className="text-purple-600 hover:underline">
  {t("auth.signIn.forgot")}
</a>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 text-white font-medium py-2 rounded-md hover:bg-purple-800 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : t("auth.signIn.submit")}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              {t("auth.signIn.noAccount")}{" "}
              <a
                href="/signup"
                className="text-purple-700 font-medium hover:underline"
              >
                {t("auth.signIn.createNow")}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
