import { z } from "zod";

import { userRoles, type UserCreateInput, type UserRoleValue } from "@/features/users/user-types";
import { ValidationError } from "@/server/errors";

const emailSchema = z.string().trim().email("Bitte eine gültige E-Mail-Adresse eingeben.");
const passwordSchema = z.string().min(8, "Das Passwort muss mindestens 8 Zeichen haben.");
const nameSchema = z.string().trim().max(160, "Der Name ist zu lang.").optional();
const roleSchema = z.enum(userRoles);

function parseString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseCreateUserFormData(formData: FormData): UserCreateInput {
  const result = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
  }).safeParse({
    name: parseString(formData.get("name")) || undefined,
    email: parseString(formData.get("email")),
    password: typeof formData.get("password") === "string" ? formData.get("password") : "",
    role: parseString(formData.get("role")),
  });

  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? "Ungültige Benutzereingaben.");
  }

  return result.data as UserCreateInput;
}

export function parseUserRoleFormData(formData: FormData): { id: string; role: UserRoleValue } {
  const result = z.object({
    id: z.string().min(1, "Ungültige Benutzer-ID."),
    role: roleSchema,
  }).safeParse({
    id: parseString(formData.get("id")),
    role: parseString(formData.get("role")),
  });

  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? "Ungültige Rollenänderung.");
  }

  return result.data;
}

export function parseUserActiveFormData(formData: FormData): { id: string; active: boolean } {
  const active = parseString(formData.get("active"));
  if (active !== "true" && active !== "false") {
    throw new ValidationError("Ungültige Aktivierungsanfrage.");
  }

  const id = parseString(formData.get("id"));
  if (!id) {
    throw new ValidationError("Ungültige Benutzer-ID.");
  }

  return { id, active: active === "true" };
}
