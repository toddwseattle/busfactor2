import { readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import type { BusfactorReportSource } from "bus-lib";
import { runGitLog, type GitLogRunner } from "./git.js";

export interface ResolveInputOptions {
  input?: string;
  stdin?: boolean;
  repo?: string;
  path?: string;
  ref: string;
}

export interface ResolvedGitLogInput {
  text: string;
  source: BusfactorReportSource;
}

export interface InputLoaderDependencies {
  readFileText?: (path: string) => Promise<string>;
  readStdinText?: () => Promise<string>;
  runGitLog?: GitLogRunner;
}

const defaultReadFileText = async (path: string): Promise<string> => {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    const originalCwd = process.env["INIT_CWD"];
    if (
      !isAbsolute(path) &&
      originalCwd !== undefined &&
      originalCwd !== process.cwd()
    ) {
      return readFile(join(originalCwd, path), "utf8");
    }
    throw error;
  }
};

export const readStdinText = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    let text = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      text += chunk;
    });
    process.stdin.on("end", () => resolve(text));
    process.stdin.on("error", reject);
  });

const ensureNonEmpty = (text: string, sourceLabel: string): string => {
  if (text.trim().length === 0) {
    throw new Error(`No git log input found from ${sourceLabel}.`);
  }
  return text;
};

export const resolveGitLogInput = async (
  options: ResolveInputOptions,
  dependencies: InputLoaderDependencies = {},
): Promise<ResolvedGitLogInput> => {
  const readFileText = dependencies.readFileText ?? defaultReadFileText;
  const readStdin = dependencies.readStdinText ?? readStdinText;
  const gitLog = dependencies.runGitLog ?? runGitLog;

  if (options.input !== undefined) {
    return {
      text: ensureNonEmpty(await readFileText(options.input), options.input),
      source: {
        mode: "git-log",
        inputPath: options.input,
        label: options.input,
      },
    };
  }

  if (options.stdin === true) {
    return {
      text: ensureNonEmpty(await readStdin(), "stdin"),
      source: { mode: "git-log", stdin: true, label: "stdin" },
    };
  }

  const repoPath = options.path ?? options.repo ?? ".";
  return {
    text: ensureNonEmpty(
      await gitLog({ repoPath, ref: options.ref }),
      `${repoPath} at ${options.ref}`,
    ),
    source: {
      mode: "git-log",
      repoPath,
      ref: options.ref,
      label: `${repoPath} (${options.ref})`,
    },
  };
};
