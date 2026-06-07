import type { BusfactorReportSection } from "bus-lib";

interface ReportSectionPlaceholdersProps {
  sections: BusfactorReportSection[];
}

export const ReportSectionPlaceholders = ({
  sections,
}: ReportSectionPlaceholdersProps) => (
  <section aria-labelledby="sections-heading">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e2a84]">
      Report sections
    </p>
    <h2
      id="sections-heading"
      className="mt-2 text-2xl font-semibold text-[#221635]"
    >
      Section placeholders
    </h2>
    <ul className="mt-4 grid gap-3 md:grid-cols-2">
      {sections.map((section) => (
        <li
          key={section.id}
          className="rounded-lg border border-[#d8d0c4] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[#221635]">{section.label}</h3>
              <p className="mt-1 text-sm text-[#62576f]">
                {section.totalFiles.toLocaleString("en-US")} files tracked
              </p>
            </div>
            {section.riskFiles > 0 ? (
              <span className="rounded-full bg-[#fff3e6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b45309]">
                High Risk
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  </section>
);
