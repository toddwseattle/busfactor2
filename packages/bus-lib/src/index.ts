import type {
  BusfactorAnalysisOptions,
  BusfactorReport,
  ReportSectionDefinition,
  ReportSectionId,
} from "./types.js";

export type {
  BusfactorAnalysisOptions,
  BusfactorReport,
  BusfactorReportSection,
  BusfactorReportSource,
  BusfactorReportSummary,
  ReportSectionDefinition,
  ReportSectionId,
} from "./types.js";

export const REPORT_SCHEMA_VERSION = "busfactor.report.v1";

export const DEFAULT_SECTION_IDS = [
  "overall",
  "ts-js-css",
  "python",
  "markdown",
] as const satisfies readonly ReportSectionId[];

export const DEFAULT_REPORT_SECTIONS = [
  { id: "overall", label: "Overall" },
  { id: "ts-js-css", label: "TS/JS/CSS" },
  { id: "python", label: "Python" },
  { id: "markdown", label: "Markdown" },
] as const satisfies readonly ReportSectionDefinition[];

export const DEFAULT_ANALYSIS_OPTIONS = {
  activeThreshold: 0.05,
  halfLifeDays: 7,
  riskContributorCount: 3,
} as const satisfies BusfactorAnalysisOptions;

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
  })),
  summary: {
    totalFiles: 0,
    riskFiles: 0,
  },
});
