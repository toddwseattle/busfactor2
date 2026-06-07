import type { GitFileChange, GitLogCommit } from "./types.js";

const AUTHOR_PATTERN = /^Author:\s+(.+)\s+</;
const DATE_PATTERN = /^Date:\s+(.+)$/;
const NAME_STATUS_PATTERN = /^([A-Z])\s+(.+)$/;

export const parseGitLog = (text: string): GitLogCommit[] => {
  const commits: GitLogCommit[] = [];
  let author: string | null = null;
  let dateText: string | null = null;
  let timestamp: number | null = null;
  let changedFiles: GitFileChange[] = [];

  const finishCommit = (): void => {
    if (author !== null && dateText !== null && timestamp !== null) {
      commits.push({
        author,
        dateText,
        timestamp,
        changedFiles,
      });
    }
  };

  for (const line of text.split(/\r?\n/)) {
    const authorMatch = AUTHOR_PATTERN.exec(line);
    if (authorMatch?.[1] !== undefined) {
      finishCommit();
      author = authorMatch[1];
      dateText = null;
      timestamp = null;
      changedFiles = [];
      continue;
    }

    const dateMatch = DATE_PATTERN.exec(line);
    if (dateMatch?.[1] !== undefined) {
      const parsedTimestamp = Date.parse(dateMatch[1]);
      if (Number.isFinite(parsedTimestamp)) {
        dateText = dateMatch[1];
        timestamp = parsedTimestamp;
      }
      continue;
    }

    const changeMatch = NAME_STATUS_PATTERN.exec(line);
    if (changeMatch?.[1] !== undefined && changeMatch[2] !== undefined) {
      changedFiles.push({
        status: changeMatch[1],
        path: changeMatch[2],
      });
    }
  }

  finishCommit();

  return commits;
};
