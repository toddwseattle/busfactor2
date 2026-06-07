# Smoke Package Contracts

Milestone 0 smoke packages prove the workspace, TypeScript, Vitest, and package
dependencies work before real migration starts.

The smoke implementations should be intentionally small but shaped like the
final architecture.

## Root Workspace Contract

Root scripts:

```json
{
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "typecheck": "npm run typecheck --workspaces",
    "dev:web": "npm --workspace bus-web run dev",
    "dev:cli": "npm --workspace bus-cli run dev",
    "prepare": "husky",
    "lint-staged": "lint-staged",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "precommit": "lint-staged",
    "prepush": "npm run typecheck --workspaces && npm run test --workspaces"
  },
  "workspaces": ["packages/*"]
}
```

Root dev dependencies should include Husky, lint-staged, Prettier, TypeScript,
and Vitest setup dependencies required by the packages.

## bus-lib Smoke Contract

Purpose:

- prove TypeScript library builds
- prove Vitest runs
- provide one public export for CLI and web smoke consumers

Suggested exports:

```ts
export const REPORT_SCHEMA_VERSION = "busfactor.report.v1";

export const DEFAULT_SECTION_IDS = [
  "overall",
  "ts-js-css",
  "python",
  "markdown",
] as const;

export const createEmptyReport = (): BusfactorReport => ({
  schemaVersion: REPORT_SCHEMA_VERSION,
  generatedAt: "1970-01-01T00:00:00.000Z",
  source: { mode: "git-log" },
  options: {
    activeThreshold: 0.05,
    halfLifeDays: 7,
    riskContributorCount: 3,
  },
  authors: [],
  weeks: [],
  commitStats: [],
  sections: [],
  summary: {
    totalFiles: 0,
    riskFiles: 0,
  },
});
```

The exact shape can change when real report types are implemented, but smoke
consumers should import only from `bus-lib`.

## bus-cli Smoke Contract

Purpose:

- prove yargs command construction works
- prove CLI can import `bus-lib`
- expose the future command shape

Required smoke behavior:

```bash
busfactor --help
busfactor analyze --help
busfactor analyze --agent
```

`busfactor analyze --agent` can print the empty smoke report until real analysis
exists.

## bus-web Smoke Contract

Purpose:

- prove React + Vite builds
- prove React Testing Library is wired
- prove web can import `bus-lib`

Required smoke UI:

- app title
- labelled file input placeholder
- visible section labels:
  - Overall
  - TS/JS/CSS
  - Python
  - Markdown
- a small report schema/version indicator imported from `bus-lib`

## Verification

```bash
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- analyze --agent
npm --workspace bus-web run build
npm run lint-staged
```
