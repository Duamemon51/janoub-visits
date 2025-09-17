'use client';

import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading booking status...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
