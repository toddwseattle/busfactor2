import { describe, expect, it } from "vitest";
import { createEmptyReport } from "bus-lib";
import { runAnalyze } from "./commands/analyze.js";
import { buildCli } from "./index.js";

describe("bus-cli smoke behavior", () => {
  it("prints deterministic JSON in agent mode", () => {
    const output: string[] = [];

    runAnalyze({ agent: true }, (text) => output.push(text));

    expect(JSON.parse(output[0] ?? "")).toEqual(createEmptyReport());
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
  });
});
