import { BlackoutForm } from "@/features/blackouts/blackout-form";
import { getCurrentActor } from "@/lib/auth/session";
import { deleteBlackoutAction } from "@/server/actions/blackout-actions";
import { blackoutService } from "@/server/services/blackout-service";

export const metadata = { title: "Sperrzeiten" };

const formatter = new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vienna" });

export default async function BlackoutsPage() {
  const actor = await getCurrentActor();
  const [blackouts, resources] = await Promise.all([blackoutService.list(actor), blackoutService.listResources(actor)]);
  return (
    <div className="admin-content form-page">
      <div className="eyebrow">Buchungslogik</div><h1>Sperrzeiten</h1>
      <BlackoutForm resources={resources} />
      <section className="resource-table-wrap blackout-list">
        <table className="resource-table"><thead><tr><th>Ressource</th><th>Sperrzeit</th><th>Zeitraum</th><th /></tr></thead>
          <tbody>{blackouts.map((item) => <tr key={item.id}><td>{item.resourceName}</td><td><strong>{item.title}</strong><small>{item.reason}</small></td><td>{formatter.format(item.startAt)} – {formatter.format(item.endAt)}</td><td className="table-actions"><form action={deleteBlackoutAction}><input type="hidden" name="id" value={item.id} /><button className="text-button">Löschen</button></form></td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
