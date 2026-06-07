import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runAnalyze } from "./commands/analyze.js";
import { formatHumanReport } from "./formatters/human.js";
import { buildGitLogArgs } from "./input/git.js";
import { buildCli, CLI_VERSION } from "./index.js";

const fixturePath = join(
  import.meta.dirname,
  "../../bus-lib/test/fixtures/legacy-git-log.txt",
);
const fixture = readFileSync(fixturePath, "utf8");

describe("bus-cli analyze behavior", () => {
  it("prints deterministic JSON from fixture input in agent mode", async () => {
    const output: string[] = [];

    await runAnalyze(
      { input: fixturePath, ref: "main", agent: true },
      (text) => output.push(text),
      { loaders: { readFileText: async () => fixture } },
    );

    const report = JSON.parse(output[0] ?? "");
    expect(report.summary).toEqual({
      totalFiles: 9,
      riskFiles: 8,
      authorCount: 3,
      weekCount: 2,
    });
    expect(report.sections[0].files[0].path).toBe("src/app.js");
  });

  it("exposes the analyze command in top-level help", async () => {
    const help = await buildCli(["--help"]).getHelp();

    expect(help).toContain("busfactor <command> [options]");
    expect(help).toContain("analyze");
  });

  it("exposes analyze options in command help", async () => {
    const help = await buildCli(["analyze", "--help"]).getHelp();

    expect(help).toContain("--agent");
    expect(help).toContain("--format");
    expect(help).toContain("--input");
    expect(help).toContain("--stdin");
    expect(help).toContain("--repo");
    expect(help).toContain("--ref");
    expect(help).toContain("--no-color");
  });

  it("exposes the package version", () => {
    expect(CLI_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("uses positional path before the default repo when running git", async () => {
    const output: string[] = [];
    const requests: Array<{ repoPath: string; ref: string }> = [];

    await runAnalyze(
      { path: "sample-repo", repo: ".", ref: "main", agent: true },
      (text) => output.push(text),
      {
        loaders: {
          runGitLog: async (request) => {
            requests.push(request);
            return fixture;
          },
        },
      },
    );

    expect(requests).toEqual([{ repoPath: "sample-repo", ref: "main" }]);
    expect(JSON.parse(output[0] ?? "").source).toEqual({
      mode: "git-log",
      repoPath: "sample-repo",
      ref: "main",
      label: "sample-repo (main)",
    });
  });

  it("prefers input files over stdin and git", async () => {
    const output: string[] = [];
    let readInput = 0;
    let readStdin = 0;
    let runGit = 0;

    await runAnalyze(
      {
        input: "legacy-git-log.txt",
        stdin: true,
        repo: "repo",
        ref: "main",
        agent: true,
      },
      (text) => output.push(text),
      {
        loaders: {
          readFileText: async () => {
            readInput += 1;
            return fixture;
          },
          readStdinText: async () => {
            readStdin += 1;
            return "";
          },
          runGitLog: async () => {
            runGit += 1;
            return "";
          },
        },
      },
    );

    expect(readInput).toBe(1);
    expect(readStdin).toBe(0);
    expect(runGit).toBe(0);
    expect(JSON.parse(output[0] ?? "").source.inputPath).toBe(
      "legacy-git-log.txt",
    );
  });

  it("runs the yargs command path with injected fixture input", async () => {
    const output: string[] = [];

    await buildCli(
      ["analyze", "--input", fixturePath, "--agent"],
      (text) => output.push(text),
      { loaders: { readFileText: async () => fixture } },
    ).parseAsync();

    expect(JSON.parse(output[0] ?? "").summary.totalFiles).toBe(9);
  });

  it("formats human output with weekly commits and section rows", async () => {
    const output: string[] = [];

    await runAnalyze(
      { input: fixturePath, ref: "main", format: "human" },
      (text) => output.push(text),
      { loaders: { readFileText: async () => fixture } },
    );

    expect(output[0]).toContain("Weekly commits:");
    expect(output[0]).toContain("2024-02-04");
    expect(output[0]).toContain("Overall: 8/9 risk files");
    expect(output[0]).toContain("TS/JS/CSS: 8/9 risk files");
    expect(output[0]).toContain("Python: 0/0 risk files");
    expect(output[0]).toContain("src/app.js");
  });

  it("formats reports without prose in json mode", async () => {
    const output: string[] = [];

    await runAnalyze(
      { input: fixturePath, ref: "main", format: "json" },
      (text) => output.push(text),
      { loaders: { readFileText: async () => fixture } },
    );

    expect(() => JSON.parse(output[0] ?? "")).not.toThrow();
    expect(output[0]?.startsWith("{")).toBe(true);
  });

  it("builds git log arguments without shell concatenation", () => {
    expect(buildGitLogArgs({ repoPath: "repo path", ref: "main" })).toEqual([
      "-C",
      "repo path",
      "log",
      "--no-merges",
      "--name-status",
      "main",
    ]);
  });

  it("keeps the human formatter pure", () => {
    const text = formatHumanReport({
      schemaVersion: "busfactor.report.v1",
      generatedAt: "1970-01-01T00:00:00.000Z",
      source: { mode: "git-log" },
      options: {
        activeThreshold: 0.05,
        halfLifeDays: 7,
        riskContributorCount: 3,
      },
      authors: [],
      weeks: [],
      commitStats: [],
      sections: [],
      summary: {
        totalFiles: 0,
        riskFiles: 0,
        authorCount: 0,
        weekCount: 0,
      },
    });

    expect(text).toContain("Busfactor2 analysis");
    expect(text).toContain("Weekly commits:");
  });
});
