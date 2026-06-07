export type ReportSectionId = "overall" | "ts-js-css" | "python" | "markdown";

export interface ReportSectionDefinition {
  id: ReportSectionId;
  label: string;
}

export interface BusfactorReportSource {
  mode: "git-log";
}

export interface BusfactorAnalysisOptions {
  activeThreshold: number;
  halfLifeDays: number;
  riskContributorCount: number;
}

export interface BusfactorReportSection {
  id: ReportSectionId;
  label: string;
  totalFiles: number;
  riskFiles: number;
}

export interface BusfactorReportSummary {
  totalFiles: number;
  riskFiles: number;
}

export interface BusfactorReport {
  schemaVersion: string;
  generatedAt: string;
  source: BusfactorReportSource;
  options: BusfactorAnalysisOptions;
  authors: string[];
  weeks: string[];
  commitStats: unknown[];
  sections: BusfactorReportSection[];
  summary: BusfactorReportSummary;
}
