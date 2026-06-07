import type { BusfactorReport } from "bus-lib";

interface ReportSummaryProps {
  report: BusfactorReport;
}

export const ReportSummary = ({ report }: ReportSummaryProps) => (
  <section aria-labelledby="summary-heading">
    <h2 id="summary-heading">Summary</h2>
    <dl>
      <div>
        <dt>Authors</dt>
        <dd>{report.summary.authorCount}</dd>
      </div>
      <div>
        <dt>Weeks</dt>
        <dd>{report.summary.weekCount}</dd>
      </div>
      <div>
        <dt>Tracked files</dt>
        <dd>{report.summary.totalFiles}</dd>
      </div>
      <div>
        <dt>Risk files</dt>
        <dd>{report.summary.riskFiles}</dd>
      </div>
    </dl>
  </section>
);
