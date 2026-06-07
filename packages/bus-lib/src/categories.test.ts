import { describe, expect, it } from "vitest";
import {
  classifyFileChange,
  classifyFilePath,
  isIgnoredPath,
  normalizePathForClassification,
} from "./categories.js";
import type { FileCategoryDefinition } from "./types.js";

describe("file category classification", () => {
  it("classifies default source categories by extension", () => {
    expect(classifyFilePath("src/app.ts")?.category.id).toBe("ts-js-css");
    expect(classifyFilePath("scripts/tool.py")?.category.id).toBe("python");
    expect(classifyFilePath("docs/readme.md")?.category.id).toBe("markdown");
    expect(classifyFilePath("docs/guide.mdx")?.category.id).toBe("markdown");
    expect(classifyFilePath("docs/reference.markdown")?.category.id).toBe(
      "markdown",
    );
  });

  it("normalizes paths and matches extensions case-insensitively", () => {
    expect(normalizePathForClassification("docs\\README.MD")).toBe(
      "docs/README.MD",
    );
    expect(classifyFilePath("docs\\README.MD")).toMatchObject({
      path: "docs/README.MD",
      category: { id: "markdown" },
    });
  });

  it("ignores configured path segments for every category", () => {
    expect(isIgnoredPath("node_modules/pkg/readme.md")).toBe(true);
    expect(classifyFilePath("node_modules/pkg/readme.md")).toBeNull();
    expect(classifyFilePath("build/generated/app.ts")).toBeNull();
    expect(classifyFilePath("dist/docs/guide.mdx")).toBeNull();
  });

  it("requires a tracked name-status code for file changes", () => {
    expect(classifyFileChange("M", "docs/readme.md")?.category.id).toBe(
      "markdown",
    );
    expect(classifyFileChange("D", "docs/readme.md")).toBeNull();
    expect(classifyFileChange("R", "docs/readme.md")).toBeNull();
  });

  it("uses category order as the deterministic conflict tie-breaker", () => {
    const categories: FileCategoryDefinition[] = [
      {
        id: "first",
        label: "First",
        extensions: [".md"],
      },
      {
        id: "second",
        label: "Second",
        extensions: [".md"],
      },
    ];

    expect(classifyFilePath("docs/readme.md", categories)?.category.id).toBe(
      "first",
    );
  });
});
