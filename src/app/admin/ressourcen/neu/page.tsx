import Link from "next/link";

import { ResourceForm } from "@/features/resources/resource-form";

export const metadata = { title: "Ressource anlegen" };

export default function NewResourcePage() {
  return (
    <div className="admin-content form-page">
      <Link className="back-link" href="/admin/ressourcen">← Zurück zu Ressourcen</Link>
      <div className="eyebrow">Ressourcenverwaltung</div>
      <h1>Neue Ressource</h1>
      <ResourceForm />
    </div>
  );
}
