import type { BusfactorReport } from "./types.js";
export { analyzeGitLog } from "./analyzer.js";
export {
  DEFAULT_FILE_CATEGORIES,
  DEFAULT_IGNORED_PATH_SEGMENTS,
  DEFAULT_TRACKED_STATUSES,
  categoryMatchesPath,
  classifyFileChange,
  classifyFilePath,
  isIgnoredPath,
  isTrackedStatus,
  normalizePathForClassification,
} from "./categories.js";
export type { ClassifiedFilePath } from "./categories.js";
export {
  DEFAULT_ANALYSIS_OPTIONS,
  DEFAULT_REPORT_SECTIONS,
  DEFAULT_SECTION_IDS,
  REPORT_SCHEMA_VERSION,
} from "./constants.js";
export { parseGitLog } from "./git-log.js";
import {
  DEFAULT_ANALYSIS_OPTIONS,
  DEFAULT_REPORT_SECTIONS,
  REPORT_SCHEMA_VERSION,
} from "./constants.js";

export type {
  AuthorCommitStats,
  BusfactorAnalysisOptions,
  BusfactorReport,
  BusfactorReportSection,
  BusfactorReportSource,
  BusfactorReportSummary,
  DefaultReportSectionId,
  FileCategoryDefinition,
  FileContributionReport,
  FileContributorReport,
  GitFileChange,
  GitLogCommit,
  ReportSectionId,
  WeeklyCommitCount,
} from "./types.js";

export const createEmptyReport = (): BusfactorReport => ({
  schemaVersion: REPORT_SCHEMA_VERSION,
  generatedAt: "1970-01-01T00:00:00.000Z",
  source: { mode: "git-log" },
  options: { ...DEFAULT_ANALYSIS_OPTIONS },
  authors: [],
  weeks: [],
  commitStats: [],
  sections: DEFAULT_REPORT_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    totalFiles: 0,
    riskFiles: 0,
    files: [],
  })),
  summary: {
    totalFiles: 0,
    riskFiles: 0,
    authorCount: 0,
    weekCount: 0,
  },
});
