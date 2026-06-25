import { resourceGroupService } from "@/server/services/resource-group-service-instance";
import { getCurrentActor } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/permissions/roles";

export const metadata = { title: "Raumkombinationen" };

export default async function ResourceGroupsPage() {
  requireAdmin(await getCurrentActor());
  const groups = await resourceGroupService.listAll();
  return <div className="admin-content"><section className="admin-heading compact-heading"><div><div className="eyebrow">Valentinum Räume</div><h1>Raumkombinationen</h1><p>Unterstützte logische Varianten und enthaltene Teilräume</p></div></section>
    <div className="admin-card-grid">{groups.map((group) => <article className="admin-card" key={group.id}><span className={`resource-status ${group.active ? "is-active" : "is-inactive"}`}>{group.active ? "Aktiv" : "Inaktiv"}</span><h2>{group.name}</h2><ul className="member-list">{group.members.map((member) => <li key={member.id}><span>{member.name}</span><small>{member.capacity === undefined ? "Keine Kapazität gepflegt" : `${member.capacity} Personen`}</small></li>)}</ul></article>)}</div>
  </div>;
}
