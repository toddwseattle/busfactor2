import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BusfactorReportSection } from "bus-lib";
import { ReportAccordion } from "./ReportAccordion.js";

const createSection = (
  id: string,
  label: string,
  files: BusfactorReportSection["files"] = [],
): BusfactorReportSection => ({
  id,
  label,
  totalFiles: files.length,
  riskFiles: files.filter((file) => file.isRisk).length,
  files,
});

const riskFile: BusfactorReportSection["files"][number] = {
  path: "src/app.ts",
  totalEdits: 1,
  lastEditedAt: "2024-02-01T12:00:00.000Z",
  totalWeightedActivity: 1,
  compatibilityFrecency: 1,
  activeContributorCount: 1,
  riskContributorThreshold: 2,
  isRisk: true,
  contributors: [
    {
      author: "Alice Example",
      editCount: 1,
      lastEditedAt: "2024-02-01T12:00:00.000Z",
      weightedActivity: 1,
      compatibilityFrecency: 1,
      contributionPercent: 100,
      isActive: true,
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("ReportAccordion", () => {
  it("expands the overall section by default when present", () => {
    render(
      <ReportAccordion
        sections={[
          createSection("overall", "Overall", [riskFile]),
          createSection("python", "Python"),
        ]}
      />,
    );

    const overallButton = screen.getByRole("button", { name: /Overall/ });
    const pythonButton = screen.getByRole("button", { name: /Python/ });

    expect(overallButton).toHaveAttribute("aria-expanded", "true");
    expect(pythonButton).toHaveAttribute("aria-expanded", "false");
    expect(overallButton).toHaveAttribute("aria-controls");
    expect(
      screen.getByRole("region", { name: "Overall report panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Bus factor by file for Overall" }),
    ).toBeInTheDocument();
  });

  it("expands the first section by default when overall is absent", () => {
    render(
      <ReportAccordion
        sections={[
          createSection("python", "Python", [riskFile]),
          createSection("markdown", "Markdown"),
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: /Python/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: /Markdown/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("toggles a section with a native button", () => {
    render(
      <ReportAccordion
        sections={[
          createSection("overall", "Overall"),
          createSection("python", "Python", [riskFile]),
        ]}
      />,
    );

    const overallButton = screen.getByRole("button", { name: /Overall/ });
    const pythonButton = screen.getByRole("button", { name: /Python/ });

    fireEvent.click(pythonButton);

    expect(overallButton).toHaveAttribute("aria-expanded", "false");
    expect(pythonButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("table", { name: "Bus factor by file for Python" }),
    ).toBeInTheDocument();

    fireEvent.click(pythonButton);

    expect(pythonButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("table", { name: "Bus factor by file for Python" }),
    ).not.toBeInTheDocument();
  });
});
