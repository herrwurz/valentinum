"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="text-button" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Abmelden
    </button>
  );
}
