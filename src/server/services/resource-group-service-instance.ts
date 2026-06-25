import { PrismaResourceGroupRepository } from "@/server/repositories/resource-group-repository";
import { ResourceGroupService } from "@/server/services/resource-group-service";

export const resourceGroupService = new ResourceGroupService(new PrismaResourceGroupRepository());
