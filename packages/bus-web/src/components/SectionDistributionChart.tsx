import type { BusfactorReportSection } from "bus-lib";

interface SectionDistributionChartProps {
  sections: BusfactorReportSection[];
  totalFiles: number;
}

const formatPercent = (sectionFiles: number, totalFiles: number) => {
  if (totalFiles === 0) {
    return "0%";
  }
  return `${Math.round((sectionFiles / totalFiles) * 100)}%`;
};

export const SectionDistributionChart = ({
  sections,
  totalFiles,
}: SectionDistributionChartProps) => (
  <section
    aria-labelledby="distribution-heading"
    className="rounded-lg border border-[#d8d0c4] bg-white p-5 shadow-sm"
  >
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e2a84]">
          File distribution
        </p>
        <h2
          id="distribution-heading"
          className="mt-2 text-2xl font-semibold text-[#221635]"
        >
          Tracked files by report section
        </h2>
      </div>
      <p className="text-sm font-medium text-[#62576f]">
        {totalFiles.toLocaleString("en-US")} tracked files
      </p>
    </div>

    <ul className="mt-5 space-y-4">
      {sections.map((section) => {
        const percent = formatPercent(section.totalFiles, totalFiles);
        return (
          <li key={section.id}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[#34214f]">
                {section.label}
              </span>
              <span className="text-[#62576f]">
                {section.totalFiles.toLocaleString("en-US")} files · {percent}
              </span>
            </div>
            <div
              aria-label={`${section.label} tracked files`}
              aria-valuemax={totalFiles}
              aria-valuemin={0}
              aria-valuenow={section.totalFiles}
              className="h-3 overflow-hidden rounded-full bg-[#ece6f3]"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-[#4e2a84]"
                style={{
                  width:
                    totalFiles === 0
                      ? "0%"
                      : `${Math.min((section.totalFiles / totalFiles) * 100, 100)}%`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);
