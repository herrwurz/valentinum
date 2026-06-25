import { PermissionError } from "@/server/errors";

export type AppRole = "ADMIN" | "STAFF" | "USER";

export interface Actor {
  id: string;
  email: string;
  role: AppRole;
}

export function requireAdmin(actor: Actor): void {
  if (actor.role !== "ADMIN") {
    throw new PermissionError("Nur Administratoren dürfen Ressourcen verwalten.");
  }
}

export function requireStaffOrAdmin(actor: Actor): void {
  if (actor.role !== "ADMIN" && actor.role !== "STAFF") {
    throw new PermissionError("Nur Mitarbeiter oder Administratoren dürfen diese Aktion ausführen.");
  }
}
