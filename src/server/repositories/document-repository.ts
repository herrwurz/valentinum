import type { BookingStatusValue } from "@/features/bookings/booking-types";
import type { HandoverProtocolDto, ReturnProtocolDto } from "@/features/vehicle/vehicle-types";
import { prisma } from "@/lib/prisma/client";

type DecimalValue = { toString(): string };
const toNumber = (value: DecimalValue | null): number | undefined => (value === null ? undefined : Number(value));

export interface ConfirmationData {
  id: string;
  title: string;
  status: BookingStatusValue;
  startAt: Date;
  endAt: Date;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  purpose?: string;
  resourceNames: string[];
}

export interface HandoverDocData {
  bookingId: string;
  bookingTitle: string;
  requesterName: string;
  handover: HandoverProtocolDto;
}

export interface ReturnDocData {
  bookingId: string;
  bookingTitle: string;
  requesterName: string;
  return: ReturnProtocolDto;
}

export interface ExportFilter {
  from?: Date;
  to?: Date;
  status?: BookingStatusValue;
}

export interface ExportRow {
  startAt: Date;
  endAt: Date;
  resourceNames: string[];
  status: BookingStatusValue;
  requesterName: string;
  requesterEmail: string;
  feeTotal: number;
  category?: string;
}

export interface DocumentRepository {
  findConfirmation(id: string): Promise<ConfirmationData | null>;
  findHandover(bookingId: string): Promise<HandoverDocData | null>;
  findReturn(bookingId: string): Promise<ReturnDocData | null>;
  listExport(filter: ExportFilter): Promise<ExportRow[]>;
}

export class PrismaDocumentRepository implements DocumentRepository {
  async findConfirmation(id: string): Promise<ConfirmationData | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { resources: { include: { resource: { select: { name: true } } } } },
    });
    if (!booking) return null;
    return {
      id: booking.id,
      title: booking.title,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      requesterName: booking.requesterName,
      requesterEmail: booking.requesterEmail,
      requesterPhone: booking.requesterPhone ?? undefined,
      purpose: booking.purpose ?? undefined,
      resourceNames: booking.resources.map(({ resource }) => resource.name),
    };
  }

  async findHandover(bookingId: string): Promise<HandoverDocData | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, title: true, requesterName: true, handoverProtocol: true },
    });
    if (!booking?.handoverProtocol) return null;
    const protocol = booking.handoverProtocol;
    return {
      bookingId: booking.id,
      bookingTitle: booking.title,
      requesterName: booking.requesterName,
      handover: {
        id: protocol.id,
        handedOverAt: protocol.handedOverAt,
        pickupLocation: protocol.pickupLocation,
        odometer: protocol.odometer ?? undefined,
        fuelLevel: protocol.fuelLevel ?? undefined,
        condition: protocol.condition,
        accessories: protocol.accessories ?? undefined,
        depositAmount: toNumber(protocol.depositAmount),
        notes: protocol.notes ?? undefined,
      },
    };
  }

  async findReturn(bookingId: string): Promise<ReturnDocData | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        title: true,
        requesterName: true,
        returnProtocol: { include: { damages: true, fees: true } },
      },
    });
    if (!booking?.returnProtocol) return null;
    const protocol = booking.returnProtocol;
    return {
      bookingId: booking.id,
      bookingTitle: booking.title,
      requesterName: booking.requesterName,
      return: {
        id: protocol.id,
        returnedAt: protocol.returnedAt,
        returnLocation: protocol.returnLocation,
        odometer: protocol.odometer ?? undefined,
        fuelLevel: protocol.fuelLevel ?? undefined,
        cleaningOk: protocol.cleaningOk,
        condition: protocol.condition,
        notes: protocol.notes ?? undefined,
        damages: protocol.damages.map((damage) => ({
          id: damage.id,
          description: damage.description,
          severity: damage.severity,
          estimatedCost: toNumber(damage.estimatedCost),
        })),
        fees: protocol.fees.map((fee) => ({
          id: fee.id,
          type: fee.type,
          amount: Number(fee.amount),
          note: fee.note ?? undefined,
        })),
      },
    };
  }

  async listExport(filter: ExportFilter): Promise<ExportRow[]> {
    const range = filter.from || filter.to ? { gte: filter.from, lte: filter.to } : undefined;
    const bookings = await prisma.booking.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(range ? { startAt: range } : {}),
      },
      include: {
        resources: { include: { resource: { select: { name: true } } } },
        fees: { select: { amount: true } },
        event: { select: { category: true } },
      },
      orderBy: { startAt: "asc" },
    });
    return bookings.map((booking) => ({
      startAt: booking.startAt,
      endAt: booking.endAt,
      resourceNames: booking.resources.map(({ resource }) => resource.name),
      status: booking.status,
      requesterName: booking.requesterName,
      requesterEmail: booking.requesterEmail,
      feeTotal: booking.fees.reduce((total, fee) => total + Number(fee.amount), 0),
      category: booking.event?.category ?? undefined,
    }));
  }
}
