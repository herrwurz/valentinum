import { bookingStatuses, type BookingStatusValue } from "@/features/bookings/booking-types";
import { getCurrentActor } from "@/lib/auth/session";
import { csvResponse, documentErrorResponse } from "@/server/documents/document-response";
import { documentService } from "@/server/services/document-service-instance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDate(value: string | null, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T${endOfDay ? "23:59:59" : "00:00:00"}` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const status = statusParam && (bookingStatuses as readonly string[]).includes(statusParam)
      ? (statusParam as BookingStatusValue)
      : undefined;
    const document = await documentService.exportBookingsCsv(await getCurrentActor(), {
      from: parseDate(url.searchParams.get("from")),
      to: parseDate(url.searchParams.get("to"), true),
      status,
    });
    return csvResponse(document);
  } catch (error) {
    return documentErrorResponse(error);
  }
}
