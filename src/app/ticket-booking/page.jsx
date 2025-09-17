import { Suspense } from "react";
import TicketBookingContent from "./TicketBookingContent";

export default function TicketBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-xl text-gray-600 bg-gray-50">
          Loading booking page...
        </div>
      }
    >
      <TicketBookingContent />
    </Suspense>
  );
}
