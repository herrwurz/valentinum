import Link from "next/link";
import { notFound } from "next/navigation";

import { ResourceForm } from "@/features/resources/resource-form";
import { getCurrentActor } from "@/lib/auth/session";
import { NotFoundError } from "@/server/errors";
import { resourceService } from "@/server/services/resource-service";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentActor();
  const { id } = await params;
  let resource;

  try {
    resource = await resourceService.getForAdmin(actor, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <div className="admin-content form-page">
      <Link className="back-link" href="/admin/ressourcen">← Zurück zu Ressourcen</Link>
      <div className="eyebrow">Ressourcenverwaltung</div>
      <h1>{resource.name}</h1>
      <ResourceForm resource={resource} />
    </div>
  );
}
