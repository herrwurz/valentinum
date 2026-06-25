import type { AdminEventDto, EventInput, PublicEventDto } from "@/features/events/event-types";
import type { Actor } from "@/lib/permissions/roles";
import { requireStaffOrAdmin } from "@/lib/permissions/roles";
import { BusinessRuleError, NotFoundError } from "@/server/errors";
import type { EventRepository } from "@/server/repositories/event-repository";

export class EventService {
  constructor(private readonly repository: EventRepository) {}

  async listAdmin(actor: Actor) { requireStaffOrAdmin(actor); return this.repository.listAdmin(); }
  async getAdmin(actor: Actor, id: string) { requireStaffOrAdmin(actor); const event = await this.repository.findAdmin(id); if (!event) throw new NotFoundError("Veranstaltung wurde nicht gefunden."); return event; }
  async listPublic() { return (await this.repository.listPublic()).map(toPublicDto); }
  async getPublic(id: string) { const event = await this.repository.findPublic(id); return event ? toPublicDto(event) : null; }
  async listLinkableBookings(actor: Actor) { requireStaffOrAdmin(actor); return this.repository.listLinkableBookings(); }
  async create(actor: Actor, input: EventInput) { requireStaffOrAdmin(actor); return this.repository.create(input, actor.id); }
  async update(actor: Actor, id: string, input: EventInput) { requireStaffOrAdmin(actor); await this.repository.update(id, input, actor.id); }
  async setPublished(actor: Actor, id: string, published: boolean) {
    requireStaffOrAdmin(actor);
    const event = await this.repository.findAdmin(id);
    if (!event) throw new NotFoundError("Veranstaltung wurde nicht gefunden.");
    if (published && event.cancelled) throw new BusinessRuleError("Eine abgesagte Veranstaltung kann nicht veröffentlicht werden.");
    await this.repository.setPublished(id, published, actor.id);
  }
}

export function toPublicDto(event: AdminEventDto): PublicEventDto {
  return {
    id: event.id, title: event.title, subtitle: event.subtitle, description: event.description,
    category: event.category, startsAt: event.startsAt.toISOString(), endsAt: event.endsAt.toISOString(),
    admissionAt: event.admissionAt?.toISOString(), imageUrl: event.imageUrl,
    ...(event.publishOrganizer && event.organizerName ? { organizerName: event.organizerName } : {}),
    ...(event.publishTicketLink && event.ticketUrl ? { ticketUrl: event.ticketUrl } : {}),
  };
}
