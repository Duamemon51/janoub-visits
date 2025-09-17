import { Suspense } from "react";
import DestinationsPage from "@/components/DestinationsPage";

export default function ExploreJanoubPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DestinationsPage />
    </Suspense>
  );
}
