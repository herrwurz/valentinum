import "server-only";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import type { Actor } from "@/lib/permissions/roles";
import { PermissionError } from "@/server/errors";

export async function getCurrentActor(): Promise<Actor> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    throw new PermissionError("Bitte melden Sie sich an.");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function getOptionalActor(): Promise<Actor | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return null;
  return { id: session.user.id, email: session.user.email, role: session.user.role };
}
