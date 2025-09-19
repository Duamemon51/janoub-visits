'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CompleteGuideAseer from '@/components/CompleteGuideAseer';
import { useI18n } from '@/i18n/LanguageProvider';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LivePage() {
  const { t, locale, dir } = useI18n();
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [eats, setEats] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any | null>(null);

  const searchParams = useSearchParams();
  const featuredId = searchParams.get('featured');

  // Fetch live events dynamically
  const fetchLiveEvents = async () => {
    try {
      const res = await fetch('/api/live-events');
      if (!res.ok) throw new Error('Failed to fetch live events');
      const data = await res.json();
      setLiveEvents(data);
    } catch (err) {
      console.error('Failed to fetch live events:', err);
    }
  };

  // Fetch eats dynamically
  const fetchEats = async (featuredId?: string) => {
    try {
      const url = featuredId ? `/api/eats?featured=${featuredId}` : '/api/eats';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch eats');

      const data = await res.json();
      if (data.success) {
        setEats(data.eats);

        // Agar featuredId diya hai toh usko set karo, warna first eat ko featured
        if (featuredId && data.eats.length > 0) {
          setFeatured(data.eats[0]);
        } else if (!featuredId && data.eats.length > 0) {
          setFeatured(data.eats[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch eats:', err);
    }
  };

  useEffect(() => {
    fetchEats(featuredId || undefined);
  }, [featuredId]);

  useEffect(() => {
    fetchLiveEvents();
  }, []);

  const booking = {
    title: t('livePage.booking.title'),
    from: t('livePage.booking.from'),
    sarPerDay: t('livePage.booking.sarPerDay'),
    body: t('livePage.booking.body'),
    cardNumber: t('livePage.booking.cardNumber'),
    visa: t('livePage.booking.visa'),
    mastercard: t('livePage.booking.mastercard'),
    name: t('livePage.booking.name'),
    cvv: t('livePage.booking.cvv'),
    payNow: t('livePage.booking.payNow'),
  };

  const calendarWeek = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    t(`livePage.calendar.week.${i}`)
  );
  const locationItems = [0, 1, 2, 3, 4].map((i) =>
    t(`livePage.locations.items.${i}`)
  );
  const scrollById = (id: string, amount: number) =>
    document.getElementById(id)?.scrollBy({ left: amount, behavior: 'smooth' });

  function toArabicDigits(num: number | string) {
    const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return num.toString().split('').map(d => {
      if (d >= '0' && d <= '9') return arabicDigits[parseInt(d)];
      return d;
    }).join('');
  }
  return (
    <main
      className="bg-white font-[Montserrat] text-black pt-[64px] pb-[80px] px-4 md:px-8"
      dir={dir}
      lang={locale}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Hero */}
        <div className="w-full rounded-[16px] overflow-hidden mb-10 relative">
          <img
            src="/events.png"
            alt={t('livePage.hero.alt')}
            className="
              block w-full object-cover rounded-[16px]
              h-[220px] sm:h-[300px] md:h-[400px] lg:h-[480px]
              object-[20%_50%] sm:object-[30%_50%] md:object-center
            "
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-[16px]" />
        </div>

        {/* Live Events Section */}
        <section className="px-4 sm:px-6 md:px-8 py-10 md:py-12 relative max-w-[1440px] mx-auto">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <h2 className="text-[22px] sm:text-[26px] md:text-[28px] text-black font-bold">
              {t('home.live.title')}
            </h2>
            <Link 
      href="/JanoubLive" 
      className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
      style={{ color: '#56008D' }}
    >
      {t('common.viewAll')}
    </Link>
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
  
        {/* Featured block - only render if featured available */}
        {featured && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="md:col-span-2">
              <h2 className="text-[28px] md:text-[32px] font-bold text-black leading-tight">
                {featured.title ?? 'Unnamed Place'}
              </h2>
            <p className="mt-1 text-sm text-gray-700 font-semibold">
  {t("From")}{" "}
  {locale === "ar" ? toArabicDigits(featured.price ?? 0) : featured.price ?? 0}{" "}
  <span className="font-[system-ui]">
    {t("per Person")}
  </span>
</p>


              <p className="mt-4 text-[16px] text-[#1E1E1E] font-medium leading-relaxed">
                {featured.description}
              </p>
              <button
  className="mt-4 px-4 py-2 text-white font-semibold text-sm rounded bg-[#56008D] cursor-pointer"
  onClick={() => {
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(featured.location)}`;
    window.open(mapUrl, "_blank");
  }}
>
  {t("livePage.info.directionsCta")}
</button>

              <div className="mt-6 w-full h-[280px] rounded-[16px] overflow-hidden">
                <img
                  src={featured.images?.[0] || "/placeholder.png"}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

           {/* Info card */}
<div className="rounded-[16px] shadow-md border border-gray-100 overflow-hidden">
  <div className="bg-[#56008D] text-white text-center py-4 px-2">
    <p className="text-xs font-semibold">{t("livePage.calendar.title")}</p>
    <p className="text-[20px] font-bold">{t("livePage.calendar.selectedDay")}</p>
    <p className="text-[20px] font-bold">→ {t("livePage.calendar.monthYear")}</p>
  </div>
  <div className="p-4 space-y-3 text-sm text-[#1E1E1E] font-medium">
    <div className="flex items-center justify-between border-b pb-2">
      <span>{t("livePage.info.locationLabel")}</span>
      <span className="text-right">{featured.location}</span>
    </div>
    <div className="flex items-center justify-between border-b pb-2">
      <span>{t("livePage.info.agesLabel")}</span>
      <span className="text-right">{featured.ages ?? "All Ages"}</span>
    </div>
    <div className="flex items-center justify-between border-b pb-2">
      <span>{t("livePage.info.activitiesLabel")}</span>
      <span className="text-right">🎯 🎡</span>
    </div>
    <div className="flex items-center justify-between">
      <span>{t("livePage.info.hoursLabel")}</span>
      <div className="text-right">
        <p>{featured.hours}</p>
        <p className="text-green-600 text-xs font-semibold">
          {featured.openNow ?? ""}
        </p>
      </div>
    </div>
  </div>

  {/* Map iframe showing featured location */}
  <div className="w-full h-[120px]">
    <iframe
      src={`https://www.google.com/maps?q=${encodeURIComponent(featured.location)}&output=embed`}
      className="w-full h-full"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>

  <div className="p-4 flex flex-col gap-2">
  <button
    className="bg-[#56008D] text-white rounded py-2 text-sm font-semibold cursor-pointer"
    onClick={() => {
      const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(featured.location)}`;
      window.open(mapUrl, "_blank");
    }}
  >
    {t("livePage.info.directionsCta")}
  </button>
 <Link
  href={{
    pathname: "/ticket-booking",
    query: { eatId: featured?._id ?? "" },
  }}
  className="w-full"
>
  <button className="w-full bg-[#56008D] text-white rounded py-2 text-sm font-semibold cursor-pointer">
    {t("Pay")}
  </button>
</Link>

</div>

</div>

          </section>
        )}
        {/* Booking */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-[32px] font-bold text-black mb-2">{booking.title}</h2>
            <p className="text-sm text-[#1E1E1E] font-semibold mb-4">
              {booking.from}{' '}
              <span className="font-bold">
                {locale === 'ar' ? toArabicDigits(520) : 520} {booking.sarPerDay}
              </span>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-xl">
              {booking.body}
            </p>

            
            <Link
  href={{
    pathname: "/ticket-booking",
    query: { eatId: featured?._id ?? "" },
  }}
>
  <button className="bg-[#56008D] text-white text-sm font-semibold px-6 py-2 rounded cursor-pointer">
    {booking.payNow}
  </button>
</Link>
          </div>

          {/* Calendar + locations */}
          <div className="rounded-[16px] border border-gray-200 shadow-md p-6 w-full max-w-[344px] mx-auto">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              {t('livePage.calendar.title')}
            </h3>

            <div className="border border-gray-300 rounded-[12px] p-4 text-center text-sm mb-4">
              <p className="text-[#56008D] font-semibold mb-2">
                {t('livePage.calendar.selectedDay')}
              </p>
              <p className="text-gray-700 text-sm font-medium">
                {t('livePage.calendar.monthYear')}
              </p>
              <div className="grid grid-cols-7 gap-1 text-xs mt-3 text-gray-500">
                {calendarWeek.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <p className="mt-3 text-[#56008D] font-semibold cursor-pointer">
                {t('livePage.calendar.next')}
              </p>
            </div>

            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              {t('livePage.locations.title')}
            </h4>
            <ul className="space-y-1 text-sm text-[#1E1E1E]">
              {locationItems.map((loc, i) => (
                <li key={i}>
                  <span className={i === 0 ? 'text-[#56008D] font-bold' : 'text-gray-400'}>
                    {i === 0 ? '●' : '○'}
                  </span>{' '}
                  {loc}
                </li>
              ))}
            </ul>
          </div>
        </section>
      
        
     
      </div>
    </main>
  );
}
