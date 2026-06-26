export const userRoles = ["ADMIN", "STAFF", "USER"] as const;

export type UserRoleValue = (typeof userRoles)[number];

export const userRoleLabels: Record<UserRoleValue, string> = {
  ADMIN: "Administrator",
  STAFF: "Mitarbeiter",
  USER: "Benutzer",
};

export interface UserAdminDto {
  id: string;
  name: string | null;
  email: string;
  role: UserRoleValue;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  name?: string;
  email: string;
  password: string;
  role: UserRoleValue;
}
