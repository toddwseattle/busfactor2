export type DefaultReportSectionId =
  | "overall"
  | "ts-js-css"
  | "python"
  | "markdown";

export type ReportSectionId = DefaultReportSectionId | (string & {});

export interface ReportSectionDefinition {
  id: ReportSectionId;
  label: string;
}

export interface BusfactorReportSource {
  mode: "git-log";
  label?: string;
  inputPath?: string;
  repoPath?: string;
  ref?: string;
  stdin?: boolean;
}

export interface BusfactorAnalysisOptions {
  activeThreshold: number;
  halfLifeDays: number;
  riskContributorCount: number;
  source?: BusfactorReportSource;
  categories?: readonly FileCategoryDefinition[];
}

export interface FileCategoryDefinition {
  id: string;
  label: string;
  extensions: readonly string[];
  includeInOverall?: boolean;
}

export interface GitFileChange {
  status: string;
  path: string;
}

export interface GitLogCommit {
  author: string;
  dateText: string;
  timestamp: number;
  changedFiles: GitFileChange[];
}

export interface WeeklyCommitCount {
  week: string;
  count: number;
}

export interface AuthorCommitStats {
  author: string;
  totalCommits: number;
  weeklyCommits: WeeklyCommitCount[];
}

export interface FileContributorReport {
  author: string;
  editCount: number;
  lastEditedAt: string | null;
  weightedActivity: number;
  compatibilityFrecency: number;
  contributionPercent: number;
  isActive: boolean;
}

export interface FileContributionReport {
  path: string;
  totalEdits: number;
  lastEditedAt: string | null;
  totalWeightedActivity: number;
  compatibilityFrecency: number;
  activeContributorCount: number;
  riskContributorThreshold: number;
  isRisk: boolean;
  contributors: FileContributorReport[];
}

export interface BusfactorReportSection {
  id: ReportSectionId;
  label: string;
  totalFiles: number;
  riskFiles: number;
  files: FileContributionReport[];
}

export interface BusfactorReportSummary {
  totalFiles: number;
  riskFiles: number;
  authorCount: number;
  weekCount: number;
}

export interface BusfactorReport {
  schemaVersion: string;
  generatedAt: string;
  source: BusfactorReportSource;
  options: BusfactorAnalysisOptions;
  authors: string[];
  weeks: string[];
  commitStats: AuthorCommitStats[];
  sections: BusfactorReportSection[];
  summary: BusfactorReportSummary;
}
