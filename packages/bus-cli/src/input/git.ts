import { execFile } from "node:child_process";

export interface GitLogRequest {
  repoPath: string;
  ref: string;
}

export type GitLogRunner = (request: GitLogRequest) => Promise<string>;

export const buildGitLogArgs = (request: GitLogRequest): string[] => [
  "-C",
  request.repoPath,
  "log",
  "--no-merges",
  "--name-status",
  request.ref,
];

export const runGitLog: GitLogRunner = async (request) =>
  new Promise((resolve, reject) => {
    execFile(
      "git",
      buildGitLogArgs(request),
      { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(
            new Error(
              `Failed to run git log for ${request.repoPath} at ${request.ref}: ${
                stderr.trim() || error.message
              }`,
            ),
          );
          return;
        }
        resolve(stdout);
      },
    );
  });
