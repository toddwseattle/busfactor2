import { analyzeGitLog } from "bus-lib";
import type { Argv, CommandModule } from "yargs";
import {
  resolveGitLogInput,
  type InputLoaderDependencies,
} from "../input/load.js";
import { formatHumanReport } from "../formatters/human.js";
import { formatJsonReport } from "../formatters/json.js";

export interface AnalyzeArgs {
  path?: string;
  input?: string;
  stdin?: boolean;
  repo?: string;
  ref: string;
  agent?: boolean;
  format?: "human" | "json";
  color?: boolean;
}

export type OutputWriter = (text: string) => void;

export interface RunAnalyzeOptions {
  loaders?: InputLoaderDependencies;
}

export const runAnalyze = async (
  args: AnalyzeArgs,
  writeOutput: OutputWriter = console.log,
  options: RunAnalyzeOptions = {},
): Promise<void> => {
  const input = await resolveGitLogInput(args, options.loaders);
  const report = analyzeGitLog(input.text, { source: input.source });

  if (args.agent || args.format === "json") {
    writeOutput(formatJsonReport(report));
    return;
  }

  writeOutput(formatHumanReport(report));
};

export const createAnalyzeCommand = (
  writeOutput?: OutputWriter,
  options: RunAnalyzeOptions = {},
): CommandModule<object, AnalyzeArgs> => ({
  command: "analyze [path]",
  describe: "Analyze git log input and produce a Busfactor2 report.",
  builder: (yargs: Argv<object>) =>
    yargs
      .positional("path", {
        type: "string",
        description: "Local repository path to analyze.",
      })
      .option("input", {
        type: "string",
        description: "Read prepared git log text from a file.",
      })
      .option("stdin", {
        type: "boolean",
        description: "Read prepared git log text from stdin.",
        default: false,
      })
      .option("repo", {
        type: "string",
        description: "Local repository path to analyze when no path is passed.",
        default: ".",
      })
      .option("ref", {
        type: "string",
        description: "Git ref to pass to git log.",
        default: "main",
      })
      .option("agent", {
        type: "boolean",
        description: "Emit deterministic agent-readable JSON with no prose.",
        default: false,
      })
      .option("format", {
        choices: ["human", "json"] as const,
        description: "Output format.",
        default: "human" as const,
      })
      .option("color", {
        type: "boolean",
        description:
          "Enable color in human output; pass --no-color to disable.",
        default: true,
      }),
  handler: async (args) => {
    await runAnalyze(args, writeOutput, options);
  },
});
