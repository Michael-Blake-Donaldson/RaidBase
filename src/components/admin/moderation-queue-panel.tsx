"use client";

import { useMemo, useState, useTransition } from "react";

import type { ReportCard } from "@/lib/site-data";

type ModerationQueuePanelProps = {
  initialReports: ReportCard[];
};

type StatusCode = ReportCard["statusCode"];

const statusOptions: Array<{ value: StatusCode; label: string }> = [
  { value: "OPEN", label: "Open" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "ACTION_TAKEN", label: "Action taken" },
  { value: "DISMISSED", label: "Dismissed" },
];

const statusLabelByCode: Record<StatusCode, string> = {
  OPEN: "Queued for moderator action",
  IN_REVIEW: "Pending moderator review",
  ACTION_TAKEN: "Action taken by moderation",
  DISMISSED: "Dismissed by moderation",
};

export function ModerationQueuePanel({ initialReports }: ModerationQueuePanelProps) {
  const [reports, setReports] = useState(initialReports);
  const [pendingStatusById, setPendingStatusById] = useState<Record<string, StatusCode>>(() =>
    Object.fromEntries(initialReports.map((report) => [report.id, report.statusCode])),
  );
  const [detailsById, setDetailsById] = useState<Record<string, string>>({});
  const [errorById, setErrorById] = useState<Record<string, string | null>>({});
  const [isSaving, startSaving] = useTransition();

  const hasReports = reports.length > 0;
  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reports],
  );

  const saveReport = (report: ReportCard) => {
    const nextStatus = pendingStatusById[report.id] ?? report.statusCode;
    const details = detailsById[report.id]?.trim() || undefined;

    startSaving(async () => {
      setErrorById((current) => ({ ...current, [report.id]: null }));

      const response = await fetch(`/api/admin/reports/${encodeURIComponent(report.id)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus, details }),
      });

      if (!response.ok) {
        setErrorById((current) => ({ ...current, [report.id]: "Could not update this report. Try again." }));
        return;
      }

      setReports((current) =>
        current.map((entry) =>
          entry.id === report.id
            ? {
                ...entry,
                statusCode: nextStatus,
                status: statusLabelByCode[nextStatus],
                evidence: details || entry.evidence,
                moderator: "You",
              }
            : entry,
        ),
      );
      setDetailsById((current) => ({ ...current, [report.id]: "" }));
    });
  };

  if (!hasReports) {
    return (
      <section className="rb-surface-strong rounded-[28px] p-6">
        <h2 className="rb-text-strong text-xl font-semibold">Moderation queue</h2>
        <p className="rb-text-body mt-3 text-sm">No active moderation items. Queue is currently clear.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {sortedReports.map((report) => (
        <article key={report.id} className="rb-surface-strong rounded-[28px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">{report.targetType.replaceAll("_", " ")}</p>
              <h2 className="rb-text-strong mt-2 text-xl font-semibold">{report.subject}</h2>
              <p className="rb-text-muted mt-2 text-xs">
                Reported by {report.reporter} • {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                report.severity === "High"
                  ? "rb-badge-danger"
                  : report.severity === "Medium"
                    ? "rb-badge-warn"
                    : "rb-badge-info"
              }`}
            >
              {report.severity} severity
            </span>
          </div>

          <p className="rb-text-body mt-4 text-sm">{report.reason}</p>
          <div className="rb-surface-soft rb-text-body mt-4 rounded-[22px] p-4 text-sm leading-7">{report.evidence}</div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
            <label className="rb-text-muted text-xs uppercase tracking-[0.2em]">
              Moderator status
              <select
                className="rb-surface-soft rb-text-body mt-2 w-full rounded-xl px-3 py-2 text-sm"
                value={pendingStatusById[report.id] ?? report.statusCode}
                onChange={(event) =>
                  setPendingStatusById((current) => ({
                    ...current,
                    [report.id]: event.target.value as StatusCode,
                  }))
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="rb-text-muted text-xs uppercase tracking-[0.2em]">
              Moderator notes
              <textarea
                className="rb-surface-soft rb-text-body mt-2 min-h-24 w-full rounded-xl px-3 py-2 text-sm"
                value={detailsById[report.id] ?? ""}
                onChange={(event) =>
                  setDetailsById((current) => ({
                    ...current,
                    [report.id]: event.target.value,
                  }))
                }
                maxLength={800}
                placeholder="Add notes visible in moderation history"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rb-chip-dark rounded-full px-4 py-2 text-xs font-semibold"
              onClick={() => saveReport(report)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Apply update"}
            </button>
            <p className="rb-text-muted text-xs">Current status: {report.status}</p>
            <p className="rb-text-muted text-xs">Owner: {report.moderator ?? "Unassigned"}</p>
          </div>

          {errorById[report.id] ? <p className="rb-badge-danger mt-3 rounded-xl px-3 py-2 text-xs">{errorById[report.id]}</p> : null}
        </article>
      ))}
    </section>
  );
}
