"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import Link from "next/link";

export default function HomePage() {
  const { t, dir, locale } = useI18n();

  interface Hero {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
}

const [hero, setHero] = useState<Hero | null>(null);
interface Place {
  _id: string;
  name: string;
  image?: string;
}

const [places, setPlaces] = useState<Place[]>([]);

 interface Category {
  _id: string;
  name: string;
  icon?: string;
}

const [categories, setCategories] = useState<Category[]>([]);


interface LiveEvent {
  _id: string;
  title: string;
  img: string;
  location: string;
  price: number;
  btn: string;
  dateFrom: string;
  dateTo: string;
}

const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

interface Eat {
  _id: string;
  title: string; // or name
  images?: string[];
  location?: string;
}

const [eats, setEats] = useState<Eat[]>([]);

  // Fetch hero
  const fetchHero = async () => {
    try {
      const res = await fetch("/api/homepage/hero");
      const data = await res.json();
      setHero(data[0] || null);
    } catch (error) {
      console.error("Failed to fetch hero:", error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch places
  const fetchPlaces = async () => {
    try {
      const res = await fetch("/api/admin/places");
      const data = await res.json();
      setPlaces(data);
    } catch (error) {
      console.error("Failed to fetch places:", error);
    }
  };

  // Fetch live events
  const fetchLiveEvents = async () => {
    try {
      const res = await fetch("/api/live-events");
      if (!res.ok) throw new Error("Failed to fetch live events");
      const data = await res.json();
      setLiveEvents(data);
    } catch (err) {
      console.error("Failed to fetch live events:", err);
    }
  };

  // Fetch eats dynamically
  const fetchEats = async () => {
    try {
      const res = await fetch("/api/eats");
      const data = await res.json();
      if (data.success) setEats(data.eats);
    } catch (err) {
      console.error("Failed to fetch eats:", err);
    }
  };

  useEffect(() => {
    fetchHero();
    fetchCategories();
    fetchPlaces();
    fetchLiveEvents();
    fetchEats();
  }, []);

  // Helper scroll function
 const scrollById = (id: string, amount: number) => {
  document.getElementById(id)?.scrollBy({ left: amount, behavior: "smooth" });
};

  return (
    <main className="bg-white" style={{ fontFamily: 'Montserrat' }} dir={dir} lang={locale}>
      {/* Dynamic Hero Section */}
      <section className="relative">
        <img
          src={hero?.image || '/bg.png'}
          alt={hero?.title || t('home.hero.alt')}
          className="w-full h-[320px] sm:h-[420px] md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-opacity-30 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-bold leading-tight mb-3 sm:mb-4">
            {hero?.title || t('home.hero.title')}
          </h1>
          <p className="mb-5 sm:mb-6 max-w-2xl text-[14px] sm:text-[16px] md:text-[18px] font-normal">
            {hero?.subtitle || t('home.hero.subtitle')}
          </p>
           <button
            className="px-5 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded text-white text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
            style={{ backgroundColor: '#56008D' }}
          >
            {t('home.hero.cta')}
          </button>
        </div>
      </section>

     {/* Explore Janoub */}
<section
  id="explore"
  className="px-4 sm:px-6 md:px-8 py-10 md:py-12 relative max-w-[1440px] mx-auto"
>
  <div className="flex justify-between items-center mb-4 md:mb-6">
    <h2 className="text-[22px] sm:text-[26px] md:text-[28px] text-black font-bold">
      {t('home.explore.title')}
    </h2>
    <a
      href="#"
      className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
      style={{ color: '#56008D' }}
    >
      {t('common.viewAll')}
    </a>
  </div>

  <div
    id="explore-scroll"
    className="flex gap-4 sm:gap-6 overflow-x-auto md:overflow-hidden pb-3 md:pb-4 scroll-smooth snap-x snap-mandatory"
  >
    {places.map((place) => (
     <Link key={place._id} href={`/ExploreJanoub?place=${place._id}`} passHref>

        <div className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] rounded-lg overflow-hidden shadow hover:scale-105 transition relative snap-start cursor-pointer">
          {place.image ? (
            <img
              src={place.image}
              alt={place.name}
              className="h-[150px] sm:h-[165px] md:h-[180px] w-full object-cover"
            />
          ) : (
            <div className="h-[150px] sm:h-[165px] md:h-[180px] w-full bg-gray-300 flex items-center justify-center">
              No Image
            </div>
          )}
          <div
            className="absolute top-2 left-2 text-white text-[12px] sm:text-[13px] md:text-[14px] font-semibold"
            style={{
              backgroundColor: '#00000080',
              padding: '8px 12px',
              borderTopLeftRadius: '25px',
              borderBottomRightRadius: '25px',
            }}
          >
            {place.name}
          </div>
        </div>
      </Link>
    ))}
  </div>

  {/* Arrows (hide on small, keep desktop layout) */}
  <button
    onClick={() => scrollById('explore-scroll', dir === 'rtl' ? 240 : -240)}
    className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-[-20px] bg-white shadow-lg w-12 h-12 items-center justify-center rounded-full"
  >
    <ChevronLeft color="#56008D" size={24} />
  </button>
  <button
    onClick={() => scrollById('explore-scroll', dir === 'rtl' ? -240 : 240)}
    className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[-20px] bg-white shadow-lg w-12 h-12 items-center justify-center rounded-full"
  >
    <ChevronRight color="#56008D" size={24} />
  </button>
</section>

  <section className="px-4 sm:px-6 md:px-8 py-10 md:py-12 max-w-[1440px] mx-auto">
  <h2 className="text-[22px] sm:text-[26px] md:text-[28px] text-black font-bold mb-5 md:mb-6">
    {t('home.categories.title')}
  </h2>
  <div className="flex flex-wrap gap-3 sm:gap-4">
    {categories.map((item) => (
      <Link
        key={item._id}
        href={`/ExploreJanoub?category=${item._id}`} // send category id as query param
        className="border rounded-lg flex flex-col items-center justify-center w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] md:w-[140px] md:h-[140px]"
        style={{
          borderColor: '#56008D',
          color: '#56008D',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        <img
          src={item.icon}
          alt={item.name}
          className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] md:w-[32px] md:h-[32px] mb-2"
        />
        {item.name}
      </Link>
    ))}
  </div>
</section>

      {/* Janoub Live Section */}
      <section className="px-4 sm:px-6 md:px-8 py-10 md:py-12 relative max-w-[1440px] mx-auto">
        <div className="flex justify-between items-center mb-5 md:mb-6">
          <h2 className="text-[22px] sm:text-[26px] md:text-[28px] text-black font-bold">
            {t('home.live.title')}
          </h2>
          <a
            href="#"
            className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
            style={{ color: '#56008D' }}
          >
            {t('common.viewAll')}
          </a>
        </div>

        <div
          id="live-scroll"
          className="flex gap-4 sm:gap-6 overflow-x-auto md:overflow-hidden pb-3 md:pb-4 scroll-smooth snap-x snap-mandatory"
        >
          {liveEvents.map((event, i) => {
            const from = new Date(event.dateFrom);
            const to = new Date(event.dateTo);

            const formattedDate = `${from.getDate().toString().padStart(2, '0')} ${from.toLocaleString('en-US', { month: 'short' })} ${from.getFullYear()} → ${to.getDate().toString().padStart(2, '0')} ${to.toLocaleString('en-US', { month: 'short' })} ${to.getFullYear()}`;

            return (
              <div
                key={i}
                className="flex-shrink-0 w-[210px] sm:w-[230px] md:w-[240px] rounded-lg overflow-hidden shadow relative snap-start"
              >
                {/* Image with date overlay */}
                <div className="relative">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="h-[150px] sm:h-[170px] md:h-[180px] w-full object-cover"
                  />
                  <div
                    className="absolute top-0 left-0 w-full text-white text-[10px] sm:text-[11px] md:text-[12px] font-semibold px-3 py-2"
                    style={{ backgroundColor: '#00000080' }}
                  >
                    {formattedDate}
                  </div>
                </div>

                {/* Event Details */}
                <div className="bg-white p-3">
                  <p className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-gray-600">{event.location}</p>
                  <p className="text-[11px] sm:text-[12px] text-gray-400 flex items-center gap-1">
                    {t('home.live.from')} {event.price}
                    <img
                      src="/cuurency.jpg"
                      alt={t('home.live.sar')}
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                    />
                  </p>
                  <h3
                    className="font-bold text-[12px] sm:text-[13px] md:text-[14px] my-2"
                    style={{ color: '#1E1E1E' }}
                  >
                    {event.title}
                  </h3>
           <Link
  href={{
    pathname: "/ticket-booking",
    query: { eventId: event._id },
  }}
  passHref
>
  <button
    className="px-2.5 sm:px-3 py-1 text-white rounded text-[11px] sm:text-[12px] font-semibold cursor-pointer"
    style={{ backgroundColor: '#56008D' }}
  >
    {event.btn}
  </button>
</Link>


                </div>
              </div>
            );
          })}
        </div>

        {/* Arrows */}
        <button
          onClick={() => scrollById('live-scroll', dir === 'rtl' ? 240 : -240)}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-[-20px] bg-white shadow-lg w-12 h-12 items-center justify-center rounded-full"
        >
          <ChevronLeft color="#56008D" size={24} />
        </button>
        <button
          onClick={() => scrollById('live-scroll', dir === 'rtl' ? -240 : 240)}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[-20px] bg-white shadow-lg w-12 h-12 items-center justify-center rounded-full"
        >
          <ChevronRight color="#56008D" size={24} />
        </button>
      </section>

      {/* Janoub Eats — pixel-perfect */}
         <section className="px-4 sm:px-6 md:px-8 py-10 md:py-12 relative max-w-[1440px] mx-auto">
      <div className="flex justify-between items-center mb-5 md:mb-6">
        <h2 className="text-[22px] sm:text-[26px] md:text-[28px] text-black font-bold">
          {t("home.eats.title")}
        </h2>
        <a
          href="#"
          className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
          style={{ color: "#56008D" }}
        >
          {t("common.viewAll")}
        </a>
      </div>

    <div
  id="eats-scroll"
  className="flex gap-4 sm:gap-6 overflow-x-auto md:overflow-hidden pb-3 md:pb-4 scroll-smooth snap-x snap-mandatory"
  style={{ scrollBehavior: "smooth" }}
>
  {eats.map((item, i) => (
    <Link
      key={i}
      href={`/JanoubEats?featured=${item._id}`} // pass eat ID in query
      className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-[344px] rounded-[16px] bg-white border border-[#E6E6E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] snap-start"
    >
      <img
  src={item.images?.[0] || '/placeholder.png'}
  alt={item.title}
  className="w-full h-[180px] sm:h-[200px] md:h-[216px] object-cover rounded-t-[16px]"
/>

      <div className="p-3 sm:p-4">
        <div className="text-[#1E1E1E] font-semibold text-[14px] sm:text-[15px] md:text-[16px] leading-[1.2] mb-2">
          {item.title}
        </div>
        <div className="flex items-center gap-1 text-[11px] sm:text-[12px] uppercase tracking-[0.08em] font-semibold text-[#6B7280]">
          <MapPin className="w-4 h-4" />
          {item.location}
        </div>
      </div>
    </Link>
  ))}
</div>


      {/* Arrows */}
      <button
        onClick={() => scrollById("eats-scroll", dir === "rtl" ? 368 : -368)}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-[-20px] bg-white shadow-lg w-12 h-12 items-center justify-center rounded-full"
      >
        <ChevronLeft color="#56008D" size={24} />
      </button>
      <button
        onClick={() => scrollById("eats-scroll", dir === "rtl" ? -368 : 368)}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[-20px] bg-white shadow-lg w-12 h-12 items-center justify-center rounded-full"
      >
        <ChevronRight color="#56008D" size={24} />
      </button>
    </section>
    </main>
  );
}
