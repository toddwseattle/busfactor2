import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";

const gitLogSample = `commit 1111111111111111111111111111111111111111
Author: Alice Example <alice@example.com>
Date:   Thu Feb 1 12:00:00 2024 +0000

M\tsrc/app.js
M\tsrc/feature.ts
A\tsrc/component.jsx
C\tstyles/copied.css
A\tstyles/site.css
M\tdocs/readme.md

commit 2222222222222222222222222222222222222222
Author: Bob Example <bob@example.com>
Date:   Wed Jan 31 12:00:00 2024 +0000

M\tsrc/app.js
M\tstyles/site.css

commit 3333333333333333333333333333333333333333
Author: Cara Example <cara@example.com>
Date:   Tue Jan 30 12:00:00 2024 +0000

M\tsrc/app.js
A\tsrc/view.tsx

commit 4444444444444444444444444444444444444444
Author: Alice Example <alice@example.com>
Date:   Thu Jan 25 12:00:00 2024 +0000

M\tsrc/feature.ts
`;

const createGitLogFile = (
  text: string,
  name = "sample-git-log.txt",
  textReader: () => Promise<string> = () => Promise.resolve(text),
) => {
  const file = new File([text], name, { type: "text/plain" });
  Object.defineProperty(file, "text", {
    configurable: true,
    value: textReader,
  });
  return file;
};

