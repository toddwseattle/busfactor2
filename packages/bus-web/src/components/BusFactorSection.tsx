import type {
  BusfactorReportSection,
  FileContributionReport,
  FileContributorReport,
} from "bus-lib";
import { useState } from "react";

interface BusFactorSectionProps {
  section: BusfactorReportSection;
}

type TableDensity = "default" | "compact";

const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const formatCount = (value: number) => numberFormatter.format(value);

const formatPercent = (value: number) => `${percentFormatter.format(value)}%`;

const formatEditLabel = (editCount: number) =>
  `${formatCount(editCount)} ${editCount === 1 ? "edit" : "edits"}`;

const formatContributorLabel = (contributorCount: number) =>
  `${formatCount(contributorCount)} active ${
    contributorCount === 1 ? "contributor" : "contributors"
  }`;

const formatStatsValue = (file: FileContributionReport) =>
  `${formatCount(file.totalEdits)} (${formatCount(file.activeContributorCount)})`;

const getStatsCellLabel = (file: FileContributionReport) =>
  [
    file.path,
    formatEditLabel(file.totalEdits),
    formatContributorLabel(file.activeContributorCount),
    file.isRisk ? "High Risk" : undefined,
  ]
    .filter((part): part is string => part !== undefined)
    .join(", ");

const getBaseName = (path: string) => {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] ?? path;
};

const getSectionAuthors = (
  files: readonly FileContributionReport[],
): string[] => {
  const authors = new Set<string>();
  for (const file of files) {
    for (const contributor of file.contributors) {
      authors.add(contributor.author);
    }
  }
  return Array.from(authors);
};

const findContributor = (
  contributors: readonly FileContributorReport[],
  author: string,
): FileContributorReport | undefined =>
  contributors.find((contributor) => contributor.author === author);

const ContributorCell = ({
  author,
  contributor,
  density,
  path,
}: {
  author: string;
  contributor: FileContributorReport | undefined;
  density: TableDensity;
  path: string;
}) => {
  const contributionPercent = contributor?.contributionPercent ?? 0;
  const editCount = contributor?.editCount ?? 0;
  const isActive = contributor?.isActive ?? false;
  const label = `${path}, ${author} contribution: ${formatPercent(
    contributionPercent,
  )}, ${formatEditLabel(editCount)}`;
  const isCompact = density === "compact";

  return (
    <td
      aria-label={label}
      className={`${isCompact ? "px-2 py-2" : "px-3 py-4"} align-top ${
        isActive ? "bg-[#f4eefc]" : "bg-transparent"
      }`}
      title={label}
    >
      <div
        className={`flex ${isCompact ? "min-w-20" : "min-w-28"} flex-col gap-1`}
      >
        <span className="font-semibold text-[#221635]">
          {formatPercent(contributionPercent)}
        </span>
        {!isCompact && (
          <span className="text-xs font-medium text-[#62576f]">
            {formatEditLabel(editCount)}
          </span>
        )}
      </div>
    </td>
  );
};

export const BusFactorSection = ({ section }: BusFactorSectionProps) => {
  const [density, setDensity] = useState<TableDensity>("default");
  const authors = getSectionAuthors(section.files);
  const isCompact = density === "compact";

  return (
    <section
      aria-label={`${section.label} bus factor file grid`}
      className="rounded-lg border border-[#d8d0c4] bg-white p-5 shadow-sm"
    >
      {section.files.length === 0 ? (
        <p className="rounded-md border border-dashed border-[#d8d0c4] bg-[#fbfaf7] p-4 text-sm leading-6 text-[#62576f]">
          No tracked files in this section.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b border-[#ece4d8] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <fieldset
              aria-label={`${section.label} table density`}
              className="flex flex-wrap items-center gap-3"
            >
              <legend className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#62576f] sm:float-left">
                View
              </legend>
              {(["default", "compact"] as const).map((mode) => (
                <label
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#221635]"
                  key={mode}
                >
                  <input
                    checked={density === mode}
                    className="accent-[#4e2a84]"
                    name={`${section.id}-table-density`}
                    onChange={() => {
                      setDensity(mode);
                    }}
                    type="radio"
                    value={mode}
                  />
                  {mode === "default" ? "Default" : "Compact"}
                </label>
              ))}
            </fieldset>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#62576f]">
              <span
                aria-hidden="true"
                className="inline-block size-3 rounded-sm border border-[#f5b453] bg-[#fff3e6]"
              />
              <span>High Risk stats cells are highlighted.</span>
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table
              className={`min-w-full border-collapse text-left ${
                isCompact ? "text-xs" : "text-sm"
              }`}
            >
              <caption className="sr-only">
                Bus factor by file for {section.label}
              </caption>
              <thead>
                <tr className="border-b border-[#d8d0c4] text-xs uppercase tracking-[0.14em] text-[#62576f]">
                  <th
                    className={`${isCompact ? "min-w-48 py-2" : "min-w-72 py-3"} pr-4 font-semibold`}
                    scope="col"
                  >
                    File Path
                  </th>
                  <th
                    className={`${isCompact ? "min-w-28 px-2 py-2" : "min-w-40 px-3 py-3"} font-semibold`}
                    scope="col"
                  >
                    Edits (contributors)
                  </th>
                  {authors.map((author) => (
                    <th
                      className={`${isCompact ? "min-w-24 px-2 py-2" : "min-w-32 px-3 py-3"} font-semibold`}
                      key={author}
                      scope="col"
                    >
                      {author}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece4d8]">
                {section.files.map((file) => {
                  const fileLabel = isCompact
                    ? getBaseName(file.path)
                    : file.path;
                  const statsCellClass = file.isRisk
                    ? "border-l-4 border-[#f5b453] bg-[#fff3e6] text-[#8a3b0a]"
                    : "text-[#221635]";

                  return (
                    <tr key={file.path}>
                      <th
                        aria-label={isCompact ? file.path : undefined}
                        className={`${isCompact ? "py-2 text-xs" : "py-4 text-sm"} pr-4 align-top font-mono font-semibold text-[#221635]`}
                        scope="row"
                        title={isCompact ? file.path : undefined}
                      >
                        {fileLabel}
                      </th>
                      <td
                        aria-label={getStatsCellLabel(file)}
                        className={`${isCompact ? "px-2 py-2" : "px-3 py-4"} align-top font-semibold ${statsCellClass}`}
                      >
                        {formatStatsValue(file)}
                      </td>
                      {authors.map((author) => (
                        <ContributorCell
                          author={author}
                          contributor={findContributor(
                            file.contributors,
                            author,
                          )}
                          density={density}
                          key={author}
                          path={file.path}
                        />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
