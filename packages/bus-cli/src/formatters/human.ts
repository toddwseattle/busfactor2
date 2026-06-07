import type {
  BusfactorReport,
  BusfactorReportSection,
  FileContributionReport,
} from "bus-lib";

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

const formatActivity = (value: number): string => value.toFixed(3);

const formatSource = (report: BusfactorReport): string =>
  report.source.label ??
  report.source.inputPath ??
  report.source.repoPath ??
  "git-log";

const formatWeeklyCommits = (report: BusfactorReport): string[] => {
  const lines = ["Weekly commits:"];
  if (report.weeks.length === 0 || report.authors.length === 0) {
    return [...lines, "  (none)"];
  }

  lines.push(`  Week        ${report.authors.join("  ")}`);
  for (const week of report.weeks) {
    const counts = report.commitStats.map((authorStats) => {
      const count =
        authorStats.weeklyCommits.find((entry) => entry.week === week)?.count ??
        0;
      return String(count);
    });
    lines.push(`  ${week}  ${counts.join("  ")}`);
  }
  return lines;
};

const formatTopContributors = (file: FileContributionReport): string => {
  const activeContributors = file.contributors.filter(
    (contributor) => contributor.isActive,
  );
  if (activeContributors.length === 0) {
    return "none";
  }
  return activeContributors
    .map(
      (contributor) =>
        `${contributor.author} ${formatPercent(contributor.contributionPercent)}`,
    )
    .join(", ");
};

const formatSection = (section: BusfactorReportSection): string[] => {
  const lines = [
    "",
    `${section.label}: ${section.riskFiles}/${section.totalFiles} risk files`,
  ];
  if (section.files.length === 0) {
    return [...lines, "  (no files)"];
  }

  lines.push("  Risk  Active  Activity  File  Active contributors");
  for (const file of section.files) {
    lines.push(
      `  ${file.isRisk ? "yes " : "no  "}  ${file.activeContributorCount}/${
        file.riskContributorThreshold
      }     ${formatActivity(file.totalWeightedActivity)}     ${
        file.path
      }  ${formatTopContributors(file)}`,
    );
  }
  return lines;
};

export const formatHumanReport = (report: BusfactorReport): string => {
  const lines = [
    "Busfactor2 analysis",
    `Source: ${formatSource(report)}`,
    `Authors: ${report.summary.authorCount}`,
    `Weeks: ${report.summary.weekCount}`,
    `Risk files: ${report.summary.riskFiles}/${report.summary.totalFiles}`,
    `Options: ${report.options.halfLifeDays}-day half-life, ${formatPercent(
      report.options.activeThreshold * 100,
    )} active threshold, fewer than ${
      report.options.riskContributorCount
    } active contributors is risky`,
    "",
    ...formatWeeklyCommits(report),
  ];

  for (const section of report.sections) {
    lines.push(...formatSection(section));
  }

  return lines.join("\n");
};
