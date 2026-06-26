import type { BookingStatusValue } from "@/features/bookings/booking-types";
import type {
  DamageDto,
  FeeDto,
  HandoverProtocolDto,
  HandoverProtocolInput,
  KuehlwagenBookingDto,
  ReturnProtocolDto,
  ReturnProtocolInput,
} from "@/features/vehicle/vehicle-types";
import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/server/errors";

/** Strukturelle Sicht auf einen Prisma-Decimal-Wert; vermeidet eine harte Typabhängigkeit. */
type DecimalValue = { toString(): string };

export interface HandoverContext {
  status: BookingStatusValue;
  hasVehicle: boolean;
  handoverExists: boolean;
}

export interface ReturnContext {
  status: BookingStatusValue;
  hasVehicle: boolean;
  handoverAt: Date | null;
  returnExists: boolean;
}

export interface VehicleProtocolRepository {
  listKuehlwagenBookings(): Promise<KuehlwagenBookingDto[]>;
  createHandoverAtomically(
    bookingId: string,
    input: HandoverProtocolInput,
    actorId: string,
    validate: (context: HandoverContext) => void,
  ): Promise<string>;
  createReturnAtomically(
    bookingId: string,
    input: ReturnProtocolInput,
    actorId: string,
    validate: (context: ReturnContext) => void,
  ): Promise<string>;
}

const toNumber = (value: DecimalValue | null): number | undefined =>
  value === null ? undefined : Number(value);

type HandoverRow = {
  id: string;
  handedOverAt: Date;
  pickupLocation: string;
  odometer: number | null;
  fuelLevel: number | null;
  condition: string;
  accessories: string | null;
  depositAmount: DecimalValue | null;
  notes: string | null;
};

type DamageRow = {
  id: string;
  description: string;
  severity: DamageDto["severity"];
  estimatedCost: DecimalValue | null;
};

type FeeRow = {
  id: string;
  type: FeeDto["type"];
  amount: DecimalValue;
  note: string | null;
};

type ReturnRow = {
  id: string;
  returnedAt: Date;
  returnLocation: string;
  odometer: number | null;
  fuelLevel: number | null;
  cleaningOk: boolean;
  condition: string;
  notes: string | null;
  damages: DamageRow[];
  fees: FeeRow[];
};

const handoverDto = (row: HandoverRow): HandoverProtocolDto => ({
  id: row.id,
  handedOverAt: row.handedOverAt,
  pickupLocation: row.pickupLocation,
  odometer: row.odometer ?? undefined,
  fuelLevel: row.fuelLevel ?? undefined,
  condition: row.condition,
  accessories: row.accessories ?? undefined,
  depositAmount: toNumber(row.depositAmount),
  notes: row.notes ?? undefined,
});

const returnDto = (row: ReturnRow): ReturnProtocolDto => ({
  id: row.id,
  returnedAt: row.returnedAt,
  returnLocation: row.returnLocation,
  odometer: row.odometer ?? undefined,
  fuelLevel: row.fuelLevel ?? undefined,
  cleaningOk: row.cleaningOk,
  condition: row.condition,
  notes: row.notes ?? undefined,
  damages: row.damages.map((damage): DamageDto => ({
    id: damage.id,
    description: damage.description,
    severity: damage.severity,
    estimatedCost: toNumber(damage.estimatedCost),
  })),
  fees: row.fees.map((fee): FeeDto => ({
    id: fee.id,
    type: fee.type,
    amount: Number(fee.amount),
    note: fee.note ?? undefined,
  })),
});

