"use client"; // Must be first

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

// -------------------- Interfaces --------------------
interface Place {
  _id: string;
  name: string;
  image?: string;
  type: "Place";
}

interface Category {
  _id: string;
  name: string;
  icon?: string;
  type: "Category";
}

interface Eat {
  _id: string;
  title: string;
  images?: string[];
  location?: string;
  type: "Eat";
}

interface LiveEvent {
  _id: string;
  title: string;
  img: string;
  location: string;
  price: number;
  btn: string;
  dateFrom: string;
  dateTo: string;
  type: "LiveEvent";
}

interface Tour {
  _id: string;
  name: string;
  img?: string;
  description?: string;
  type: "Tour";
}

interface Destination {
  _id: string;
  title: string;
  img: string;
  tag?: string;
  location?: string;
  type: "Destination";
}

type SearchResult =
  | Place
  | Category
  | Eat
  | LiveEvent
  | Tour
  | Destination;

// -------------------- Cards --------------------
const PlaceCard = ({ place }: { place: Place }) => (
  <Link href={`/ExploreJanoub?place=${place._id}`}>
    <div className="w-[220px] rounded-lg overflow-hidden shadow hover:scale-105 transition relative cursor-pointer">
      {place.image ? (
        <img src={place.image} alt={place.name} className="h-[165px] w-full object-cover" />
      ) : (
        <div className="h-[165px] w-full bg-gray-300 flex items-center justify-center">
          No Image
        </div>
      )}
      <div
        className="absolute top-2 left-2 text-white text-[14px] font-semibold"
        style={{
          backgroundColor: "#00000080",
          padding: "6px 12px",
          borderTopLeftRadius: "25px",
          borderBottomRightRadius: "25px",
        }}
      >
        {place.name}
      </div>
    </div>
  </Link>
);

const CategoryCard = ({ category }: { category: Category }) => (
  <Link
    href={`/ExploreJanoub?category=${category._id}`}
    className="border rounded-lg flex flex-col items-center justify-center w-[140px] h-[140px]"
    style={{ borderColor: "#56008D", color: "#56008D", fontWeight: 600 }}
  >
    <img src={category.icon} alt={category.name} className="w-[32px] h-[32px] mb-2" />
    {category.name}
  </Link>
);

const EatCard = ({ eat }: { eat: Eat }) => (
  <Link
    href={`/JanoubEats?featured=${eat._id}`}
    className="w-[300px] rounded-[16px] bg-white border border-[#E6E6E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
  >
    <img src={eat.images?.[0] || "/placeholder.png"} alt={eat.title} className="w-full h-[200px] object-cover rounded-t-[16px]" />
    <div className="p-4">
      <div className="text-[#1E1E1E] font-semibold text-[15px] leading-[1.2] mb-2">{eat.title}</div>
      {eat.location && (
        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#6B7280]">
          <MapPin className="w-4 h-4" />
          {eat.location}
        </div>
      )}
    </div>
  </Link>
);

const LiveEventCard = ({ event }: { event: LiveEvent }) => {
  const from = new Date(event.dateFrom);
  const to = new Date(event.dateTo);
  const formattedDate = `${from.getDate().toString().padStart(2, "0")} ${from.toLocaleString("en-US", { month: "short" })} ${from.getFullYear()} → ${to.getDate().toString().padStart(2, "0")} ${to.toLocaleString("en-US", { month: "short" })} ${to.getFullYear()}`;

  return (
    <div className="w-[240px] rounded-lg overflow-hidden shadow relative">
      <div className="relative">
        <img src={event.img} alt={event.title} className="h-[170px] w-full object-cover" />
        <div className="absolute top-0 left-0 w-full text-white text-[11px] font-semibold px-3 py-2" style={{ backgroundColor: "#00000080" }}>
          {formattedDate}
        </div>
      </div>
      <div className="bg-white p-3">
        <p className="text-[13px] font-semibold text-gray-600">{event.location}</p>
        <p className="text-[12px] text-gray-400 flex items-center gap-1">
          From {event.price} <img src="/cuurency.jpg" alt="SAR" className="w-3 h-3 object-contain" />
        </p>
        <h3 className="font-bold text-[13px] my-2 text-[#1E1E1E]">{event.title}</h3>
        <Link href={{ pathname: "/ticket-booking", query: { eventId: event._id } }}>
          <button className="px-3 py-1 text-white rounded text-[12px] font-semibold" style={{ backgroundColor: "#56008D" }}>
            {event.btn}
          </button>
        </Link>
      </div>
    </div>
  );
};

const TourCard = ({ tour }: { tour: Tour }) => (
  <div className="w-[260px] rounded-lg overflow-hidden shadow bg-white">
    <img src={tour.img || "/placeholder.png"} alt={tour.name} className="h-[160px] w-full object-cover" />
    <div className="p-3">
      <h3 className="font-bold text-[15px] mb-2">{tour.name}</h3>
      <p className="text-[13px] text-gray-600 line-clamp-2">{tour.description || "Explore this tour"}</p>
    </div>
  </div>
);

const DestinationCard = ({ destination }: { destination: Destination }) => (
  <Link href={`/ExploreJanoub?destination=${destination._id}`} className="w-[240px] rounded-lg overflow-hidden shadow bg-white">
    <img src={destination.img || "/placeholder.png"} alt={destination.title} className="h-[160px] w-full object-cover" />
    <div className="p-3">
      <h3 className="font-bold text-[15px] mb-2">{destination.title}</h3>
      {destination.tag && <p className="text-[12px] text-gray-500">{destination.tag}</p>}
      {destination.location && (
        <p className="text-[12px] text-gray-400 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {destination.location}
        </p>
      )}
    </div>
  </Link>
);

// -------------------- Main Page --------------------
export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Loading search...</p>}>
      <SearchResults />
    </Suspense>
  );
}

// -------------------- Client Component --------------------
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  const renderCard = (item: SearchResult) => {
    switch (item.type) {
      case "Place": return <PlaceCard key={item._id} place={item as Place} />;
      case "Category": return <CategoryCard key={item._id} category={item as Category} />;
      case "Eat": return <EatCard key={item._id} eat={item as Eat} />;
      case "LiveEvent": return <LiveEventCard key={item._id} event={item as LiveEvent} />;
      case "Tour": return <TourCard key={item._id} tour={item as Tour} />;
      case "Destination": return <DestinationCard key={item._id} destination={item as Destination} />;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <h1 className="text-2xl font-bold text-[#56008D]">Search Results for "{query}"</h1>

      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : results.length === 0 ? (
        <p className="mt-4">No results found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map(renderCard)}
        </div>
      )}
    </div>
  );
}
