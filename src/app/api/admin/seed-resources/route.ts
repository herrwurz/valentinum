// TEMPORÄRE ROUTE – nach Seed sofort löschen
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

const SEED_TOKEN = "seed-resources-valentinum-2026";

const resources = [
  { id: "initial-room-grosser-saal", name: "Großer Saal", type: "ROOM" as const, bufferBeforeMinutes: 180, bufferAfterMinutes: 180 },
  { id: "initial-room-foyer",        name: "Foyer",        type: "ROOM" as const, bufferBeforeMinutes: 60,  bufferAfterMinutes: 60  },
  { id: "initial-room-lounge",       name: "Lounge",       type: "ROOM" as const, bufferBeforeMinutes: 30,  bufferAfterMinutes: 30  },
  { id: "initial-vehicle-kuehlwagen",name: "Kühlwagen",    type: "VEHICLE" as const, bufferBeforeMinutes: 60, bufferAfterMinutes: 60 },
];

const groups = [
  { id: "initial-group-lounge-foyer", name: "Lounge + Foyer",        resourceIds: ["initial-room-lounge", "initial-room-foyer"] },
  { id: "initial-group-foyer-saal",   name: "Foyer + Großer Saal",   resourceIds: ["initial-room-foyer",  "initial-room-grosser-saal"] },
  { id: "initial-group-gesamt",       name: "Gesamtes Valentinum",    resourceIds: ["initial-room-lounge", "initial-room-foyer", "initial-room-grosser-saal"] },
];

export async function POST(req: Request) {
  const token = req.headers.get("x-seed-token");
  if (token !== SEED_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ressourcen anlegen / aktualisieren
  for (const r of resources) {
    await prisma.resource.upsert({
      where: { id: r.id },
      update: { name: r.name, type: r.type, active: true, publicVisible: true, bufferBeforeMinutes: r.bufferBeforeMinutes, bufferAfterMinutes: r.bufferAfterMinutes },
      create: { id: r.id, name: r.name, type: r.type, active: true, publicVisible: true, bufferBeforeMinutes: r.bufferBeforeMinutes, bufferAfterMinutes: r.bufferAfterMinutes },
    });
  }

  // Raumkombinationen anlegen / aktualisieren
  for (const g of groups) {
    await prisma.$transaction(async (tx) => {
      await tx.resourceGroup.upsert({
        where: { id: g.id },
        update: { name: g.name, active: true },
        create: { id: g.id, name: g.name },
      });
      await tx.resourceGroupMember.deleteMany({
        where: { resourceGroupId: g.id, resourceId: { notIn: g.resourceIds } },
      });
      for (const resourceId of g.resourceIds) {
        await tx.resourceGroupMember.upsert({
          where: { resourceGroupId_resourceId: { resourceGroupId: g.id, resourceId } },
          update: {},
          create: { resourceGroupId: g.id, resourceId },
        });
      }
    });
  }

  return NextResponse.json({ ok: true, resources: resources.map((r) => r.name), groups: groups.map((g) => g.name) });
}
