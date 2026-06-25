import { PrismaCalendarRepository } from "@/server/repositories/calendar-repository";
import { CalendarService } from "@/server/services/calendar-service";

const publicIdSecret = process.env.AUTH_SECRET;
if (!publicIdSecret) throw new Error("AUTH_SECRET ist für öffentliche Kalender-IDs erforderlich.");

export const calendarService = new CalendarService(new PrismaCalendarRepository(), publicIdSecret);
