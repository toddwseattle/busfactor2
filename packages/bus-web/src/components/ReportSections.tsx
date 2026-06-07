import type { BusfactorReport } from "bus-lib";
import { BusFactorSection } from "./BusFactorSection.js";

interface ReportSectionsProps {
  report: BusfactorReport;
}

export const ReportSections = ({ report }: ReportSectionsProps) => (
  <section aria-labelledby="bus-factor-heading">
    <h2 id="bus-factor-heading">Bus Factor Analysis</h2>
    {report.sections.map((section) => (
      <BusFactorSection
        authors={report.authors}
        key={section.id}
        section={section}
      />
    ))}
  </section>
);
