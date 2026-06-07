#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createAnalyzeCommand, type OutputWriter } from "./commands/analyze.js";

export const buildCli = (
  args: readonly string[] = hideBin(process.argv),
  writeOutput?: OutputWriter,
) =>
  yargs(args)
    .scriptName("busfactor")
    .usage("$0 <command> [options]")
    .command(createAnalyzeCommand(writeOutput))
    .demandCommand(1, "Choose a command to run.")
    .strict()
    .help()
    .alias("help", "h")
    .exitProcess(false)
    .version(false);

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === new URL(process.argv[1], "file:").href;

if (isDirectRun) {
  await buildCli().parseAsync();
}
