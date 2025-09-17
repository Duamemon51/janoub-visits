import React, { Suspense } from "react";
import LivePageClient from "@/components/LivePageClient";
import CompleteGuideAseer from "@/components/CompleteGuideAseer";

export default function LivePage() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <LivePageClient />
      </Suspense>
      <CompleteGuideAseer />
    </main>
  );
}
