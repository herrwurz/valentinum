import { prisma } from "@/lib/prisma/client";

export async function findActiveUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      active: true,
    },
  });
}