export class PrismaVehicleProtocolRepository implements VehicleProtocolRepository {
  async listKuehlwagenBookings(): Promise<KuehlwagenBookingDto[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["APPROVED", "COMPLETED"] },
        resources: { some: { resource: { type: "VEHICLE" } } },
      },
      include: {
        resources: { where: { resource: { type: "VEHICLE" } }, include: { resource: { select: { name: true } } } },
        handoverProtocol: true,
        returnProtocol: { include: { damages: true, fees: true } },
        fees: { select: { amount: true } },
      },
      orderBy: { startAt: "desc" },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      title: booking.title,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      requesterName: booking.requesterName,
      requesterEmail: booking.requesterEmail,
      requesterPhone: booking.requesterPhone ?? undefined,
      vehicleNames: booking.resources.map(({ resource }) => resource.name),
      handover: booking.handoverProtocol ? handoverDto(booking.handoverProtocol) : undefined,
      return: booking.returnProtocol ? returnDto(booking.returnProtocol) : undefined,
      feeTotal: booking.fees.reduce((total, fee) => total + Number(fee.amount), 0),
    }));
  }

  async createHandoverAtomically(
    bookingId: string,
    input: HandoverProtocolInput,
    actorId: string,
    validate: (context: HandoverContext) => void,
  ): Promise<string> {
    return prisma.$transaction(async (transaction) => {
      const booking = await transaction.booking.findUnique({
        where: { id: bookingId },
        select: {
          status: true,
          resources: { select: { resource: { select: { type: true } } } },
          handoverProtocol: { select: { id: true } },
        },
      });
      if (!booking) throw new NotFoundError("Buchung wurde nicht gefunden.");

      validate({
        status: booking.status,
        hasVehicle: booking.resources.some(({ resource }) => resource.type === "VEHICLE"),
        handoverExists: booking.handoverProtocol !== null,
      });

      const protocol = await transaction.vehicleHandoverProtocol.create({
        data: {
          bookingId,
          handedOverAt: input.handedOverAt,
          pickupLocation: input.pickupLocation,
          odometer: input.odometer,
          fuelLevel: input.fuelLevel,
          condition: input.condition,
          accessories: input.accessories,
          depositAmount: input.depositAmount,
          notes: input.notes,
          createdById: actorId,
        },
      });

      if (input.depositAmount !== undefined && input.depositAmount > 0) {
        await transaction.fee.create({
          data: { bookingId, type: "DEPOSIT", amount: input.depositAmount, note: "Kaution bei Übergabe" },
        });
      }

      await transaction.auditLog.create({
        data: {
          userId: actorId,
          entityType: "VehicleHandoverProtocol",
          entityId: protocol.id,
          action: "CREATED",
          newValue: { bookingId, handedOverAt: input.handedOverAt.toISOString() },
        },
      });

      return protocol.id;
    });
  }

  async createReturnAtomically(
    bookingId: string,
    input: ReturnProtocolInput,
    actorId: string,
    validate: (context: ReturnContext) => void,
  ): Promise<string> {
    return prisma.$transaction(async (transaction) => {
      const booking = await transaction.booking.findUnique({
        where: { id: bookingId },
        select: {
          status: true,
          resources: { select: { resource: { select: { type: true } } } },
          handoverProtocol: { select: { handedOverAt: true } },
          returnProtocol: { select: { id: true } },
        },
      });
      if (!booking) throw new NotFoundError("Buchung wurde nicht gefunden.");

      validate({
        status: booking.status,
        hasVehicle: booking.resources.some(({ resource }) => resource.type === "VEHICLE"),
        handoverAt: booking.handoverProtocol?.handedOverAt ?? null,
        returnExists: booking.returnProtocol !== null,
      });

      const protocol = await transaction.vehicleReturnProtocol.create({
        data: {
          bookingId,
          returnedAt: input.returnedAt,
          returnLocation: input.returnLocation,
          odometer: input.odometer,
          fuelLevel: input.fuelLevel,
          cleaningOk: input.cleaningOk,
          condition: input.condition,
          notes: input.notes,
          createdById: actorId,
          damages: {
            create: input.damages.map((damage) => ({
              description: damage.description,
              severity: damage.severity,
              estimatedCost: damage.estimatedCost,
            })),
          },
          fees: {
            create: input.fees.map((fee) => ({
              bookingId,
              type: fee.type,
              amount: fee.amount,
              note: fee.note,
            })),
          },
        },
      });

      await transaction.auditLog.create({
        data: {
          userId: actorId,
          entityType: "VehicleReturnProtocol",
          entityId: protocol.id,
          action: "CREATED",
          newValue: {
            bookingId,
            returnedAt: input.returnedAt.toISOString(),
            damageCount: input.damages.length,
            feeCount: input.fees.length,
          },
        },
      });

      return protocol.id;
    });
  }
}
