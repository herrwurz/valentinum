import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/permissions/roles";

declare module "next-auth" {
  interface User {
    role: AppRole;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: AppRole;
  }
}
