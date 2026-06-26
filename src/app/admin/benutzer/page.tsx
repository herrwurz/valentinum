import { getCurrentActor } from "@/lib/auth/session";
import { userRoleLabels } from "@/features/users/user-types";
import { UserForm } from "@/features/users/user-form";
import { setUserActiveAction, setUserRoleAction } from "@/server/actions/user-actions";
import { userService } from "@/server/services/user-service";

export const metadata = { title: "Benutzer" };

export default async function UsersPage() {
  const actor = await getCurrentActor();
  const users = await userService.listForAdmin(actor);
  const activeCount = users.filter((user) => user.active).length;

  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow">Benutzerverwaltung</div>
          <h1>Benutzer</h1>
          <p>{activeCount} aktiv · {users.length - activeCount} inaktiv</p>
        </div>
      </section>

      <section className="admin-card">
        <div className="eyebrow">Neues Konto</div>
        <h2>Benutzer anlegen</h2>
        <UserForm />
      </section>

      <section className="resource-table-wrap">
        <table className="resource-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Rolle</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.active ? undefined : "inactive-row"}>
                <td>
                  <strong>{user.name ?? user.email}</strong>
                  <small>{user.email}</small>
                </td>
                <td>
                  <form action={setUserRoleAction} className="table-inline-form">
                    <input type="hidden" name="id" value={user.id} />
                    <select name="role" defaultValue={user.role}>
                      {Object.entries(userRoleLabels).map(([role, label]) => (
                        <option key={role} value={role}>{label}</option>
                      ))}
                    </select>
                    <button className="text-button" type="submit">Speichern</button>
                  </form>
                </td>
                <td>
                  <span className={`resource-status ${user.active ? "is-active" : "is-inactive"}`}>
                    {user.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="table-actions">
                  <form action={setUserActiveAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="active" value={String(!user.active)} />
                    <button className="text-button" type="submit">{user.active ? "Deaktivieren" : "Aktivieren"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
