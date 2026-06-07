import type {
  BusfactorReportSection,
  FileContributionReport,
  FileContributorReport,
} from "bus-lib";
import { StatusBadge } from "./StatusBadge.js";

interface BusFactorSectionProps {
  section: BusfactorReportSection;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const formatCount = (value: number) => numberFormatter.format(value);

const formatPercent = (value: number) => `${percentFormatter.format(value)}%`;

const formatEditLabel = (editCount: number) =>
  `${formatCount(editCount)} ${editCount === 1 ? "edit" : "edits"}`;

const formatFileLabel = (fileCount: number, qualifier?: string) => {
  const label = fileCount === 1 ? "file" : "files";
  return `${formatCount(fileCount)} ${qualifier === undefined ? "" : `${qualifier} `}${label}`;
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
  path,
}: {
  author: string;
  contributor: FileContributorReport | undefined;
  path: string;
}) => {
  const contributionPercent = contributor?.contributionPercent ?? 0;
  const editCount = contributor?.editCount ?? 0;
  const isActive = contributor?.isActive ?? false;

  return (
    <td
      aria-label={`${path}, ${author} contribution: ${formatPercent(
        contributionPercent,
      )}, ${formatEditLabel(editCount)}`}
      className={`px-3 py-4 align-top ${
        isActive ? "bg-[#f4eefc]" : "bg-transparent"
      }`}
    >
      <div className="flex min-w-28 flex-col gap-1">
        <span className="font-semibold text-[#221635]">
          {formatPercent(contributionPercent)}
        </span>
        <span className="text-xs font-medium text-[#62576f]">
          {formatEditLabel(editCount)}
        </span>
      </div>
    </td>
  );
};

export const BusFactorSection = ({ section }: BusFactorSectionProps) => {
  const authors = getSectionAuthors(section.files);

  return (
    <section
      aria-labelledby={`${section.id}-bus-factor-heading`}
      className="rounded-lg border border-[#d8d0c4] bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e2a84]">
            Bus factor by file
          </p>
          <h2
            id={`${section.id}-bus-factor-heading`}
            className="mt-2 text-2xl font-semibold text-[#221635]"
          >
            {section.label}
          </h2>
        </div>
        <p className="text-sm font-medium text-[#62576f]">
          {formatFileLabel(section.totalFiles, "tracked")} ·{" "}
          {formatFileLabel(section.riskFiles, "high-risk")}
        </p>
      </div>

      {section.files.length === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-[#d8d0c4] bg-[#fbfaf7] p-4 text-sm leading-6 text-[#62576f]">
          No tracked files in this section.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Bus factor by file for {section.label}
            </caption>
            <thead>
              <tr className="border-b border-[#d8d0c4] text-xs uppercase tracking-[0.14em] text-[#62576f]">
                <th className="min-w-72 py-3 pr-4 font-semibold" scope="col">
                  File Path
                </th>
                <th className="min-w-28 px-3 py-3 font-semibold" scope="col">
                  Total Edits
                </th>
                <th className="min-w-40 px-3 py-3 font-semibold" scope="col">
                  Active Contributors
                </th>
                <th className="min-w-28 px-3 py-3 font-semibold" scope="col">
                  Status
                </th>
                {authors.map((author) => (
                  <th
                    className="min-w-32 px-3 py-3 font-semibold"
                    key={author}
                    scope="col"
                  >
                    {author}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece4d8]">
              {section.files.map((file) => (
                <tr key={file.path}>
                  <th
                    className="py-4 pr-4 align-top font-mono text-sm font-semibold text-[#221635]"
                    scope="row"
                  >
                    {file.path}
                  </th>
                  <td className="px-3 py-4 align-top font-semibold text-[#221635]">
                    {formatCount(file.totalEdits)}
                  </td>
                  <td className="px-3 py-4 align-top font-semibold text-[#221635]">
                    {formatCount(file.activeContributorCount)}
                  </td>
                  <td className="px-3 py-4 align-top">
                    <StatusBadge isRisk={file.isRisk} />
                  </td>
                  {authors.map((author) => (
                    <ContributorCell
                      author={author}
                      contributor={findContributor(file.contributors, author)}
                      key={author}
                      path={file.path}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
