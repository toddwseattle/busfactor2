import {
  DEFAULT_ANALYSIS_OPTIONS,
  DEFAULT_REPORT_SECTIONS,
  REPORT_SCHEMA_VERSION,
} from "./constants.js";
import { DEFAULT_FILE_CATEGORIES, classifyFileChange } from "./categories.js";
import { parseGitLog } from "./git-log.js";
import type {
  AuthorCommitStats,
  BusfactorAnalysisOptions,
  BusfactorReport,
  BusfactorReportSection,
  FileCategoryDefinition,
  FileContributionReport,
  FileContributorReport,
  GitLogCommit,
  ReportSectionId,
} from "./types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

interface MutableContributorStats {
  editCount: number;
  lastEditedAt: number | null;
  weightedActivity: number;
}

type MutableFileHistory = Map<string, Map<string, MutableContributorStats>>;

interface CategorizedFilePaths {
  byCategory: Map<string, readonly string[]>;
  fileOrder: Map<string, number>;
}

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

const collectCategorizedFilePaths = (
  commits: readonly GitLogCommit[],
  categories: readonly FileCategoryDefinition[],
): CategorizedFilePaths => {
  const fileSetsByCategory = new Map<string, Set<string>>();
  const fileOrder = new Map<string, number>();
  for (const category of categories) {
    fileSetsByCategory.set(category.id, new Set());
  }

  for (const commit of commits) {
    for (const change of commit.changedFiles) {
      const classified = classifyFileChange(
        change.status,
        change.path,
        categories,
      );
      if (classified === null) {
        continue;
      }
      const categoryFiles = fileSetsByCategory.get(classified.category.id);
      if (categoryFiles === undefined) {
        continue;
      }
      categoryFiles.add(classified.path);
      if (!fileOrder.has(classified.path)) {
        fileOrder.set(classified.path, fileOrder.size);
      }
    }
  }

  const byCategory = new Map<string, readonly string[]>();
  for (const [categoryId, files] of fileSetsByCategory) {
    byCategory.set(categoryId, Array.from(files));
  }

  return { byCategory, fileOrder };
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

const initializeCategorizedHistories = (
  categorizedFiles: CategorizedFilePaths,
  authors: readonly string[],
): Map<string, MutableFileHistory> => {
  const histories = new Map<string, MutableFileHistory>();
  for (const [categoryId, files] of categorizedFiles.byCategory) {
    histories.set(categoryId, initializeFileHistory(files, authors));
  }
  return histories;
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

const sortFileReports = (
  files: readonly FileContributionReport[],
  fileOrder: Map<string, number>,
): FileContributionReport[] =>
  [...files].sort((left, right) => {
    if (right.totalWeightedActivity !== left.totalWeightedActivity) {
      return right.totalWeightedActivity - left.totalWeightedActivity;
    }
    return (fileOrder.get(left.path) ?? 0) - (fileOrder.get(right.path) ?? 0);
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
  fileOrder: Map<string, number>,
): FileContributionReport[] =>
  sortFileReports(
    Array.from(history.entries()).map(([path, authorHistory]) => {
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
    }),
    fileOrder,
  );

const buildSection = (
  id: ReportSectionId,
  label: string,
  files: readonly FileContributionReport[],
): BusfactorReportSection => {
  return {
    id,
    label,
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
  const categories = analysisOptions.categories ?? DEFAULT_FILE_CATEGORIES;
  const commits = parseGitLog(text);
  const authors = uniqueSortedAuthors(commits);
  const weeks = uniqueWeeksInEncounterOrder(commits);
  const categorizedFiles = collectCategorizedFilePaths(commits, categories);
  const latestTimestamp = commits[0]?.timestamp ?? 0;
  const histories = initializeCategorizedHistories(categorizedFiles, authors);

  for (const commit of commits) {
    const commitWeight = decay(
      latestTimestamp,
      commit.timestamp,
      options.halfLifeDays,
    );
    for (const change of commit.changedFiles) {
      const classified = classifyFileChange(
        change.status,
        change.path,
        categories,
      );
      if (classified === null) {
        continue;
      }
      const authorHistory = histories
        .get(classified.category.id)
        ?.get(classified.path);
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

  const filesByCategory = new Map<string, FileContributionReport[]>();
  for (const category of categories) {
    const history = histories.get(category.id) ?? new Map();
    filesByCategory.set(
      category.id,
      buildFileReports(history, authors, options, categorizedFiles.fileOrder),
    );
  }

  const overallFiles = sortFileReports(
    categories.flatMap((category) =>
      category.includeInOverall === false
        ? []
        : (filesByCategory.get(category.id) ?? []),
    ),
    categorizedFiles.fileOrder,
  );

  const overallDefinition = DEFAULT_REPORT_SECTIONS.find(
    (section) => section.id === "overall",
  );
  const sections = [
    buildSection(
      "overall",
      overallDefinition?.label ?? "Overall",
      overallFiles,
    ),
    ...categories.map((category) =>
      buildSection(
        category.id,
        category.label,
        filesByCategory.get(category.id) ?? [],
      ),
    ),
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
