import type {
  BusfactorAnalysisOptions,
  DefaultReportSectionId,
  ReportSectionDefinition,
} from "./types.js";

export const REPORT_SCHEMA_VERSION = "busfactor.report.v1";

export const DEFAULT_SECTION_IDS = [
  "overall",
  "ts-js-css",
  "python",
  "markdown",
] as const satisfies readonly DefaultReportSectionId[];

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
