import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeGitLog } from "./analyzer.js";
import { parseGitLog } from "./git-log.js";

const fixturePath = join(
  import.meta.dirname,
  "../test/fixtures/legacy-git-log.txt",
);
const fixture = readFileSync(fixturePath, "utf8");
const categoryFixturePath = join(
  import.meta.dirname,
  "../test/fixtures/category-git-log.txt",
);
const categoryFixture = readFileSync(categoryFixturePath, "utf8");

describe("legacy git log parser", () => {
  it("parses authors, dates, and name-status file lines", () => {
    const commits = parseGitLog(fixture);

    expect(commits).toHaveLength(5);
    expect(commits[0]).toMatchObject({
      author: "Alice Example",
      dateText: "Thu Feb 1 12:00:00 2024 +0000",
    });
    expect(commits[0]?.changedFiles.slice(0, 3)).toEqual([
      { status: "M", path: "src/app.js" },
      { status: "M", path: "src/feature.ts" },
      { status: "A", path: "src/component.jsx" },
    ]);
    expect(commits[4]?.changedFiles).toEqual([
      { status: "D", path: "src/removed.ts" },
    ]);
  });
});

describe("legacy analyzer behavior", () => {
  it("computes weekly commits and legacy file risk rows", () => {
    const report = analyzeGitLog(fixture);

    expect(report.generatedAt).toBe("2024-02-01T12:00:00.000Z");
    expect(report.authors).toEqual([
      "Alice Example",
      "Bob Example",
      "Cara Example",
    ]);
    expect(report.weeks).toEqual(["2024-02-04", "2024-01-28"]);
    expect(report.commitStats).toEqual([
      {
        author: "Alice Example",
        totalCommits: 2,
        weeklyCommits: [
          { week: "2024-02-04", count: 1 },
          { week: "2024-01-28", count: 1 },
        ],
      },
      {
        author: "Bob Example",
        totalCommits: 2,
        weeklyCommits: [
          { week: "2024-02-04", count: 1 },
          { week: "2024-01-28", count: 1 },
        ],
      },
      {
        author: "Cara Example",
        totalCommits: 1,
        weeklyCommits: [
          { week: "2024-02-04", count: 1 },
          { week: "2024-01-28", count: 0 },
        ],
      },
    ]);

    const section = report.sections.find((entry) => entry.id === "ts-js-css");
    const markdown = report.sections.find((entry) => entry.id === "markdown");
    const python = report.sections.find((entry) => entry.id === "python");
    const overall = report.sections.find((entry) => entry.id === "overall");
    expect(section?.totalFiles).toBe(6);
    expect(section?.riskFiles).toBe(5);
    expect(markdown?.totalFiles).toBe(1);
    expect(markdown?.riskFiles).toBe(1);
    expect(python?.totalFiles).toBe(0);
    expect(overall?.totalFiles).toBe(7);
    expect(overall?.riskFiles).toBe(6);

    const paths = section?.files.map((file) => file.path);
    expect(paths).toEqual([
      "src/app.js",
      "styles/site.css",
      "src/feature.ts",
      "src/component.jsx",
      "styles/copied.css",
      "src/view.tsx",
    ]);
    expect(markdown?.files.map((file) => file.path)).toEqual([
      "docs/readme.md",
    ]);
    expect(overall?.files.map((file) => file.path)).toEqual([
      "src/app.js",
      "styles/site.css",
      "src/feature.ts",
      "src/component.jsx",
      "styles/copied.css",
      "docs/readme.md",
      "src/view.tsx",
    ]);
    expect(paths).not.toContain("node_modules/pkg/index.js");
    expect(paths).not.toContain("build/generated.js");
    expect(paths).not.toContain("dist/bundle.js");
    expect(paths).not.toContain("src/removed.ts");
    expect(paths).not.toContain("docs/readme.md");

    const app = section?.files[0];
    expect(app).toMatchObject({
      path: "src/app.js",
      totalEdits: 3,
      totalWeightedActivity: 2.726059,
      compatibilityFrecency: 2.726059,
      activeContributorCount: 3,
      isRisk: false,
    });
    expect(
      app?.contributors.map((contributor) => contributor.isActive),
    ).toEqual([true, true, true]);

    const feature = section?.files.find(
      (file) => file.path === "src/feature.ts",
    );
    expect(feature).toMatchObject({
      totalEdits: 2,
      totalWeightedActivity: 1.5,
      activeContributorCount: 1,
      isRisk: true,
    });
    expect(feature?.contributors[0]).toMatchObject({
      author: "Alice Example",
      editCount: 2,
      contributionPercent: 100,
      isActive: true,
    });

    expect(report.summary).toEqual({
      totalFiles: 7,
      riskFiles: 6,
      authorCount: 3,
      weekCount: 2,
    });
  });

  it("builds source category sections with markdown and python files", () => {
    const report = analyzeGitLog(categoryFixture);
    const overall = report.sections.find((entry) => entry.id === "overall");
    const tsJsCss = report.sections.find((entry) => entry.id === "ts-js-css");
    const python = report.sections.find((entry) => entry.id === "python");
    const markdown = report.sections.find((entry) => entry.id === "markdown");

    expect(report.sections.map((section) => section.id)).toEqual([
      "overall",
      "ts-js-css",
      "python",
      "markdown",
    ]);
    expect(tsJsCss?.files.map((file) => file.path)).toEqual([
      "src/app.ts",
      "src/styles.css",
    ]);
    expect(python?.files.map((file) => file.path)).toEqual([
      "scripts/tool.py",
      "scripts/types.pyi",
    ]);
    expect(markdown?.files.map((file) => file.path)).toEqual([
      "docs/readme.md",
      "docs/guide.mdx",
      "docs/reference.markdown",
      "README.MD",
    ]);
    expect(overall?.totalFiles).toBe(
      (tsJsCss?.totalFiles ?? 0) +
        (python?.totalFiles ?? 0) +
        (markdown?.totalFiles ?? 0),
    );
    expect(overall?.files.map((file) => file.path)).not.toContain(
      "node_modules/docs/ignored.md",
    );
    expect(overall?.files.map((file) => file.path)).not.toContain(
      "build/docs/ignored.md",
    );
    expect(overall?.files.map((file) => file.path)).not.toContain(
      "dist/docs/ignored.mdx",
    );
    expect(overall?.files.map((file) => file.path)).not.toContain("notes.txt");
    expect(overall?.files.map((file) => file.path)).not.toContain(
      "docs/deleted.md",
    );
  });

  it("returns a deterministic empty report for empty input", () => {
    expect(analyzeGitLog("")).toMatchObject({
      generatedAt: "1970-01-01T00:00:00.000Z",
      authors: [],
      weeks: [],
      commitStats: [],
      summary: {
        totalFiles: 0,
        riskFiles: 0,
        authorCount: 0,
        weekCount: 0,
      },
    });
  });
});
