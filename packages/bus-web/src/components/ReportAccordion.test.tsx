import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
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

const sharedFile: BusfactorReportSection["files"][number] = {
  path: "src/shared.ts",
  totalEdits: 4,
  lastEditedAt: "2024-02-02T12:00:00.000Z",
  totalWeightedActivity: 4,
  compatibilityFrecency: 4,
  activeContributorCount: 1,
  riskContributorThreshold: 2,
  isRisk: false,
  contributors: [
    {
      author: "Alice Example",
      editCount: 1,
      lastEditedAt: "2024-02-01T12:00:00.000Z",
      weightedActivity: 1,
      compatibilityFrecency: 1,
      contributionPercent: 25,
      isActive: false,
    },
    {
      author: "Bob Example",
      editCount: 2,
      lastEditedAt: "2024-02-02T12:00:00.000Z",
      weightedActivity: 2,
      compatibilityFrecency: 2,
      contributionPercent: 50,
      isActive: true,
    },
    {
      author: "Cara Example",
      editCount: 1,
      lastEditedAt: "2024-02-01T12:00:00.000Z",
      weightedActivity: 1,
      compatibilityFrecency: 1,
      contributionPercent: 25,
      isActive: false,
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
          createSection("overall", "Overall", [riskFile, sharedFile]),
          createSection("python", "Python"),
        ]}
      />,
    );

    const overallButton = screen.getByRole("button", {
      name: /Overall by file/,
    });
    const pythonButton = screen.getByRole("button", {
      name: /Python by file/,
    });

    expect(overallButton).toHaveAttribute("aria-expanded", "true");
    expect(pythonButton).toHaveAttribute("aria-expanded", "false");
    expect(overallButton).toHaveAttribute("aria-controls");
    expect(
      screen.getByRole("region", { name: "Overall by file report panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Bus factor by file for Overall" }),
    ).toBeInTheDocument();
  });

  it("renders plus/minus state, by-file labels, and derived summary stats", () => {
    render(
      <ReportAccordion
        sections={[
          createSection("overall", "Overall", [riskFile, sharedFile]),
          createSection("python", "Python"),
        ]}
      />,
    );

    const overallButton = screen.getByRole("button", {
      name: /Overall by file/,
    });
    const pythonButton = screen.getByRole("button", {
      name: /Python by file/,
    });

    expect(within(overallButton).getByText("-")).toBeInTheDocument();
    expect(within(pythonButton).getByText("+")).toBeInTheDocument();
    expect(within(overallButton).getByText("Overall by file")).toBeVisible();
    expect(within(pythonButton).getByText("Python by file")).toBeVisible();
    expect(
      within(overallButton).getByText("5 total edits, 2 contributors"),
    ).toBeVisible();
    expect(
      within(pythonButton).getByText("0 total edits, 0 contributors"),
    ).toBeVisible();
    expect(overallButton).toHaveAccessibleName(/Collapse section/);
    expect(pythonButton).toHaveAccessibleName(/Expand section/);
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

    expect(
      screen.getByRole("button", { name: /Python by file/ }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: /Markdown by file/ }),
    ).toHaveAttribute("aria-expanded", "false");
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

    const overallButton = screen.getByRole("button", {
      name: /Overall by file/,
    });
    const pythonButton = screen.getByRole("button", {
      name: /Python by file/,
    });

    fireEvent.click(pythonButton);

    expect(overallButton).toHaveAttribute("aria-expanded", "false");
    expect(pythonButton).toHaveAttribute("aria-expanded", "true");
    expect(within(overallButton).getByText("+")).toBeInTheDocument();
    expect(within(pythonButton).getByText("-")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Bus factor by file for Python" }),
    ).toBeInTheDocument();

    fireEvent.click(pythonButton);

    expect(pythonButton).toHaveAttribute("aria-expanded", "false");
    expect(within(pythonButton).getByText("+")).toBeInTheDocument();
    expect(
      screen.queryByRole("table", { name: "Bus factor by file for Python" }),
    ).not.toBeInTheDocument();
  });
});
