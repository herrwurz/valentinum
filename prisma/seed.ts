import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { initialResources } from "../src/server/resources/initial-resources";
import { initialResourceGroups } from "../src/server/resources/initial-resource-groups";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL ist für den Seed erforderlich.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHashBase64 = process.env.ADMIN_PASSWORD_HASH_BASE64;

  if (!adminEmail || !adminPasswordHashBase64) {
    throw new Error("ADMIN_EMAIL und ADMIN_PASSWORD_HASH_BASE64 sind für den Seed erforderlich.");
  }

  const adminPasswordHash = Buffer.from(adminPasswordHashBase64, "base64").toString("utf8");

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      active: true,
      name: "Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      id: "initial-admin",
      email: adminEmail.toLowerCase(),
      name: "Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  for (const resource of initialResources) {
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: {
        name: resource.name,
        type: resource.type,
        active: true,
        publicVisible: true,
      },
      create: resource,
    });
  }

  for (const group of initialResourceGroups) {
    await prisma.$transaction(async (transaction) => {
      await transaction.resourceGroup.upsert({
        where: { id: group.id },
        update: { name: group.name, active: true },
        create: { id: group.id, name: group.name },
      });
      await transaction.resourceGroupMember.deleteMany({
        where: { resourceGroupId: group.id, resourceId: { notIn: [...group.resourceIds] } },
      });
      for (const resourceId of group.resourceIds) {
        await transaction.resourceGroupMember.upsert({
          where: { resourceGroupId_resourceId: { resourceGroupId: group.id, resourceId } },
          update: {}, create: { resourceGroupId: group.id, resourceId },
        });
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
