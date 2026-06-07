import {
  DEFAULT_ANALYSIS_OPTIONS,
  DEFAULT_REPORT_SECTIONS,
  REPORT_SCHEMA_VERSION,
} from "./constants.js";
import { parseGitLog } from "./git-log.js";
import type {
  AuthorCommitStats,
  BusfactorAnalysisOptions,
  BusfactorReport,
  BusfactorReportSection,
  FileContributionReport,
  FileContributorReport,
  GitLogCommit,
  ReportSectionId,
} from "./types.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const LEGACY_TRACKED_STATUSES = new Set(["A", "C", "M"]);
const LEGACY_TRACKED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".html",
  ".htm",
  ".yml",
] as const;

interface MutableContributorStats {
  editCount: number;
  lastEditedAt: number | null;
  weightedActivity: number;
}

type MutableFileHistory = Map<string, Map<string, MutableContributorStats>>;

const createContributorStats = (): MutableContributorStats => ({
  editCount: 0,
  lastEditedAt: null,
  weightedActivity: 0,
});

const toIsoDateTime = (timestamp: number | null): string | null =>
  timestamp === null ? null : new Date(timestamp).toISOString();

const roundMetric = (value: number): number => Number(value.toFixed(6));

const getNextSundayIsoDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - day + 7);
  return date.toISOString().slice(0, 10);
};

const decay = (
  latestTimestamp: number,
  timestamp: number,
  halfLifeDays: number,
): number => {
  const lambda = Math.log(2) / halfLifeDays;
  const days = Math.abs(latestTimestamp - timestamp) / DAY_MS;
  return Math.exp(-lambda * days);
};

const isLegacyTrackedPath = (path: string): boolean =>
  LEGACY_TRACKED_EXTENSIONS.some((extension) => path.endsWith(extension));

const isLegacyIgnoredPath = (path: string): boolean => {
  const normalized = path.replaceAll("\\", "/");
  const segments = normalized.split("/");
  return (
    segments.includes("node_modules") ||
    segments.includes("build") ||
    segments.includes("dist")
  );
};

const isLegacyTrackedChange = (status: string, path: string): boolean =>
  LEGACY_TRACKED_STATUSES.has(status) &&
  isLegacyTrackedPath(path) &&
  !isLegacyIgnoredPath(path);

const uniqueSortedAuthors = (commits: readonly GitLogCommit[]): string[] =>
  Array.from(new Set(commits.map((commit) => commit.author))).sort();

const uniqueWeeksInEncounterOrder = (
  commits: readonly GitLogCommit[],
): string[] => {
  const weeks = new Set<string>();
  for (const commit of commits) {
    weeks.add(getNextSundayIsoDate(commit.timestamp));
  }
  return Array.from(weeks);
};

const collectTrackedFilePaths = (
  commits: readonly GitLogCommit[],
): readonly string[] => {
  const files = new Set<string>();
  for (const commit of commits) {
    for (const change of commit.changedFiles) {
      if (isLegacyTrackedChange(change.status, change.path)) {
        files.add(change.path);
      }
    }
  }
  return Array.from(files);
};

const initializeFileHistory = (
  files: readonly string[],
  authors: readonly string[],
): MutableFileHistory => {
  const history: MutableFileHistory = new Map();
  for (const file of files) {
    const authorHistory = new Map<string, MutableContributorStats>();
    for (const author of authors) {
      authorHistory.set(author, createContributorStats());
    }
    history.set(file, authorHistory);
  }
  return history;
};

const buildCommitStats = (
  commits: readonly GitLogCommit[],
  authors: readonly string[],
  weeks: readonly string[],
): AuthorCommitStats[] =>
  authors.map((author) => {
    const authorCommits = commits.filter((commit) => commit.author === author);
    return {
      author,
      totalCommits: authorCommits.length,
      weeklyCommits: weeks.map((week) => ({
        week,
        count: authorCommits.filter(
          (commit) => getNextSundayIsoDate(commit.timestamp) === week,
        ).length,
      })),
    };
  });

