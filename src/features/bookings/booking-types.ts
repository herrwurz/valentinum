export const bookingStatuses = [
  "DRAFT", "REQUESTED", "OPTION", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED", "ARCHIVED",
] as const;

export type BookingStatusValue = (typeof bookingStatuses)[number];

export interface BufferedResource {
  id: string;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}

export interface ConflictBooking {
  id: string;
  title: string;
  status: BookingStatusValue;
  startAt: Date;
  endAt: Date;
  resources: BufferedResource[];
}

export interface ConflictBlackout {
  id: string;
  title: string;
  resourceId: string;
  startAt: Date;
  endAt: Date;
}

export interface BookingConflict {
  type: "BOOKING" | "BLACKOUT";
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
}

export interface BookingRequestInput {
  title: string;
  startAt: Date;
  endAt: Date;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  purpose?: string;
  resourceIds: string[];
  resourceGroupId?: string;
}

export interface RequestedBookingDto extends BookingRequestInput {
  id: string;
  status: "REQUESTED";
  resourceNames: string[];
  createdAt: Date;
}
