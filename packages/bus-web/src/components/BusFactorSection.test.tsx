import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BusfactorReportSection } from "bus-lib";
import { BusFactorSection } from "./BusFactorSection.js";

const createSection = (): BusfactorReportSection => ({
  id: "ts-js-css",
  label: "TS/JS/CSS",
  totalFiles: 2,
  riskFiles: 1,
  files: [
    {
      path: "src/risky.ts",
      totalEdits: 2,
      lastEditedAt: "2024-02-01T12:00:00.000Z",
      totalWeightedActivity: 2,
      compatibilityFrecency: 2,
      activeContributorCount: 1,
      riskContributorThreshold: 2,
      isRisk: true,
      contributors: [
        {
          author: "Alice Example",
          editCount: 2,
          lastEditedAt: "2024-02-01T12:00:00.000Z",
          weightedActivity: 2,
          compatibilityFrecency: 2,
          contributionPercent: 100,
          isActive: true,
        },
      ],
    },
    {
      path: "src/shared.ts",
      totalEdits: 3,
      lastEditedAt: "2024-02-02T12:00:00.000Z",
      totalWeightedActivity: 3,
      compatibilityFrecency: 3,
      activeContributorCount: 2,
      riskContributorThreshold: 2,
      isRisk: false,
      contributors: [
        {
          author: "Bob Example",
          editCount: 2,
          lastEditedAt: "2024-02-02T12:00:00.000Z",
          weightedActivity: 2,
          compatibilityFrecency: 2,
          contributionPercent: 66.666,
          isActive: true,
        },
        {
          author: "Cara Example",
          editCount: 1,
          lastEditedAt: "2024-02-01T12:00:00.000Z",
          weightedActivity: 1,
          compatibilityFrecency: 1,
          contributionPercent: 33.334,
          isActive: true,
        },
      ],
    },
  ],
});

const rowForPath = (path: string): HTMLElement => {
  const cell = screen.getByText(path);
  const row = cell.closest("tr");
  if (row === null) {
    throw new Error(`Missing table row for ${path}.`);
  }
  return row;
};

afterEach(() => {
  cleanup();
});

describe("BusFactorSection", () => {
  it("renders the section heading and tracked-file summary", () => {
    render(<BusFactorSection section={createSection()} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "TS/JS/CSS" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("2 tracked files · 1 high-risk file"),
    ).toBeInTheDocument();
  });

  it("renders file rows with paths, edit counts, and active contributor counts", () => {
    render(<BusFactorSection section={createSection()} />);

    expect(
      screen.getByRole("table", { name: "Bus factor by file for TS/JS/CSS" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "File Path" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Total Edits" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Active Contributors" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Contributor Activity" }),
    ).toBeInTheDocument();

    const riskyRow = within(rowForPath("src/risky.ts"));
    expect(riskyRow.getByText("src/risky.ts")).toBeInTheDocument();
    expect(riskyRow.getByText("2")).toBeInTheDocument();
    expect(riskyRow.getByText("1")).toBeInTheDocument();

    const sharedRow = within(rowForPath("src/shared.ts"));
    expect(sharedRow.getByText("src/shared.ts")).toBeInTheDocument();
    expect(sharedRow.getByText("3")).toBeInTheDocument();
    expect(sharedRow.getByText("2")).toBeInTheDocument();
  });

  it("renders High Risk only for risky files and does not render Low Familiarity", () => {
    render(<BusFactorSection section={createSection()} />);

    expect(screen.getAllByText("High Risk")).toHaveLength(1);
    expect(
      within(rowForPath("src/risky.ts")).getByText("High Risk"),
    ).toBeInTheDocument();
    expect(within(rowForPath("src/shared.ts")).queryByText("High Risk")).toBe(
      null,
    );
    expect(screen.queryByText(/Low Familiarity/i)).not.toBeInTheDocument();
  });

  it("renders contributor percentages and edit counts", () => {
    render(<BusFactorSection section={createSection()} />);

    const riskyRow = within(rowForPath("src/risky.ts"));
    expect(riskyRow.getByText("Alice Example")).toBeInTheDocument();
    expect(riskyRow.getByText("100%")).toBeInTheDocument();
    expect(riskyRow.getByText("2 edits")).toBeInTheDocument();

    const sharedRow = within(rowForPath("src/shared.ts"));
    expect(sharedRow.getByText("Bob Example")).toBeInTheDocument();
    expect(sharedRow.getByText("66.7%")).toBeInTheDocument();
    expect(sharedRow.getByText("2 edits")).toBeInTheDocument();
    expect(sharedRow.getByText("Cara Example")).toBeInTheDocument();
    expect(sharedRow.getByText("33.3%")).toBeInTheDocument();
    expect(sharedRow.getByText("1 edit")).toBeInTheDocument();
  });

  it("renders a clear empty state instead of an empty table", () => {
    render(
      <BusFactorSection
        section={{
          id: "python",
          label: "Python",
          totalFiles: 0,
          riskFiles: 0,
          files: [],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Python" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No tracked files in this section."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
