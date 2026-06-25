import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { resourceService } from "../src/server/services/resource-service";

const actor = {
  id: "initial-admin",
  email: "admin@valentinum.local",
  role: "ADMIN" as const,
};

async function main() {
  const created = await resourceService.create(actor, {
    name: "Phase-2-Prüfressource",
    type: "EQUIPMENT",
    description: "Temporärer CRUD-Nachweis",
    publicVisible: false,
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 20,
  });

  try {
  const updated = await resourceService.update(actor, created.id, {
    name: "Phase-2-Prüfressource bearbeitet",
    type: "EQUIPMENT",
    description: "Temporärer CRUD-Nachweis",
    publicVisible: false,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 30,
  });
  const deactivated = await resourceService.setActive(actor, created.id, false);
  const reactivated = await resourceService.setActive(actor, created.id, true);
  const auditCount = await prisma.auditLog.count({
    where: { entityType: "Resource", entityId: created.id },
  });

  if (updated.name !== "Phase-2-Prüfressource bearbeitet") throw new Error("Update fehlgeschlagen.");
  if (deactivated.active) throw new Error("Deaktivierung fehlgeschlagen.");
  if (!reactivated.active) throw new Error("Reaktivierung fehlgeschlagen.");
  if (auditCount !== 4) throw new Error(`Erwartete 4 Audit-Einträge, erhalten: ${auditCount}`);

  console.log("CRUD, Aktiv/Inaktiv und 4 Audit-Einträge erfolgreich geprüft.");
  } finally {
    await prisma.auditLog.deleteMany({ where: { entityType: "Resource", entityId: created.id } });
    await prisma.resource.delete({ where: { id: created.id } });
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
