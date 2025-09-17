'use client';

import { MapPin, Clock3, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CompleteGuideAseer from '@/components/CompleteGuideAseer';
import { useI18n } from '@/i18n/LanguageProvider';
import Link from "next/link";

const iconMap: Record<string, string> = {
  SHOPPING: '/icon-shopping.png',
  DINING: '/icon-food.png',
  NATURE: '/Nature.png',
  SPORTS: '/Vector.png',
  'FARM TOUR': '/Farm.png',
  CULTURE: '/Culture.png',
};

interface Destination {
  _id: string;
  title: string;
  img: string;
  tag: string;
  body: string;
  placeId: string;
  imagesMain: string;
  imagesSmall1: string;
  imagesSmall2: string;
  imagesSmall3: string;
  infoTitle: string;
  location: string;
  ages: string;
  activities: string[];
  hoursValue: string;
  closedNow: string;
}

interface Place {
  _id: string;
  name: string;
  image: string;
  tagline?: string;
  description?: string;
}

export default function DestinationPage() {
  const { t, dir, locale } = useI18n();
  const { id } = useParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [cards, setCards] = useState<Destination[]>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        // Fetch main destination
        const res = await fetch(`/api/destinations/${id}`);
        if (!res.ok) throw new Error('Failed to fetch destination');
        const data: Destination = await res.json();
        setDestination(data);

        // Fetch place
        if (data.placeId) {
          const placeRes = await fetch(`/api/places/${data.placeId}`);
          if (placeRes.ok) {
            const placeData: Place = await placeRes.json();
            setPlace(placeData);
          }
        }

        // Fetch "More" cards for the same place
        if (data.placeId) {
          const cardsRes = await fetch(`/api/destinations?place=${data.placeId}`);
          if (cardsRes.ok) {
            const cardsData: Destination[] = await cardsRes.json();
            setCards(cardsData.filter(c => c._id !== data._id)); // exclude current
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  const scrollBy = (value: number) => {
    scrollRef.current?.scrollBy({ left: value, behavior: 'smooth' });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!destination) return <div className="p-8 text-center text-red-500">No data found</div>;


  return (
    <main className="bg-white font-[Montserrat] text-black" dir={dir} lang={locale}>
      {/* Hero */}
      <section className="relative">
        <img src={destination.imagesMain} alt={destination.title} className="w-full h-[400px] object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8">
          <h1 className="text-white text-[36px] font-bold">{destination.title}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 md:px-16 py-10 max-w-[1440px] mx-auto">
        <h2 className="text-[32px] font-bold mb-4 text-black">
  About {destination.title}
</h2>

        <p className="text-[16px] max-w-4xl text-gray-700">{destination.body}</p>

        {/* Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          <div className="lg:col-span-2 grid grid-cols-3 grid-rows-2 gap-4 h-[400px] w-full max-w-[1000px]">
            <div className="col-span-2 row-span-2">
              <img src={destination.imagesMain} className="rounded-md w-full h-full object-cover" alt={destination.title} />
            </div>
            <div className="col-span-1 row-span-1">
              <img src={destination.imagesSmall1} className="rounded-md w-full h-full object-cover" alt={destination.title} />
            </div>
            <div className="col-span-1 row-span-1 flex gap-4">
              <img src={destination.imagesSmall2} className="rounded-md object-cover w-1/2 h-[120px]" alt={destination.title} />
              <img src={destination.imagesSmall3} className="rounded-md object-cover w-1/2 h-[120px]" alt={destination.title} />
            </div>
          </div>

          {/* Info Card */}
          <div className="border rounded-xl shadow px-6 py-5 flex flex-col gap-4">
            <h3 className="text-[18px] font-bold mb-2 text-black">{destination.infoTitle}</h3>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">Location:</span>
              <span>{destination.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span className="font-semibold">Ages:</span>
              <span>{destination.ages}</span>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1" aria-hidden>🎯</span>
              <span className="font-semibold">Activities:</span>
              <div className="flex gap-2 mr-2">
                {destination.activities.map((act) => (
                  <img key={act} src={iconMap[act]} alt={act} className="w-5 h-5" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock3 className="w-4 h-4" />
              <span className="font-semibold">Hours:</span>
              <span>
                {destination.hoursValue} <span className="text-red-500 font-semibold">{destination.closedNow}</span>
              </span>
            </div>

            <div className="rounded-lg overflow-hidden mt-3 h-[140px]">
  <iframe
    src={`https://www.google.com/maps?q=${encodeURIComponent(destination.location)}&output=embed`}
    width="100%"
    height="100%"
    className="border-0"
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

<button
  onClick={() =>
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.location)}`,
      "_blank"
    )
  }
  className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg mt-2 py-2 text-sm font-semibold"
>
  {t('poi.aboNoghtha.info.directionsCta')}
</button>

          </div>
        </div>
{/* More in Aseer */}
{cards.length > 0 && (
  <div className="mt-16 relative">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-[24px] font-bold">
        {place?.name ? `More in ${place.name}` : t('poi.aboNoghtha.more.title')}
      </h3>

      <button className="text-purple-700 font-medium text-sm">
        {t('common.viewAll')}
      </button>
    </div>

    <button
      onClick={() => scrollBy(dir === 'rtl' ? 340 : -340)}
      className="absolute top-1/2 -translate-y-1/2 left-[-20px] z-10 bg-white shadow w-12 h-12 flex items-center justify-center rounded-full"
      aria-label={t('dest.a11y.prev')}
    >
      <ChevronLeft color="#56008D" size={24} />
    </button>
    <button
      onClick={() => scrollBy(dir === 'rtl' ? -340 : 340)}
      className="absolute top-1/2 -translate-y-1/2 right-[-20px] z-10 bg-white shadow w-12 h-12 flex items-center justify-center rounded-full"
      aria-label={t('dest.a11y.next')}
    >
      <ChevronRight color="#56008D" size={24} />
    </button>

    <div
      ref={scrollRef}
      className="overflow-x-auto scrollbar-hide scroll-smooth flex gap-6 pb-4 pr-2"
    >
      {cards.map((item) => (
        <div
          key={item._id}
          className="min-w-[344px] max-w-[344px] bg-white rounded-2xl shadow border overflow-hidden"
        >
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-[200px] object-cover"
          />
          <div className="p-4 flex flex-col justify-between h-[140px]">
            <div>
              <h4 className="font-bold text-[16px] text-black">{item.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {t('poi.aboNoghtha.more.cardSubtitle')}
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              {/* ✅ Button with Link */}
         <Link href={`/JanoubEats?featured=${item._id}`}>
  <button className="text-white bg-purple-700 text-sm px-4 py-2 rounded-md font-medium cursor-pointer">
    {t('poi.aboNoghtha.more.cta')}
  </button>
</Link>



              <span className="flex items-center gap-1 text-[12px] font-semibold text-[#56008D]">
                <img
                  src={iconMap[item.tag.toUpperCase()] || '/default-icon.png'}
                  alt={t(`dest.tags.${item.tag.toUpperCase()}`)}
                  className="w-6 h-6"
                />
                {t(`dest.tags.${item.tag.toUpperCase()}`)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

   {/* Explore Al Baha banner */}
        <div className="mt-20 rounded-xl overflow-hidden">
          <div className="relative">
            <img src="/Albaha1.png" alt={t('poi.aboNoghtha.albaha.alt')} className="w-full h-[220px] object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8">
              <h4 className="text-white text-[20px] font-semibold">{t('poi.aboNoghtha.albaha.title')}</h4>
              <p className="text-white text-sm">{t('poi.aboNoghtha.albaha.subtitle')}</p>
            </div>
          </div>
        </div>
        <CompleteGuideAseer />
      </section>
    </main>
  );
}
