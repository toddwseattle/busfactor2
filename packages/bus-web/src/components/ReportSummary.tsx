import type { BusfactorReportSummary } from "bus-lib";

interface ReportSummaryProps {
  summary: BusfactorReportSummary;
}

const metrics = [
  {
    key: "authorCount",
    label: "Total Authors",
    value: (summary: BusfactorReportSummary) => summary.authorCount,
  },
  {
    key: "totalFiles",
    label: "Tracked Files",
    value: (summary: BusfactorReportSummary) => summary.totalFiles,
  },
  {
    key: "riskFiles",
    label: "Risk Files",
    value: (summary: BusfactorReportSummary) => summary.riskFiles,
  },
  {
    key: "weekCount",
    label: "Active Weeks",
    value: (summary: BusfactorReportSummary) => summary.weekCount,
  },
] as const;

export const ReportSummary = ({ summary }: ReportSummaryProps) => (
  <section aria-labelledby="summary-heading">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e2a84]">
          Report summary
        </p>
        <h2
          id="summary-heading"
          className="mt-2 text-2xl font-semibold text-[#221635]"
        >
          Project signal
        </h2>
      </div>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.key}
          aria-label={metric.label}
          className="rounded-lg border border-[#d8d0c4] bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-[#62576f]">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold text-[#221635]">
            {metric.value(summary).toLocaleString("en-US")}
          </p>
        </article>
      ))}
    </div>
  </section>
);
