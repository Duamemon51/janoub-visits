// app/search/page.tsx
import dynamic from "next/dynamic";

// Dynamically import the client page with SSR disabled
const SearchPageClient = dynamic(() => import("./SearchPageClient"), { ssr: false });

export default function PageWrapper() {
  return <SearchPageClient />;
}
