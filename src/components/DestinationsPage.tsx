'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/LanguageProvider';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CompleteGuideAseer from '@/components/CompleteGuideAseer';
import { ChevronLeft, ChevronRight } from 'lucide-react';


interface Destination {
  _id: string;
  title: string;
  img: string;
  tag: string;
  placeId?: string;
  categoryId?: {
    _id: string;
    name: string;
    description?: string;
  };
  location?: string;
}

interface Place {
  _id: string;
  name: string;
  image: string;
  tagline: string;
  description: string;
}

interface LiveEvent {
  _id: string;
  title: string;
  dateFrom: string;
  dateTo: string;
  location: string;
  price: number | string;
  img: string;
  btn: string;
  placeId?: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  tagline?: string;
}

export default function DestinationsPage() {
  const { t, dir, locale } = useI18n();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [tours, setTours] = useState<
    {
      _id: string;
      title: string;
      price: string;
      img: string;
      tag?: string;
      placeId?: { _id: string; name: string };
    }[]
  >([]);

  const [ready, setReady] = useState(false);
  const searchParams = useSearchParams();
  const placeId = ready ? searchParams.get('place') : null;
  const categoryId = ready ? searchParams.get('category') : null;

  // ensure useSearchParams runs only on client
  useEffect(() => {
    setReady(true);
  }, []);

  // Fetch destinations, place, category
  useEffect(() => {
    if (!ready) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        let url = '/api/destinations';
        const queryParams = new URLSearchParams();
        if (placeId) queryParams.append('place', placeId);
        if (categoryId) queryParams.append('category', categoryId);
        if ([...queryParams].length) url += `?${queryParams.toString()}`;

        const [destRes, placeRes, categoryRes] = await Promise.all([
          fetch(url),
          placeId ? fetch(`/api/places/${placeId}`) : null,
          categoryId ? fetch(`/api/categories/${categoryId}`) : null,
        ]);

        if (!destRes.ok) throw new Error('Failed to fetch destinations');
        const data: Destination[] = await destRes.json();
        setDestinations(data);

        if (placeRes && placeRes.ok) {
          const placeData: Place = await placeRes.json();
          setPlace(placeData);
        }

        if (categoryRes && categoryRes.ok) {
          const categoryData = await categoryRes.json();
          setCategory(categoryData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ready, placeId, categoryId]);

  // Fetch live events
  useEffect(() => {
    if (!ready) return;
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const res = await fetch('/api/live-events');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data: LiveEvent[] = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, [ready]);

  useEffect(() => {
  if (!ready) return;
  const fetchTours = async () => {
    try {
      let url = '/api/tours';
      if (placeId) url += `?placeId=${placeId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tours');
      const data = await res.json();

      // Make sure tours is an array
      setTours(Array.isArray(data.tours) ? data.tours : []);
    } catch (err) {
      console.error(err);
      setTours([]); // fallback to empty array
    }
  };
  fetchTours();
}, [ready, placeId]);

  const scrollById = (id: string, amount: number) => {
    document.getElementById(id)?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const iconMap: Record<string, string> = {
    SHOPPING: '/icon-shopping.png',
    DINING: '/icon-food.png',
    NATURE: '/Nature.png',
    SPORTS: '/Vector.png',
    'FARM TOUR': '/Farm.png',
    CULTURE: '/Culture.png',
  };

  if (!ready) return <div className="p-8 text-center">Loading...</div>;
  if (loading) return <div className="p-8 text-center">Loading destinations...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <main className="bg-white font-[Montserrat] text-black" dir={dir} lang={locale}>
      {/* Hero */}
    <section className="relative">
  <img
    src={
      categoryId
        ? category?.image || "/hero.png" // ✅ show category image if exists
        : place?.image || "/hero.png"    // fallback to place image
    }
    alt={
      categoryId
        ? category?.name || t('dest.hero.alt')
        : place?.name || t('dest.hero.alt')
    }
    className="w-full h-[400px] object-cover"
  />
  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8">
    <p className="text-white text-[14px] mb-1">
      {categoryId
        ? category?.tagline || t('dest.hero.tagline')
        : place?.tagline || t('dest.hero.tagline')}
    </p>
    <h1 className="text-white text-[36px] font-bold">
      {categoryId
        ? category?.name || t('dest.hero.title')
        : place?.name || t('dest.hero.title')}
    </h1>
  </div>
</section>



      {/* About */}
     <section className="px-8 py-10">
  <h2 className="text-[28px] font-bold mb-4">
    {category
      ? `About ${category.name}` // ✅ category name
      : place?.name
      ? `About ${place.name}` // ✅ place name
      : t('dest.about.title')}
  </h2>
  <p className="text-[14px] leading-relaxed max-w-5xl">
    {category
      ? category.description || 'No description available' // ✅ category description
      : place?.description || t('dest.about.body')}
  </p>
</section>


     <section className="px-8 pb-12">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {destinations
      .filter((dest) =>
        place?.name
          ? dest.placeId === placeId          // Filter by selected place
          : category?.name
          ? true                               // Show all for category
          : dest.location === "Aseer"          // Default: only Aseer destinations
      )
      .map((dest) => (
        <Link
          key={dest._id}
          href={`/ExploreJanoub/${dest._id}`}
          className="rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition block"
        >
          <img src={dest.img} alt={dest.title} className="h-[180px] w-full object-cover" />
          <div className="p-4 flex flex-col justify-between h-[140px]">
            <h3 className="text-[14px] font-bold">{dest.title}</h3>
            <div className="flex justify-between items-center mt-auto">
              <button
                className="px-3 py-1 text-white rounded text-[12px] font-semibold"
                style={{ backgroundColor: '#56008D' }}
              >
                {t('dest.cards.cta')}
              </button>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-[#56008D]">
                <img
                  src={iconMap[dest.tag.toUpperCase() as keyof typeof iconMap]}
                  alt={t(`dest.tags.${dest.tag.toUpperCase()}`)}
                  className="w-4 h-4 object-contain"
                />
                {dest.categoryId?.name || t(`dest.tags.${dest.tag.toUpperCase()}`)}
              </span>
            </div>
          </div>
        </Link>
      ))}
  </div>
</section>

<section className="px-8 py-12 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[28px] font-bold">{t('dest.tours.title')}</h2>
      <Link 
      href="/ExploreJanoub" 
      className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
      style={{ color: '#56008D' }}
    >
      {t('common.viewAll')}
    </Link>
      </div>

    <div
  id="tours-scroll"
  className="flex gap-6 overflow-hidden pb-4 scroll-smooth"
>
  {tours.map((tour, i) => (
    <div
      key={i}
      className="flex-shrink-0 w-[240px] rounded-lg overflow-hidden border border-gray-200 shadow-sm"
    >
      <img
        src={tour.img || '/placeholder.jpg'}
        alt={tour.title}
        className="h-[180px] w-full object-cover"
      />
      <div className="p-3">
        {tour.tag && (
          <p className="text-[12px]">{tour.tag}</p>
        )}
        {tour.price && (
  <p className="text-[12px] font-semibold">
    From {tour.price} SAR 
  </p>
)}
<h3 className="font-bold text-[14px] my-2">{tour.title}</h3>

       <Link
  href={{
    pathname: "/ticket-booking",
    query: { tourId: tour._id }, // tours array vich jo _id aa reha hai
  }}
  passHref
>
  <button
    className="px-3 py-1 text-white rounded text-[12px] cursor-pointer"
    style={{ backgroundColor: "#56008D" }}
  >
    {t("dest.tours.cta")}
  </button>
</Link>

      </div>
    </div>
  ))}
</div>


      {/* Scroll buttons */}
      <button
        onClick={() => scrollById('tours-scroll', dir === 'rtl' ? -240 : 240)}
        className="absolute top-1/2 -translate-y-1/2 right-[-20px] bg-white shadow w-12 h-12 flex items-center justify-center rounded-full"
        aria-label={t('dest.a11y.prev')}
      >
        <ChevronRight color="#56008D" size={24} />
      </button>
      <button
        onClick={() => scrollById('tours-scroll', dir === 'rtl' ? 240 : -240)}
        className="absolute top-1/2 -translate-y-1/2 left-[-20px] bg-white shadow w-12 h-12 flex items-center justify-center rounded-full"
        aria-label={t('dest.a11y.next')}
      >
        <ChevronLeft color="#56008D" size={24} />
      </button>
    </section>

      {/* Events Scroll */}
      <section className="px-8 py-12 relative">
  <div className="flex justify-between items-center mb-6">
   <h2 className="text-[28px] font-bold">
  {place?.name
    ? `What's Going On in ${place.name}`  // For a place
    : category?.name
    ? 'Janoub Live'                        // For a category
    : "What's Going On in Aseer"}         
</h2>


 <Link 
      href="/JanoubLive" 
      className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold"
      style={{ color: '#56008D' }}
    >
      {t('common.viewAll')}
    </Link>
  </div>

  <div id="events-scroll" className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory">
  {events
    .filter((event) =>
      place?.name
        ? event.placeId === placeId            // Filter by place
        : category?.name
        ? true                                 // Show all for category
        : event.location === "Aseer"          // Default: show only Aseer events
    )
    .map((event, i) => {
      const from = new Date(event.dateFrom);
      const to = new Date(event.dateTo);
      const formattedDate = `${from.getDate().toString().padStart(2, '0')} ${from.toLocaleString('en-US', { month: 'short' })} ${from.getFullYear()} → ${to.getDate().toString().padStart(2, '0')} ${to.toLocaleString('en-US', { month: 'short' })} ${to.getFullYear()}`;

      return (
        <div key={i} className="flex-shrink-0 w-[240px] rounded-lg overflow-hidden border border-gray-200 shadow-sm snap-start">
          <div className="relative">
            <img src={event.img} alt={event.title} className="h-[180px] w-full object-cover" />
            <div className="absolute top-0 left-0 w-full text-white text-[12px] font-semibold px-3 py-2" style={{ backgroundColor: '#00000080' }}>
              {formattedDate}
            </div>
          </div>
          <div className="p-3">
            <p className="text-[14px] font-semibold">{event.location}</p>
            <p className="text-[12px]">{event.price} SAR</p>
            <h3 className="font-bold text-[14px] my-2">{event.title}</h3>
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

  {events.filter((event) =>
    place?.name
      ? event.placeId === placeId
      : category?.name
      ? true
      : event.location === "Aseer"
  ).length === 0 && (
    <p className="text-gray-500 text-center w-full">No events available</p>
  )}
</div>


  <button
    onClick={() => scrollById('events-scroll', dir === 'rtl' ? -240 : 240)}
    className="absolute top-1/2 -translate-y-1/2 right-[-20px] bg-white shadow w-12 h-12 flex items-center justify-center rounded-full"
    aria-label={t('dest.a11y.prev')}
  >
    <ChevronRight color="#56008D" size={24} />
  </button>
  <button
    onClick={() => scrollById('events-scroll', dir === 'rtl' ? 240 : -240)}
    className="absolute top-1/2 -translate-y-1/2 left-[-20px] bg-white shadow w-12 h-12 flex items-center justify-center rounded-full"
    aria-label={t('dest.a11y.next')}
  >
    <ChevronLeft color="#56008D" size={24} />
  </button>
</section>

   {/* Complete Guide (translate inside that component if needed) */}
      <CompleteGuideAseer />
       {/* Explore Taif Banner */}
      <section className="px-8 pb-12 mt-12">
        <div className="rounded-lg overflow-hidden relative">
          <img src="/17.jpg" alt={t('dest.taif.alt')} className="w-full h-[200px] object-cover" />
          <div className="absolute bottom-4 right-6 text-white text-right">
            <h3 className="text-[20px] font-bold">{t('dest.taif.title')}</h3>
            <p className="text-[12px]">{t('dest.taif.subtitle')}</p>
          </div>
        </div>
      </section>
    </main>

  );
}
