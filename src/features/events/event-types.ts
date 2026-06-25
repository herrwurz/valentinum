export const eventCategories = [
  "KONZERT", "KABARETT", "BALL", "AUSSTELLUNG", "VORTRAG", "KINDER", "VEREIN", "GEMEINDE", "SONSTIGE",
] as const;
export type EventCategoryValue = (typeof eventCategories)[number];
export const eventCategoryLabels: Record<EventCategoryValue, string> = {
  KONZERT: "Konzert", KABARETT: "Kabarett", BALL: "Ball", AUSSTELLUNG: "Ausstellung",
  VORTRAG: "Vortrag", KINDER: "Kinder", VEREIN: "Verein", GEMEINDE: "Gemeinde", SONSTIGE: "Sonstige",
};

export interface EventInput {
  bookingId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: EventCategoryValue;
  organizerName?: string;
  startsAt: Date;
  endsAt: Date;
  admissionAt?: Date;
  ticketUrl?: string;
  imageUrl?: string;
  publishOrganizer: boolean;
  publishTicketLink: boolean;
}

export interface AdminEventDto extends EventInput {
  id: string; publicVisible: boolean; cancelled: boolean; bookingTitle?: string;
}

export interface PublicEventDto {
  id: string; title: string; subtitle?: string; description?: string; category: EventCategoryValue;
  startsAt: string; endsAt: string; admissionAt?: string; organizerName?: string;
  ticketUrl?: string; imageUrl?: string;
}
