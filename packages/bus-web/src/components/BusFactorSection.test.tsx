import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
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
      totalEdits: 7,
      lastEditedAt: "2024-02-02T12:00:00.000Z",
      totalWeightedActivity: 7,
      compatibilityFrecency: 7,
      activeContributorCount: 3,
      riskContributorThreshold: 2,
      isRisk: false,
      contributors: [
        {
          author: "Alice Example",
          editCount: 1,
          lastEditedAt: "2024-02-01T12:00:00.000Z",
          weightedActivity: 1,
          compatibilityFrecency: 1,
          contributionPercent: 14.286,
          isActive: true,
        },
        {
          author: "Bob Example",
          editCount: 4,
          lastEditedAt: "2024-02-02T12:00:00.000Z",
          weightedActivity: 4,
          compatibilityFrecency: 4,
          contributionPercent: 57.143,
          isActive: true,
        },
        {
          author: "Cara Example",
          editCount: 2,
          lastEditedAt: "2024-02-01T12:00:00.000Z",
          weightedActivity: 2,
          compatibilityFrecency: 2,
          contributionPercent: 28.571,
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
  it("renders the file grid controls without its own visible section header", () => {
    render(<BusFactorSection section={createSection()} />);

    expect(
      screen.queryByRole("heading", { level: 2, name: "TS/JS/CSS" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Bus factor by file")).not.toBeInTheDocument();
    expect(
      screen.queryByText("2 tracked files · 1 high-risk file"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "TS/JS/CSS table density" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("High Risk stats cells are highlighted."),
    ).toBeInTheDocument();
  });

  it("renders default mode headers and combined edit/contributor stats", () => {
    render(<BusFactorSection section={createSection()} />);

    expect(
      screen.getByRole("table", { name: "Bus factor by file for TS/JS/CSS" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "File Path" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Edits (contributors)" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Total Edits" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Active Contributors" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Status" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Alice Example" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Bob Example" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Cara Example" }),
    ).toBeInTheDocument();

    const riskyRow = within(rowForPath("src/risky.ts"));
    expect(riskyRow.getByText("src/risky.ts")).toBeInTheDocument();
    expect(riskyRow.getByText("2 (1)")).toBeInTheDocument();

    const sharedRow = within(rowForPath("src/shared.ts"));
    expect(sharedRow.getByText("src/shared.ts")).toBeInTheDocument();
    expect(sharedRow.getByText("7 (3)")).toBeInTheDocument();
    expect(
      sharedRow.getByRole("cell", {
        name: "src/shared.ts, 7 edits, 3 active contributors",
      }),
    ).toBeInTheDocument();
  });

  it("labels high-risk stats cells accessibly and includes a visible legend", () => {
    render(<BusFactorSection section={createSection()} />);

    expect(
      screen.getByText("High Risk stats cells are highlighted."),
    ).toBeInTheDocument();
    const riskyStatsCell = within(rowForPath("src/risky.ts")).getByRole(
      "cell",
      {
        name: "src/risky.ts, 2 edits, 1 active contributor, High Risk",
      },
    );
    expect(riskyStatsCell).toHaveClass("bg-[#fff3e6]");
    expect(riskyStatsCell).toHaveClass("border-l-4");
    expect(within(rowForPath("src/shared.ts")).queryByText("High Risk")).toBe(
      null,
    );
    expect(
      within(rowForPath("src/shared.ts")).getByRole("cell", {
        name: "src/shared.ts, 7 edits, 3 active contributors",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Low Familiarity/i)).not.toBeInTheDocument();
  });

  it("keeps High Risk as the only risk label", () => {
    render(<BusFactorSection section={createSection()} />);

    expect(screen.getByText(/High Risk stats cells/)).toBeInTheDocument();
    expect(within(rowForPath("src/shared.ts")).queryByText("High Risk")).toBe(
      null,
    );
    expect(screen.queryByText(/Low Familiarity/i)).not.toBeInTheDocument();
  });

  it("renders contributor percentages and edit counts", () => {
    render(<BusFactorSection section={createSection()} />);

    const riskyRow = within(rowForPath("src/risky.ts"));
    expect(riskyRow.getByText("100%")).toBeInTheDocument();
    expect(riskyRow.getByText("2 edits")).toBeInTheDocument();
    expect(
      riskyRow.getByRole("cell", {
        name: "src/risky.ts, Alice Example contribution: 100%, 2 edits",
      }),
    ).toBeInTheDocument();

    const sharedRow = within(rowForPath("src/shared.ts"));
    expect(sharedRow.getByText("57.1%")).toBeInTheDocument();
    expect(sharedRow.getByText("4 edits")).toBeInTheDocument();
    expect(sharedRow.getByText("28.6%")).toBeInTheDocument();
    expect(sharedRow.getByText("2 edits")).toBeInTheDocument();
    expect(
      sharedRow.getByRole("cell", {
        name: "src/shared.ts, Bob Example contribution: 57.1%, 4 edits",
      }),
    ).toBeInTheDocument();
    expect(
      sharedRow.getByRole("cell", {
        name: "src/shared.ts, Cara Example contribution: 28.6%, 2 edits",
      }),
    ).toBeInTheDocument();
  });

  it("toggles compact mode through the density radio group", () => {
    render(<BusFactorSection section={createSection()} />);

    const defaultRadio = screen.getByRole("radio", { name: "Default" });
    const compactRadio = screen.getByRole("radio", { name: "Compact" });

    expect(defaultRadio).toBeChecked();
    expect(compactRadio).not.toBeChecked();

    fireEvent.click(compactRadio);

    expect(defaultRadio).not.toBeChecked();
    expect(compactRadio).toBeChecked();
  });

  it("shows compact basenames while preserving full file paths", () => {
    render(<BusFactorSection section={createSection()} />);

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));

    expect(screen.getByText("risky.ts")).toBeInTheDocument();
    expect(screen.getByText("shared.ts")).toBeInTheDocument();
    expect(screen.queryByText("src/risky.ts")).not.toBeInTheDocument();

    const riskyHeader = screen.getByRole("rowheader", {
      name: "src/risky.ts",
    });
    expect(riskyHeader).toHaveAttribute("title", "src/risky.ts");
  });

  it("shows compact contributor percentages while preserving edit counts accessibly", () => {
    render(<BusFactorSection section={createSection()} />);

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));

    const sharedRow = within(
      screen.getByRole("rowheader", { name: "src/shared.ts" }).closest("tr") ??
        document.body,
    );
    expect(sharedRow.getByText("57.1%")).toBeInTheDocument();
    expect(sharedRow.queryByText("4 edits")).not.toBeInTheDocument();

    const bobCell = sharedRow.getByRole("cell", {
      name: "src/shared.ts, Bob Example contribution: 57.1%, 4 edits",
    });
    expect(bobCell).toHaveAttribute(
      "title",
      "src/shared.ts, Bob Example contribution: 57.1%, 4 edits",
    );
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
      screen.queryByRole("heading", { level: 2, name: "Python" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("No tracked files in this section."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
