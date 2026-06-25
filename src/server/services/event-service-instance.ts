import { PrismaEventRepository } from "@/server/repositories/event-repository";
import { EventService } from "@/server/services/event-service";

export const eventService = new EventService(new PrismaEventRepository());
