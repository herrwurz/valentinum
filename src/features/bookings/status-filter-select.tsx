"use client";

import { useRouter } from "next/navigation";

import type { BookingStatus } from "@/generated/prisma/client";

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  REQUESTED: "Angefragt",
  OPTION: "Option",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  CANCELLED: "Storniert",
  COMPLETED: "Abgeschlossen",
  ARCHIVED: "Archiviert",
};

const allStatuses: BookingStatus[] = [
  "DRAFT", "REQUESTED", "OPTION", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED", "ARCHIVED",
];

export function StatusFilterSelect({ current }: { current?: BookingStatus }) {
  const router = useRouter();

  return (
    <div className="filter-select-wrap">
      <label htmlFor="status-filter" className="filter-select-label">Status</label>
      <select
        id="status-filter"
        className="filter-select"
        value={current ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          router.push(val ? `/admin/buchungen?status=${val}` : "/admin/buchungen");
        }}
      >
        <option value="">Alle</option>
        {allStatuses.map((s) => (
          <option key={s} value={s}>{statusLabels[s]}</option>
        ))}
      </select>
    </div>
  );
}
