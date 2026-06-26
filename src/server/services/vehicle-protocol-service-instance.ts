import { PrismaVehicleProtocolRepository } from "@/server/repositories/vehicle-protocol-repository";
import { VehicleProtocolService } from "@/server/services/vehicle-protocol-service";

export const vehicleProtocolService = new VehicleProtocolService(new PrismaVehicleProtocolRepository());
