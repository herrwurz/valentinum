import type { BookingStatus } from "@/generated/prisma/client";
import type { CalendarRange } from "@/features/calendar/calendar-types";
import { prisma } from "@/lib/prisma/client";

export interface CalendarRepository {
  listBookings(range: CalendarRange, options?: { statuses?: BookingStatus[]; createdById?: string }): Promise<Array<{
    id: string; title: string; status: BookingStatus; startAt: Date; endAt: Date;
    requesterName: string; requesterEmail: string; requesterPhone: string | null; internalNote: string | null;
    resources: Array<{ resource: { name: string; publicVisible: boolean } }>;
  }>>;
  listBlackouts(range: CalendarRange): Promise<Array<{
    id: string; title: string; reason: string | null; startAt: Date; endAt: Date;
    resource: { name: string; publicVisible: boolean };
  }>>;
  listEvents(range: CalendarRange): Promise<Array<{
    id: string; bookingId: string | null; title: string; description: string | null; category: string;
    organizerName: string | null; ticketUrl: string | null; publishOrganizer: boolean; publishTicketLink: boolean;
    startsAt: Date; endsAt: Date; booking: null | { resources: Array<{ resource: { name: string } }> };
  }>>;
}

export class PrismaCalendarRepository implements CalendarRepository {
  listBookings(range: CalendarRange, options?: { statuses?: BookingStatus[]; createdById?: string }) {
    return prisma.booking.findMany({
      where: {
        startAt: { lt: range.end }, endAt: { gt: range.start },
        status: options?.statuses ? { in: options.statuses } : undefined,
        createdById: options?.createdById,
      },
      include: { resources: { include: { resource: { select: { name: true, publicVisible: true } } } } },
      orderBy: { startAt: "asc" },
    });
  }

  listBlackouts(range: CalendarRange) {
    return prisma.blackoutPeriod.findMany({
      where: { startAt: { lt: range.end }, endAt: { gt: range.start } },
      include: { resource: { select: { name: true, publicVisible: true } } },
      orderBy: { startAt: "asc" },
    });
  }

  listEvents(range: CalendarRange) {
    return prisma.event.findMany({
      where: { publicVisible: true, cancelled: false, startsAt: { lt: range.end }, endsAt: { gt: range.start } },
      include: { booking: { include: { resources: { include: { resource: { select: { name: true } } } } } } },
      orderBy: { startsAt: "asc" },
    });
  }
}
