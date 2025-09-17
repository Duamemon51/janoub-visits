"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider"; // 👈 apna context import

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const { isLoggedIn, loading } = useAuth(); // 👈 context se login state le lo

  // Close mobile menu when resizing up to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return null; // 👈 jab tak localStorage read ho raha hai, kuch na dikhao
  }

  return (
    <nav
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
      className="bg-white shadow-md sticky top-0 z-50"
      style={{ fontFamily: "Montserrat" }}
    >
      {/* Top bar */}
      <div className="h-[72px] px-4 md:px-6 flex items-center justify-between">
        {/* Right: Logo + Links */}
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <img src="/Logo.png" alt={t("common.brand")} className="h-8 w-auto" />
            <span className="text-[#56008D] font-bold text-[22px]">
              {t("common.brand")}
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/ExploreJanoub"
              className="text-black hover:text-[#56008D] font-semibold text-[18px]"
            >
              {t("navbar.explore")}
            </a>
            <a
              href="/JanoubLive"
              className="text-black hover:text-[#56008D] font-semibold text-[18px]"
            >
              {t("navbar.live")}
            </a>
            <a
              href="/JanoubEats"
              className="text-black hover:text-[#56008D] font-semibold text-[18px]"
            >
              {t("navbar.eats")}
            </a>
          </div>
        </div>

        {/* Desktop: Language + Auth */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className="border rounded px-5 py-2"
            style={{
              borderColor: "#56008D",
              color: "#56008D",
              fontWeight: 600,
              fontSize: "16px",
            }}
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          >
            {locale === "ar" ? t("common.english") : t("common.arabic")}
          </button>

          {isLoggedIn ? (
            <a
              href="/profile"
              className="text-white rounded px-5 py-2"
              style={{
                backgroundColor: "#56008D",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              {t("common.profile")}
            </a>
          ) : (
            <a
              href="/signin"
              className="text-white rounded px-5 py-2"
              style={{
                backgroundColor: "#56008D",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              {t("common.login")}
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={24} color="#56008D" /> : <Menu size={24} color="#56008D" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-gray-200 overflow-hidden transition-[max-height] duration-300 ${
          open ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 flex flex-col items-end gap-3">
          <a
            href="/ExploreJanoub"
            className="py-2 text-[16px] font-semibold text-black hover:text-[#56008D]"
            onClick={() => setOpen(false)}
          >
            {t("navbar.explore")}
          </a>
          <a
            href="/JanoubLive"
            className="py-2 text-[16px] font-semibold text-black hover:text-[#56008D]"
            onClick={() => setOpen(false)}
          >
            {t("navbar.live")}
          </a>
          <a
            href="/JanoubEats"
            className="py-2 text-[16px] font-semibold text-black hover:text-[#56008D]"
            onClick={() => setOpen(false)}
          >
            {t("navbar.eats")}
          </a>

          <div className="h-px bg-gray-200 w-full my-2" />

          <div className="flex items-center gap-3 w-full justify-end">
            <button
              className="border rounded px-4 py-2"
              style={{
                borderColor: "#56008D",
                color: "#56008D",
                fontWeight: 600,
                fontSize: "16px",
              }}
              onClick={() => {
                setLocale(locale === "ar" ? "en" : "ar");
                setOpen(false);
              }}
            >
              {locale === "ar" ? t("common.english") : t("common.arabic")}
            </button>

            {isLoggedIn ? (
              <a
                href="/profile"
                className="text-white rounded px-4 py-2 text-center"
                style={{
                  backgroundColor: "#56008D",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
                onClick={() => setOpen(false)}
              >
                {t("common.profile")}
              </a>
            ) : (
              <a
                href="/signin"
                className="text-white rounded px-4 py-2 text-center"
                style={{
                  backgroundColor: "#56008D",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
                onClick={() => setOpen(false)}
              >
                {t("common.login")}
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
