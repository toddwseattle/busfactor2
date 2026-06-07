import { useState } from "react";
import { analyzeGitLog } from "bus-lib";
import type { BusfactorReport } from "bus-lib";
import { BusFactorSection } from "./components/BusFactorSection.js";
import { CommitStatsTable } from "./components/CommitStatsTable.js";
import { ReportSummary } from "./components/ReportSummary.js";
import { SectionDistributionChart } from "./components/SectionDistributionChart.js";
import { UploadPanel } from "./components/UploadPanel.js";

type AppStatus = "empty" | "loading" | "success" | "error";

interface AppState {
  status: AppStatus;
  report: BusfactorReport | null;
  fileName: string | null;
  error: string | null;
}

const initialState: AppState = {
  status: "empty",
  report: null,
  fileName: null,
  error: null,
};

const readUploadedText = (file: File): Promise<string> => {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("The uploaded file could not be read."));
    });
    reader.readAsText(file);
  });
};

const validateReport = (
  text: string,
  report: BusfactorReport,
): string | null => {
  if (text.trim().length === 0) {
    return "Upload a non-empty git log file.";
  }
  if (report.authors.length === 0 && report.weeks.length === 0) {
    return "The uploaded file did not contain a recognizable git log.";
  }
  return null;
};

export const App = () => {
  const [state, setState] = useState<AppState>(initialState);

  const handleUpload = async (file: File) => {
    setState({
      status: "loading",
      report: null,
      fileName: file.name,
      error: null,
    });

    try {
      const text = await readUploadedText(file);
      const report = analyzeGitLog(text, {
        source: { mode: "git-log", label: file.name },
      });
      const validationError = validateReport(text, report);

      if (validationError !== null) {
        setState({
          status: "error",
          report: null,
          fileName: file.name,
          error: validationError,
        });
        return;
      }

      setState({
        status: "success",
        report,
        fileName: file.name,
        error: null,
      });
    } catch (error: unknown) {
      setState({
        status: "error",
        report: null,
        fileName: file.name,
        error:
          error instanceof Error
            ? error.message
            : "The uploaded file could not be read.",
      });
    }
  };

  const isLoading = state.status === "loading";
  const hasNoTrackedFiles =
    state.status === "success" &&
    state.report !== null &&
    state.report.summary.totalFiles === 0;

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#221635]">
      <header className="border-b border-[#d8d0c4] bg-[#4e2a84] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d6c5ee]">
              Busfactor2
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Busfactor2</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#efe8f7]">
              Upload a git log and review ownership concentration across the
              tracked source sections.
            </p>
          </div>
          <div className="rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm text-[#efe8f7]">
            Browser-only analysis
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-6">
        <UploadPanel isLoading={isLoading} onUpload={handleUpload} />

        {state.status === "empty" ? (
          <section
            aria-labelledby="empty-heading"
            className="rounded-lg border border-[#d8d0c4] bg-white p-6 shadow-sm"
          >
            <h2
              id="empty-heading"
              className="text-2xl font-semibold text-[#221635]"
            >
              No report generated yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#62576f]">
              Upload a git log text file to generate summary metrics and a
              tracked-files distribution.
            </p>
          </section>
        ) : null}

        {isLoading ? (
          <section
            aria-live="polite"
            aria-labelledby="loading-heading"
            className="rounded-lg border border-[#d8d0c4] bg-white p-6 shadow-sm"
          >
            <h2
              id="loading-heading"
              className="text-2xl font-semibold text-[#221635]"
            >
              Analyzing git log
            </h2>
            <p className="mt-2 text-sm text-[#62576f]">
              Reading {state.fileName ?? "uploaded file"} and building the
              Busfactor2 report.
            </p>
          </section>
        ) : null}

        {state.status === "error" ? (
          <section
            aria-labelledby="error-heading"
            role="alert"
            className="rounded-lg border border-[#f5b453] bg-[#fff8ed] p-6 shadow-sm"
          >
            <h2
              id="error-heading"
              className="text-2xl font-semibold text-[#7c2d12]"
            >
              Upload error
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7c2d12]">
              {state.error}
            </p>
          </section>
        ) : null}

        {hasNoTrackedFiles ? (
          <section
            aria-labelledby="no-files-heading"
            className="rounded-lg border border-[#d8d0c4] bg-white p-6 shadow-sm"
          >
            <h2
              id="no-files-heading"
              className="text-2xl font-semibold text-[#221635]"
            >
              No tracked files found
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#62576f]">
              The uploaded log was recognizable, but it did not include tracked
              files in the current Busfactor2 report categories.
            </p>
          </section>
        ) : null}

        {state.status === "success" &&
        state.report !== null &&
        state.report.summary.totalFiles > 0 ? (
          <>
            <ReportSummary summary={state.report.summary} />
            <SectionDistributionChart
              sections={state.report.sections}
              totalFiles={state.report.summary.totalFiles}
            />
            <CommitStatsTable
              commitStats={state.report.commitStats}
              weeks={state.report.weeks}
            />
            {state.report.sections.map((section) => (
              <BusFactorSection key={section.id} section={section} />
            ))}
          </>
        ) : null}
      </main>

      <footer className="border-t border-[#d8d0c4] px-5 py-5 text-center text-sm text-[#62576f]">
        (c) Todd Warren and Chris Riesbeck 2026
      </footer>
    </div>
  );
};