const uploadGitLog = (text: string, name = "sample-git-log.txt") => {
  const file = createGitLogFile(text, name);
  const input = screen.getByLabelText("Git log file");
  fireEvent.change(input, { target: { files: [file] } });
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders the branded empty state and footer", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Busfactor2" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Git log file")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No report generated yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("(c) Todd Warren and Chris Riesbeck 2026"),
    ).toBeInTheDocument();
  });

  it("renders a loading state while reading the uploaded file", async () => {
    let resolveText: (text: string) => void = () => undefined;
    const file = createGitLogFile(
      gitLogSample,
      "slow-git-log.txt",
      () =>
        new Promise<string>((resolve) => {
          resolveText = resolve;
        }),
    );
    render(<App />);

    fireEvent.change(screen.getByLabelText("Git log file"), {
      target: { files: [file] },
    });

    expect(
      screen.getByRole("heading", { name: "Analyzing git log" }),
    ).toBeInTheDocument();

    resolveText(gitLogSample);
    expect(
      await screen.findByRole("heading", { name: "Project signal" }),
    ).toBeInTheDocument();
  });

  it("uploads a deterministic git log and renders summary metrics", async () => {
    render(<App />);

    uploadGitLog(gitLogSample);

    expect(
      await screen.findByRole("heading", { name: "Project signal" }),
    ).toBeInTheDocument();

    const authors = screen.getByRole("article", { name: "Total Authors" });
    const trackedFiles = screen.getByRole("article", {
      name: "Tracked Files",
    });
    const riskFiles = screen.getByRole("article", { name: "Risk Files" });
    const activeWeeks = screen.getByRole("article", { name: "Active Weeks" });

    expect(within(authors).getByText("3")).toBeInTheDocument();
    expect(within(trackedFiles).getByText("7")).toBeInTheDocument();
    expect(within(riskFiles).getByText("6")).toBeInTheDocument();
    expect(within(activeWeeks).getByText("2")).toBeInTheDocument();
  });

  it("labels the section distribution chart as tracked files", async () => {
    render(<App />);

    uploadGitLog(gitLogSample);

    expect(
      await screen.findByRole("heading", {
        name: "Tracked files by report section",
      }),
    ).toBeInTheDocument();
    const chart = screen
      .getByRole("heading", { name: "Tracked files by report section" })
      .closest("section");
    if (chart === null) {
      throw new Error("Missing section distribution chart.");
    }
    expect(
      screen.getByRole("progressbar", { name: "Overall tracked files" }),
    ).toHaveAttribute("aria-valuenow", "7");
    expect(
      screen.getByRole("progressbar", { name: "TS/JS/CSS tracked files" }),
    ).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByText("7 tracked files")).toBeInTheDocument();
    expect(within(chart).queryByText(/\bLOC\b/i)).not.toBeInTheDocument();
  });

  it("uploads a deterministic git log and renders weekly commit activity", async () => {
    render(<App />);

    uploadGitLog(gitLogSample);

    expect(
      await screen.findByRole("heading", { name: "Weekly commits" }),
    ).toBeInTheDocument();

    const table = screen.getByRole("table", {
      name: "Weekly commits by author and report week",
    });

    expect(
      within(table).getByRole("columnheader", { name: "Author" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("columnheader", { name: "Total" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("columnheader", { name: "2024-02-04" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("columnheader", { name: "2024-01-28" }),
    ).toBeInTheDocument();

    expect(
      within(table).getByRole("rowheader", { name: "Alice Example" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("rowheader", { name: "Bob Example" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("rowheader", { name: "Cara Example" }),
    ).toBeInTheDocument();

    expect(
      within(
        within(table).getByRole("cell", {
          name: "Alice Example total commits: 2 commits",
        }),
      ).getByText("2"),
    ).toBeVisible();
    expect(
      within(
        within(table).getByRole("cell", {
          name: "Bob Example total commits: 1 commit",
        }),
      ).getByText("1"),
    ).toBeVisible();
    expect(
      within(
        within(table).getByRole("cell", {
          name: "Cara Example total commits: 1 commit",
        }),
      ).getByText("1"),
    ).toBeVisible();

    expect(
      within(
        within(table).getByRole("cell", {
          name: "Alice Example, week 2024-02-04: 1 commit",
        }),
      ).getByText("1"),
    ).toBeVisible();
    expect(
      within(
        within(table).getByRole("cell", {
          name: "Alice Example, week 2024-01-28: 1 commit",
        }),
      ).getByText("1"),
    ).toBeVisible();
    expect(
      within(
        within(table).getByRole("cell", {
          name: "Bob Example, week 2024-02-04: 1 commit",
        }),
      ).getByText("1"),
    ).toBeVisible();
    expect(
      within(
        within(table).getByRole("cell", {
          name: "Bob Example, week 2024-01-28: 0 commits",
        }),
      ).getByText("0"),
    ).toBeVisible();
    expect(
      within(
        within(table).getByRole("cell", {
          name: "Cara Example, week 2024-02-04: 1 commit",
        }),
      ).getByText("1"),
    ).toBeVisible();
    expect(
      within(
        within(table).getByRole("cell", {
          name: "Cara Example, week 2024-01-28: 0 commits",
        }),
      ).getByText("0"),
    ).toBeVisible();
  });

  it("renders bus factor file tables with high-risk status only", async () => {
    render(<App />);

    uploadGitLog(gitLogSample);

    const overallButton = await screen.findByRole("button", {
      name: /Overall by file/,
    });
    const tsJsCssButton = screen.getByRole("button", {
      name: /TS\/JS\/CSS by file/,
    });
    const pythonButton = screen.getByRole("button", {
      name: /Python by file/,
    });
    const markdownButton = screen.getByRole("button", {
      name: /Markdown by file/,
    });

    expect(overallButton).toHaveAttribute("aria-expanded", "true");
    expect(tsJsCssButton).toHaveAttribute("aria-expanded", "false");
    expect(pythonButton).toHaveAttribute("aria-expanded", "false");
    expect(markdownButton).toHaveAttribute("aria-expanded", "false");
    expect(overallButton).toHaveAttribute("aria-controls");
    expect(within(overallButton).getByText("-")).toBeInTheDocument();
    expect(within(tsJsCssButton).getByText("+")).toBeInTheDocument();
    expect(
      within(overallButton).getByText("11 total edits, 3 contributors"),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Overall" }),
    ).not.toBeInTheDocument();

    const overallTable = screen.getByRole("table", {
      name: "Bus factor by file for Overall",
    });

    expect(
      within(overallTable).getByRole("columnheader", { name: "File Path" }),
    ).toBeInTheDocument();
    expect(
      within(overallTable).getByRole("columnheader", {
        name: "Edits (contributors)",
      }),
    ).toBeInTheDocument();
    expect(
      within(overallTable).queryByRole("columnheader", {
        name: "Total Edits",
      }),
    ).not.toBeInTheDocument();
    expect(
      within(overallTable).queryByRole("columnheader", { name: "Status" }),
    ).not.toBeInTheDocument();
    expect(
      within(overallTable).getByRole("columnheader", { name: "Alice Example" }),
    ).toBeInTheDocument();
    expect(
      within(overallTable).getByRole("columnheader", { name: "Bob Example" }),
    ).toBeInTheDocument();
    expect(
      within(overallTable).getByRole("columnheader", { name: "Cara Example" }),
    ).toBeInTheDocument();

    expect(within(overallTable).getByText("src/app.js")).toBeInTheDocument();
    expect(within(overallTable).getByText("3 (3)")).toBeInTheDocument();
    expect(
      within(overallTable).getByRole("cell", {
        name: "src/app.js, Alice Example contribution: 36.7%, 1 edit",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("High Risk stats cells are highlighted."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("table", { name: "Bus factor by file for TS/JS/CSS" }),
    ).not.toBeInTheDocument();

    fireEvent.click(tsJsCssButton);

    expect(overallButton).toHaveAttribute("aria-expanded", "false");
    expect(tsJsCssButton).toHaveAttribute("aria-expanded", "true");
    expect(within(overallButton).getByText("+")).toBeInTheDocument();
    expect(within(tsJsCssButton).getByText("-")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Bus factor by file for TS/JS/CSS" }),
    ).toBeInTheDocument();

    fireEvent.click(tsJsCssButton);

    expect(tsJsCssButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("table", { name: "Bus factor by file for TS/JS/CSS" }),
    ).not.toBeInTheDocument();

    fireEvent.click(pythonButton);

    expect(pythonButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.queryByRole("heading", { level: 2, name: "Python" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("No tracked files in this section."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Section placeholders" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Low Familiarity/i)).not.toBeInTheDocument();
  });

  it("renders an accessible upload error for empty files", async () => {
    render(<App />);

    uploadGitLog("", "empty-git-log.txt");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Upload a non-empty git log file.",
    );
  });

  it("renders an accessible upload error for unrecognized text", async () => {
    render(<App />);

    uploadGitLog("this is not a git log", "notes.txt");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The uploaded file did not contain a recognizable git log.",
    );
  });
});
