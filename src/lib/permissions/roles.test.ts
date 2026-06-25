import { describe, expect, it } from "vitest";

import { requireAdmin, requireStaffOrAdmin, type Actor } from "./roles";
import { PermissionError } from "@/server/errors";

const actor = (role: Actor["role"]): Actor => ({
  id: `user-${role.toLowerCase()}`,
  email: `${role.toLowerCase()}@example.at`,
  role,
});

describe("requireStaffOrAdmin", () => {
  it.each(["ADMIN", "STAFF"] as const)("erlaubt %s", (role) => {
    expect(() => requireStaffOrAdmin(actor(role))).not.toThrow();
  });

  it("verweigert USER", () => {
    expect(() => requireStaffOrAdmin(actor("USER"))).toThrow(PermissionError);
  });
});

describe("requireAdmin", () => {
  it("erlaubt Administratoren die Ressourcenverwaltung", () => {
    expect(() => requireAdmin(actor("ADMIN"))).not.toThrow();
  });

  it.each(["STAFF", "USER"] as const)("verweigert der Rolle %s den Zugriff", (role) => {
    expect(() => requireAdmin(actor(role))).toThrow(PermissionError);
  });
});
