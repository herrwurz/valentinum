import { PrismaBookingRepository } from "@/server/repositories/booking-repository";
import { BookingService } from "@/server/services/booking-service";
import { resourceGroupService } from "@/server/services/resource-group-service-instance";

export const bookingService = new BookingService(new PrismaBookingRepository(), true, undefined, resourceGroupService);
