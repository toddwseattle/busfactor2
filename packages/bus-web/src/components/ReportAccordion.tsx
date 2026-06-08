import { useId, useState } from "react";
import type { BusfactorReportSection } from "bus-lib";
import { BusFactorSection } from "./BusFactorSection.js";

interface ReportAccordionProps {
  sections: readonly BusfactorReportSection[];
}

const numberFormatter = new Intl.NumberFormat("en-US");

const formatCount = (value: number) => numberFormatter.format(value);

const formatTotalEditLabel = (editCount: number) =>
  `${formatCount(editCount)} total ${editCount === 1 ? "edit" : "edits"}`;

const formatContributorLabel = (contributorCount: number) =>
  `${formatCount(contributorCount)} ${
    contributorCount === 1 ? "contributor" : "contributors"
  }`;

const getDefaultExpandedSectionId = (
  sections: readonly BusfactorReportSection[],
): string | null => {
  const overallSection = sections.find((section) => section.id === "overall");
  return overallSection?.id ?? sections[0]?.id ?? null;
};

const getSectionTotalEdits = (section: BusfactorReportSection) =>
  section.files.reduce((totalEdits, file) => totalEdits + file.totalEdits, 0);

const getSectionActiveContributorCount = (section: BusfactorReportSection) => {
  const activeAuthors = new Set<string>();

  for (const file of section.files) {
    for (const contributor of file.contributors) {
      if (contributor.isActive) {
        activeAuthors.add(contributor.author);
      }
    }
  }

  return activeAuthors.size;
};

export const ReportAccordion = ({ sections }: ReportAccordionProps) => {
  const baseId = useId();
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    () => getDefaultExpandedSectionId(sections),
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSectionId((currentSectionId) =>
      currentSectionId === sectionId ? null : sectionId,
    );
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={`${baseId}-heading`}
      className="rounded-lg border border-[#d8d0c4] bg-white shadow-sm"
    >
      <div className="border-b border-[#d8d0c4] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e2a84]">
          Bus factor analysis
        </p>
        <h2
          id={`${baseId}-heading`}
          className="mt-2 text-2xl font-semibold text-[#221635]"
        >
          Report sections
        </h2>
      </div>

      <div className="divide-y divide-[#ece4d8]">
        {sections.map((section) => {
          const isExpanded = expandedSectionId === section.id;
          const buttonId = `${baseId}-${section.id}-button`;
          const panelId = `${baseId}-${section.id}-panel`;
          const panelLabelId = `${baseId}-${section.id}-panel-label`;
          const totalEditLabel = formatTotalEditLabel(
            getSectionTotalEdits(section),
          );
          const contributorLabel = formatContributorLabel(
            getSectionActiveContributorCount(section),
          );

          return (
            <div key={section.id}>
              <h3>
                <button
                  aria-controls={panelId}
                  aria-expanded={isExpanded}
                  className="flex w-full items-start gap-3 px-5 py-4 text-left text-[#221635] hover:bg-[#fbfaf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4e2a84]"
                  id={buttonId}
                  onClick={() => {
                    toggleSection(section.id);
                  }}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-sm border border-[#d8d0c4] bg-white text-lg font-semibold leading-none text-[#4e2a84]"
                  >
                    {isExpanded ? "-" : "+"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold">
                      {section.label} by file
                    </span>
                    <span className="mt-1 block text-sm font-medium text-[#62576f]">
                      {totalEditLabel}, {contributorLabel}
                    </span>
                    <span className="sr-only">
                      {isExpanded ? "Collapse" : "Expand"} section
                    </span>
                  </span>
                </button>
              </h3>

              {isExpanded ? (
                <div
                  aria-labelledby={panelLabelId}
                  className="bg-[#fbfaf7] p-4"
                  id={panelId}
                  role="region"
                >
                  <span className="sr-only" id={panelLabelId}>
                    {section.label} by file report panel
                  </span>
                  <BusFactorSection section={section} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};
