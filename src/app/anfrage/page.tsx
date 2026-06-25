import { BookingRequestForm } from "@/features/bookings/booking-request-form";
import { bookingService } from "@/server/services/booking-service-instance";

export const metadata = { title: "Buchungsanfrage" };
export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const options = await bookingService.listBookingOptions();
  return <div className="page-shell request-page"><div className="eyebrow">Unverbindliche Anfrage</div><h1>Buchungsanfrage</h1><p>Ihre Anfrage wird geprüft und noch nicht automatisch genehmigt.</p><BookingRequestForm options={options} /></div>;
}
