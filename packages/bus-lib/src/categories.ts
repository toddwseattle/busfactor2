import type { FileCategoryDefinition } from "./types.js";

export interface ClassifiedFilePath {
  category: FileCategoryDefinition;
  path: string;
}

export const DEFAULT_TRACKED_STATUSES = ["A", "C", "M"] as const;

export const DEFAULT_IGNORED_PATH_SEGMENTS = [
  "node_modules",
  "build",
  "dist",
] as const;

export const DEFAULT_FILE_CATEGORIES = [
  {
    id: "ts-js-css",
    label: "TS/JS/CSS",
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
    includeInOverall: true,
  },
  {
    id: "python",
    label: "Python",
    extensions: [".py", ".pyi"],
    includeInOverall: true,
  },
  {
    id: "markdown",
    label: "Markdown",
    extensions: [".md", ".mdx", ".markdown"],
    includeInOverall: true,
  },
] as const satisfies readonly FileCategoryDefinition[];

export const normalizePathForClassification = (path: string): string =>
  path.replaceAll("\\", "/");

export const isTrackedStatus = (
  status: string,
  trackedStatuses: readonly string[] = DEFAULT_TRACKED_STATUSES,
): boolean => trackedStatuses.includes(status);

export const isIgnoredPath = (
  path: string,
  ignoredSegments: readonly string[] = DEFAULT_IGNORED_PATH_SEGMENTS,
): boolean => {
  const segments = normalizePathForClassification(path).split("/");
  return segments.some((segment) => ignoredSegments.includes(segment));
};

const normalizeExtension = (extension: string): string =>
  extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;

export const categoryMatchesPath = (
  category: FileCategoryDefinition,
  path: string,
): boolean => {
  const normalizedPath = normalizePathForClassification(path).toLowerCase();
  return category.extensions
    .map(normalizeExtension)
    .some((extension) => normalizedPath.endsWith(extension));
};

export const classifyFilePath = (
  path: string,
  categories: readonly FileCategoryDefinition[] = DEFAULT_FILE_CATEGORIES,
): ClassifiedFilePath | null => {
  const normalizedPath = normalizePathForClassification(path);
  if (isIgnoredPath(normalizedPath)) {
    return null;
  }

  const category = categories.find((entry) =>
    categoryMatchesPath(entry, normalizedPath),
  );

  return category === undefined ? null : { category, path: normalizedPath };
};

export const classifyFileChange = (
  status: string,
  path: string,
  categories: readonly FileCategoryDefinition[] = DEFAULT_FILE_CATEGORIES,
): ClassifiedFilePath | null =>
  isTrackedStatus(status) ? classifyFilePath(path, categories) : null;
