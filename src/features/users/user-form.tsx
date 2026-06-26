"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { userRoleLabels, userRoles, type UserAdminDto } from "@/features/users/user-types";
import { saveUserAction, type UserActionState } from "@/server/actions/user-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary" type="submit" disabled={pending}>
      {pending ? "Wird gespeichert …" : "Benutzer anlegen"}
    </button>
  );
}

export function UserForm({ user }: { user?: UserAdminDto }) {
  const initialState: UserActionState = {};
  const [state, action] = useActionState(saveUserAction, initialState);

  return (
    <form className="resource-form" action={action}>
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <div className="form-grid">
        <label className="field-wide">
          Name
          <input name="name" maxLength={160} defaultValue={user?.name ?? undefined} />
        </label>
        <label>
          E-Mail
          <input name="email" type="email" autoComplete="email" maxLength={240} required defaultValue={user?.email ?? undefined} />
        </label>
        <label>
          Rolle
          <select name="role" defaultValue={user?.role ?? "USER"}>
            {userRoles.map((role) => (
              <option key={role} value={role}>{userRoleLabels[role]}</option>
            ))}
          </select>
        </label>
        <label className="field-wide">
          Passwort
          <input name="password" type="password" autoComplete="new-password" minLength={8} required={!user} />
        </label>
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="form-actions"><SubmitButton /></div>
    </form>
  );
}
