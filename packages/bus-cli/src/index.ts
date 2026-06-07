#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  createAnalyzeCommand,
  type OutputWriter,
  type RunAnalyzeOptions,
} from "./commands/analyze.js";

export const CLI_VERSION = "0.0.0";

export const buildCli = (
  args: readonly string[] = hideBin(process.argv),
  writeOutput?: OutputWriter,
  options: RunAnalyzeOptions = {},
) =>
  yargs(args)
    .scriptName("busfactor")
    .usage("$0 <command> [options]")
    .command(createAnalyzeCommand(writeOutput, options))
    .demandCommand(1, "Choose a command to run.")
    .strict()
    .help()
    .alias("help", "h")
    .exitProcess(false)
    .version(CLI_VERSION);

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === new URL(process.argv[1], "file:").href;

if (isDirectRun) {
  try {
    await buildCli().parseAsync();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
