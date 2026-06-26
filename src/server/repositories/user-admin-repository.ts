import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import type { UserCreateInput, UserRoleValue } from "@/features/users/user-types";
import { ConflictError, NotFoundError } from "@/server/errors";

function auditSnapshot(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}

export interface UserAdminRepository {
  listAll(): Promise<User[]>;
  create(input: UserCreateInput, actorId: string): Promise<User>;
  setActive(id: string, active: boolean, actorId: string): Promise<User>;
  setRole(id: string, role: UserRoleValue, actorId: string): Promise<User>;
}

export class PrismaUserAdminRepository implements UserAdminRepository {
  listAll() {
    return prisma.user.findMany({
      orderBy: [{ active: "desc" }, { role: "asc" }, { email: "asc" }],
    });
  }

  async create(input: UserCreateInput, actorId: string) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      throw new ConflictError("Es existiert bereits ein Benutzer mit dieser E-Mail-Adresse.");
    }

    return prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: input.name?.trim() || null,
          email: input.email.toLowerCase(),
          passwordHash: input.password,
          role: input.role,
        },
      });
      await transaction.auditLog.create({
        data: {
          action: "CREATED",
          entityId: user.id,
          entityType: "User",
          newValue: auditSnapshot(user),
          userId: actorId,
        },
      });
      return user;
    });
  }

  setActive(id: string, active: boolean, actorId: string) {
    return prisma.$transaction(async (transaction) => {
      const previous = await transaction.user.findUnique({ where: { id } });
      if (!previous) throw new NotFoundError("Benutzer wurde nicht gefunden.");

      const user = await transaction.user.update({ where: { id }, data: { active } });
      await transaction.auditLog.create({
        data: {
          action: active ? "REACTIVATED" : "DEACTIVATED",
          entityId: id,
          entityType: "User",
          oldValue: auditSnapshot(previous),
          newValue: auditSnapshot(user),
          userId: actorId,
        },
      });
      return user;
    });
  }

  setRole(id: string, role: UserRoleValue, actorId: string) {
    return prisma.$transaction(async (transaction) => {
      const previous = await transaction.user.findUnique({ where: { id } });
      if (!previous) throw new NotFoundError("Benutzer wurde nicht gefunden.");

      const user = await transaction.user.update({ where: { id }, data: { role } });
      await transaction.auditLog.create({
        data: {
          action: "UPDATED",
          entityId: id,
          entityType: "User",
          oldValue: auditSnapshot(previous),
          newValue: auditSnapshot(user),
          userId: actorId,
        },
      });
      return user;
    });
  }
}
