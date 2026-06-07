import { createEmptyReport } from "bus-lib";
import type { Argv, CommandModule } from "yargs";

export interface AnalyzeArgs {
  agent?: boolean;
  format?: "human" | "json";
}

export type OutputWriter = (text: string) => void;

export const runAnalyze = (
  args: AnalyzeArgs,
  writeOutput: OutputWriter = console.log,
): void => {
  if (args.agent || args.format === "json") {
    writeOutput(JSON.stringify(createEmptyReport(), null, 2));
    return;
  }

  writeOutput(
    "Busfactor2 smoke analyze command. Pass --agent for deterministic JSON output.",
  );
};

export const createAnalyzeCommand = (
  writeOutput?: OutputWriter,
): CommandModule<object, AnalyzeArgs> => ({
  command: "analyze",
  describe: "Analyze git log input and produce a Busfactor2 report.",
  builder: (yargs: Argv<object>) =>
    yargs
      .option("agent", {
        type: "boolean",
        description: "Emit deterministic agent-readable JSON.",
        default: false,
      })
      .option("format", {
        choices: ["human", "json"] as const,
        description: "Output format for the smoke report.",
        default: "human" as const,
      }),
  handler: (args) => {
    runAnalyze(args, writeOutput);
  },
});
