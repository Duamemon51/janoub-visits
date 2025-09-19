'use client';
import Link from "next/link";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CompleteGuideAseer from '@/components/CompleteGuideAseer';
import { useI18n } from '@/i18n/LanguageProvider';

interface Eat {
  _id: string;
  title: string;
  description?: string;
  img?: string;
  images?: string[];
  price?: number;
  location?: string;
  hours?: string;
  availableSeats?: number;
  perPersonLimit?: number;
}


interface Featured {
  id: string;
  title: string;
  body: string;
  fromPrice: number;
  perPerson: string;
  location: string;
  ages: string;
  activities: string;
  hours: string;
  images: {
    main: string;
    small1: string;
    small2: string;
    small3: string;
  };
   availableSeats?: number;
  perPersonLimit?: number;
}

function JanoubEatsContent() {
  const { t, dir, locale } = useI18n();
  const searchParams = useSearchParams();
  const featuredId = searchParams.get('featured');

  const [eats, setEats] = useState<Eat[]>([]);
  const [featured, setFeatured] = useState<Featured | null>(null);

  // Dining fetch
  useEffect(() => {
    const fetchEats = async () => {
      try {
        const res = await fetch('/api/eats');
        const data = await res.json();
        if (data.success) {
          // Map API fields to Eat interface
          const mappedEats = data.eats.map((e: any) => ({
  _id: e._id,
  title: e.title,
  img: e.images[0] || "/placeholder.png",  // main image
  images: e.images.length ? e.images : ["/placeholder.png"], // full array
  description: e.description,
  price: e.price,
  location: e.location,
  hours: e.hours,
  availableSeats: e.availableSeats,
  perPersonLimit: e.perPersonLimit,
}));

          setEats(mappedEats);
        }
      } catch (err) {
        console.error('Error fetching eats:', err);
      }
    };
    fetchEats();
  }, []);

  // Featured fetch
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        let url = '/api/eats';
        if (featuredId) url += `?featured=${featuredId}`;
        const res = await fetch(url);
        const data = await res.json();

       if (data.success && data.eats.length > 0) {
  const firstEat = data.eats[0];
  const imgs = firstEat.images || ["/placeholder.png"]; // array of images from backend

  setFeatured({
    id: firstEat._id,
    title: firstEat.title,
    body: firstEat.description || '',
    fromPrice: firstEat.price || 0,
    perPerson: 'per person',
    location: firstEat.location || '',
    ages: 'All',
    activities: 'All',
    hours: firstEat.hours || '',
    images: {
      main: imgs[0] || "/placeholder.png",
      small1: imgs[1] || "/placeholder.png",
      small2: imgs[2] || "/placeholder.png",
      small3: imgs[3] || "/placeholder.png",
    },
  });
}

        
      } catch (err) {
        console.error('Error fetching featured eat:', err);
      }
    };
    fetchFeatured();
  }, [featuredId]);

  const scrollById = (id: string, amount: number) => {
    document.getElementById(id)?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <main className="w-screen min-h-screen overflow-x-hidden bg-white font-[Montserrat]" dir={dir} lang={locale}>
      {/* Hero */}
      <div className="w-full rounded-[16px] overflow-hidden mb-10 relative">
        <img
          src="/Ads.png"
          alt={t('livePage.hero.alt')}
          className="block w-full object-cover rounded-[16px] h-[220px] sm:h-[300px] md:h-[400px] lg:h-[480px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-[16px]" />
      </div>

      {/* Dining Section */}
      <section className="px-6 md:px-16 py-10 max-w-[1440px] mx-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#222]">
            {t("livePage.food.title")}
          </h2>
         <Link 
      href="/JanoubEats" 
      className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
      style={{ color: '#56008D' }}
    >
      {t('common.viewAll')}
    </Link>
        </div>

        <div className="relative">
          <div
            id="eats-places-scroll"
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
          >
            {eats.map((eat, i) => (
              <Link
                key={i}
                href={`/JanoubEats?featured=${eat._id}`}
                className="min-w-[200px] max-w-[200px] flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition cursor-pointer"
              >
                <img
                  src={eat.img || "/placeholder.png"}  // renamed
                  alt={eat.title || "No name"}         // renamed
                  className="w-full h-[140px] object-cover"
                />
                <div className="p-3">
                  <p className="text-[14px] text-[#333] font-medium">
                    {eat.title ?? "Unnamed Place"}     {/* renamed */}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Chevrons */}
          <button
            onClick={() =>
              scrollById("eats-places-scroll", dir === "rtl" ? 240 : -240)
            }
            className="absolute top-1/2 -translate-y-1/2 left-[-20px] bg-white shadow w-10 h-10 rounded-full flex items-center justify-center z-10"
          >
            <ChevronLeft color="#6C2BD9" size={20} />
          </button>
          <button
            onClick={() =>
              scrollById("eats-places-scroll", dir === "rtl" ? -240 : 240)
            }
            className="absolute top-1/2 -translate-y-1/2 right-[-20px] bg-white shadow w-10 h-10 rounded-full flex items-center justify-center z-10"
          >
            <ChevronRight color="#6C2BD9" size={20} />
          </button>
        </div>
      </section>

      {/* Featured Section */}
      {featured && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-[#6C2BD9] mb-2 flex items-center gap-1">
              {t('livePage.featured.from')} {featured.fromPrice}
              <img src="/cuurency.jpg" alt={t('home.live.sar')} className="inline-block w-4 h-4 object-contain" />
              {featured.perPerson}
            </p>
            <h2 className="text-[32px] font-bold mb-4 text-[#222]">{featured.title}</h2>
            <p className="text-[14px] leading-relaxed mb-6 text-[#222]">{featured.body}</p>

            <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[400px] w-full max-w-[1000px]">
              <div className="col-span-2 row-span-2">
                <img src={featured.images.main} alt="main featured" className="rounded-md w-full h-full object-cover" />
              </div>
              <div className="col-span-1 row-span-1">
                <img src={featured.images.small1} alt="small1" className="rounded-md w-full h-full object-cover" />
              </div>
              <div className="col-span-1 row-span-1 flex gap-4">
                <img src={featured.images.small2} alt="small2" className="rounded-md w-1/2 h-[120px] object-cover" />
                <img src={featured.images.small3} alt="small3" className="rounded-md w-1/2 h-[120px] object-cover" />
              </div>
            </div>
          </div>

          {/* right */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-sm">
            <h3 className="font-semibold text-[16px] mb-4 text-black">{t('livePage.info.title')}</h3>
            <ul className="space-y-3 mb-4">
              <li className="flex justify-between">
                <span>📍 {t('livePage.info.locationLabel')}</span>
                <span className="font-medium">{featured.location}</span>
              </li>
              <li className="flex justify-between">
                <span>🎯 {t('livePage.info.agesLabel')}</span>
                <span className="font-medium">{featured.ages}</span>
              </li>
              <li className="flex justify-between">
                <span>🎉 {t('livePage.info.activitiesLabel')}</span>
                <span className="font-medium">{featured.activities}</span>
              </li>
              <li className="flex justify-between">
                <span>🕒 {t('livePage.info.hoursLabel')}</span>
                <span className="font-medium">
                  {featured.hours} <br />
                  <span className="text-[#10B981] font-semibold">{t('livePage.featured.openNow')}</span>
                </span>
              </li>
            </ul>

            {/* Map iframe showing featured location */}
            <div className="w-full h-[160px] rounded-md overflow-hidden mb-4">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(featured.location)}&output=embed`}
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Buttons */}
            <button
              className="w-full bg-[#6C2BD9] text-white py-2 rounded-md mb-2 font-medium hover:bg-[#5A1DC0] transition cursor-pointer"
              onClick={() => {
                const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(featured.location)}`;
                window.open(mapUrl, "_blank");
              }}
            >
              {t('livePage.info.directionsCta')}
            </button>

            <Link
              href={{
                pathname: "/ticket-booking",
                query: { featured: featured.id },
              }}
              className="w-full"
            >
              <button
                className="w-full border border-[#6C2BD9] text-[#6C2BD9] py-2 rounded-md font-medium hover:bg-[#f4ebff] transition cursor-pointer"
              >
                {t('livePage.featured.pay')}
              </button>
            </Link>
          </div>
        </section>
      )}

      <CompleteGuideAseer />
    </main>
  );
}

// Wrapper component (Suspense)
export default function JanoubEatsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <JanoubEatsContent />
    </Suspense>
  );
}
