import { hash } from "bcryptjs";

import type { User } from "@/generated/prisma/client";
import type { UserAdminDto, UserCreateInput, UserRoleValue } from "@/features/users/user-types";
import type { Actor } from "@/lib/permissions/roles";
import { requireAdmin } from "@/lib/permissions/roles";
import {
  PrismaUserAdminRepository,
  type UserAdminRepository,
} from "@/server/repositories/user-admin-repository";
import { BusinessRuleError } from "@/server/errors";

function toDto(user: User): UserAdminDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UserService {
  constructor(private readonly repository: UserAdminRepository) {}

  async listForAdmin(actor: Actor): Promise<UserAdminDto[]> {
    requireAdmin(actor);
    return (await this.repository.listAll()).map(toDto);
  }

  async create(actor: Actor, input: UserCreateInput): Promise<UserAdminDto> {
    requireAdmin(actor);
    const passwordHash = await hash(input.password, 12);
    return toDto(await this.repository.create({ ...input, password: passwordHash }, actor.id));
  }

  async setActive(actor: Actor, id: string, active: boolean): Promise<UserAdminDto> {
    requireAdmin(actor);
    if (actor.id === id) {
      throw new BusinessRuleError("Das eigene Benutzerkonto kann nicht deaktiviert werden.");
    }
    return toDto(await this.repository.setActive(id, active, actor.id));
  }

  async setRole(actor: Actor, id: string, role: UserRoleValue): Promise<UserAdminDto> {
    requireAdmin(actor);
    if (actor.id === id) {
      throw new BusinessRuleError("Die eigene Rolle kann nicht geändert werden.");
    }
    return toDto(await this.repository.setRole(id, role, actor.id));
  }
}

export const userService = new UserService(new PrismaUserAdminRepository());
