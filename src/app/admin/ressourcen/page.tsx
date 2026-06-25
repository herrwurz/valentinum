import Link from "next/link";

import { resourceTypeLabels } from "@/features/resources/resource-types";
import { getCurrentActor } from "@/lib/auth/session";
import { setResourceActiveAction } from "@/server/actions/resource-actions";
import { resourceService } from "@/server/services/resource-service";

export const metadata = { title: "Ressourcen" };

export default async function ResourcesPage() {
  const actor = await getCurrentActor();
  const resources = await resourceService.listForAdmin(actor);
  const activeCount = resources.filter((resource) => resource.active).length;

  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow">Ressourcenverwaltung</div>
          <h1>Ressourcen</h1>
          <p>{activeCount} aktiv · {resources.length - activeCount} inaktiv</p>
        </div>
        <Link className="button button-primary" href="/admin/ressourcen/neu">Neue Ressource</Link>
      </section>
      <section className="resource-table-wrap">
        <table className="resource-table">
          <thead><tr><th>Name</th><th>Art</th><th>Puffer</th><th>Status</th><th><span className="sr-only">Aktionen</span></th></tr></thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id} className={resource.active ? undefined : "inactive-row"}>
                <td><strong>{resource.name}</strong><small>{resource.location ?? "Kein Standort"}</small></td>
                <td>{resourceTypeLabels[resource.type]}</td>
                <td>{resource.bufferBeforeMinutes} / {resource.bufferAfterMinutes} Min.</td>
                <td><span className={`resource-status ${resource.active ? "is-active" : "is-inactive"}`}>{resource.active ? "Aktiv" : "Inaktiv"}</span></td>
                <td className="table-actions">
                  <Link href={`/admin/ressourcen/${resource.id}`}>Bearbeiten</Link>
                  <form action={setResourceActiveAction}>
                    <input type="hidden" name="id" value={resource.id} />
                    <input type="hidden" name="active" value={String(!resource.active)} />
                    <button className="text-button" type="submit">{resource.active ? "Deaktivieren" : "Aktivieren"}</button>
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