const buildFileReports = (
  history: MutableFileHistory,
  authors: readonly string[],
  options: Required<
    Pick<
      BusfactorAnalysisOptions,
      "activeThreshold" | "halfLifeDays" | "riskContributorCount"
    >
  >,
): FileContributionReport[] => {
  const fileOrder = new Map<string, number>();
  Array.from(history.keys()).forEach((path, index) =>
    fileOrder.set(path, index),
  );

  return Array.from(history.entries())
    .map(([path, authorHistory]) => {
      const totalWeightedActivity = Array.from(authorHistory.values()).reduce(
        (sum, stats) => sum + stats.weightedActivity,
        0,
      );
      const totalEdits = Array.from(authorHistory.values()).reduce(
        (sum, stats) => sum + stats.editCount,
        0,
      );
      const lastEditedAt = Array.from(authorHistory.values()).reduce<
        number | null
      >((latest, stats) => {
        if (stats.lastEditedAt === null) {
          return latest;
        }
        return latest === null
          ? stats.lastEditedAt
          : Math.max(latest, stats.lastEditedAt);
      }, null);
      const contributors: FileContributorReport[] = authors.map((author) => {
        const stats = authorHistory.get(author) ?? createContributorStats();
        const contributionPercent =
          totalWeightedActivity === 0
            ? 0
            : (stats.weightedActivity / totalWeightedActivity) * 100;
        const isActive =
          totalWeightedActivity > 0 &&
          stats.weightedActivity / totalWeightedActivity >=
            options.activeThreshold;
        const weightedActivity = roundMetric(stats.weightedActivity);
        return {
          author,
          editCount: stats.editCount,
          lastEditedAt: toIsoDateTime(stats.lastEditedAt),
          weightedActivity,
          compatibilityFrecency: weightedActivity,
          contributionPercent: roundMetric(contributionPercent),
          isActive,
        };
      });
      const activeContributorCount = contributors.filter(
        (contributor) => contributor.isActive,
      ).length;
      const totalWeightedActivityMetric = roundMetric(totalWeightedActivity);

      return {
        path,
        totalEdits,
        lastEditedAt: toIsoDateTime(lastEditedAt),
        totalWeightedActivity: totalWeightedActivityMetric,
        compatibilityFrecency: totalWeightedActivityMetric,
        activeContributorCount,
        riskContributorThreshold: options.riskContributorCount,
        isRisk: activeContributorCount < options.riskContributorCount,
        contributors,
      };
    })
    .sort((left, right) => {
      if (right.totalWeightedActivity !== left.totalWeightedActivity) {
        return right.totalWeightedActivity - left.totalWeightedActivity;
      }
      return (fileOrder.get(left.path) ?? 0) - (fileOrder.get(right.path) ?? 0);
    });
};

const buildSection = (
  id: ReportSectionId,
  files: readonly FileContributionReport[],
): BusfactorReportSection => {
  const definition = DEFAULT_REPORT_SECTIONS.find(
    (section) => section.id === id,
  );
  return {
    id,
    label: definition?.label ?? id,
    totalFiles: files.length,
    riskFiles: files.filter((file) => file.isRisk).length,
    files: [...files],
  };
};

export const analyzeGitLog = (
  text: string,
  analysisOptions: Partial<BusfactorAnalysisOptions> = {},
): BusfactorReport => {
  const options = {
    ...DEFAULT_ANALYSIS_OPTIONS,
    ...analysisOptions,
  };
  const commits = parseGitLog(text);
  const authors = uniqueSortedAuthors(commits);
  const weeks = uniqueWeeksInEncounterOrder(commits);
  const files = collectTrackedFilePaths(commits);
  const latestTimestamp = commits[0]?.timestamp ?? 0;
  const history = initializeFileHistory(files, authors);

  for (const commit of commits) {
    const commitWeight = decay(
      latestTimestamp,
      commit.timestamp,
      options.halfLifeDays,
    );
    for (const change of commit.changedFiles) {
      if (!isLegacyTrackedChange(change.status, change.path)) {
        continue;
      }
      const authorHistory = history.get(change.path);
      const contributorStats = authorHistory?.get(commit.author);
      if (contributorStats === undefined) {
        continue;
      }
      contributorStats.editCount += 1;
      contributorStats.weightedActivity += commitWeight;
      contributorStats.lastEditedAt =
        contributorStats.lastEditedAt === null
          ? commit.timestamp
          : Math.max(contributorStats.lastEditedAt, commit.timestamp);
    }
  }

  const legacyFiles = buildFileReports(history, authors, options);
  const sections = [
    buildSection("overall", legacyFiles),
    buildSection("ts-js-css", legacyFiles),
    buildSection("python", []),
    buildSection("markdown", []),
  ];
  const overall = sections[0];

  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    generatedAt:
      commits[0] === undefined
        ? "1970-01-01T00:00:00.000Z"
        : new Date(commits[0].timestamp).toISOString(),
    source: options.source ?? { mode: "git-log" },
    options: {
      activeThreshold: options.activeThreshold,
      halfLifeDays: options.halfLifeDays,
      riskContributorCount: options.riskContributorCount,
    },
    authors,
    weeks,
    commitStats: buildCommitStats(commits, authors, weeks),
    sections,
    summary: {
      totalFiles: overall?.totalFiles ?? 0,
      riskFiles: overall?.riskFiles ?? 0,
      authorCount: authors.length,
      weekCount: weeks.length,
    },
  };
};
