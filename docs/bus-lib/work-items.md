# Bus Lib Work Items

These work items track the shared library. Items are grouped by milestone.

## Milestone 0

Status: complete.

### BL-M0-1 — Create smoke package

**Files:** `packages/bus-lib/*`

**Goal:** Establish a buildable, testable package before migrating real logic.

**Required change:**

- Add `package.json`, `tsconfig.json`, and `vitest.config.ts`.
- Add `src/index.ts`.
- Export a minimal deterministic smoke function, for example
  `createEmptyReport`.
- Add a Vitest smoke test.

**Acceptance:**

- `npm --workspace bus-lib run build` succeeds.
- `npm --workspace bus-lib run test` succeeds.
- `npm --workspace bus-lib run typecheck` succeeds.

### BL-M0-2 — Define initial public report types

**Files:** `packages/bus-lib/src/types.ts`, `packages/bus-lib/src/index.ts`

**Goal:** Give CLI and web smoke packages a stable type to consume.

**Required change:**

- Define `BusfactorReport`, `SectionReport`, `FileContributionReport`,
  `AuthorCommitStats`, and options types.
- Include `schemaVersion: "busfactor.report.v1"`.
- Include section IDs for `overall`, `ts-js-css`, `python`, and `markdown`.

**Acceptance:**

- CLI and web packages can import the types without reaching into internal
  source files.

## Milestone 1

Milestone 1 gets the CLI working with the old browser app functionality by
moving the legacy analyzer behavior into `bus-lib`. Keep this milestone focused
on compatibility with `legacy/criesbeck-browser-app/app.js`; category expansion
can follow once the old behavior is covered by tests.

Status: BL-M1-0 through BL-M1-4 are implemented. BL-M1-4 adds pluggable default
source categories and Markdown scanning while preserving the `analyzeGitLog`
interface consumed by the CLI.

### BL-M1-0 — Add legacy git log fixtures

Status: implemented.

**Files:** `packages/bus-lib/test/fixtures/*`,
`packages/bus-lib/src/*.test.ts`

**Goal:** Create deterministic fixtures for the old browser app behavior before
porting implementation code.

**Required change:**

- Add at least one fixture shaped like
  `git log --no-merges --name-status main` output.
- Cover multiple authors, multiple weeks, active files, ignored paths, and a
  delete-only change.
- Include files matching the legacy tracked extensions:
  `.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.html`, `.htm`, and `.yml`.
- Add expected report assertions for authors, week buckets, tracked files,
  ignored files, active contributor counts, and risk flags.

**Acceptance:**

- Fixture tests clearly document the expected old-app behavior and are used to
  drive the parser/analyzer implementation.
- Fixtures avoid live git calls and locale-dependent output.

### BL-M1-1 — Port legacy parser into pure TypeScript

Status: implemented.

**Legacy source:** `legacy/criesbeck-browser-app/app.js`

**Goal:** Move parser and scoring logic into `bus-lib` without changing behavior.

**Required change:**

- Add parser functions for the legacy `Author:`, `Date:`, and name-status file
  lines.
- Keep core functions pure and runtime-neutral.
- Preserve the legacy edit status behavior for Add, Change, and Modify lines.
- Preserve legacy ignore behavior for `node_modules`, `build`, and `dist`.
- Return ISO strings or timestamps internally; keep localized labels out of core
  report data.

**Acceptance:**

- Fixture tests prove current author, week, file, frequency weighted by recency,
  and risk behavior.

### BL-M1-2 — Port legacy weekly commit and weighted frequency scoring

Status: implemented.

**Legacy source:** `legacy/criesbeck-browser-app/app.js`

**Goal:** Preserve the old weekly commit and bus factor calculations in typed
library code. The legacy source calls the weighted file activity value
`frecency`; Busfactor2 docs describe it as frequency weighted by recency.

**Required change:**

- Preserve the 7-day half-life decay model.
- Preserve the 5 percent active contributor threshold.
- Preserve the risk threshold of fewer than 3 active contributors.
- Compute per-author commit counts by week.
- Compute per-file edit counts, last edit date, weighted frequency,
  contribution percentages, active contributor counts, and risk flags.
- Sort files by total decayed activity descending, matching the old UI intent.

**Acceptance:**

- Fixture tests assert weekly commit counts and bus factor scoring.
- No CLI, React, browser, filesystem, or process APIs are imported by core
  modules.

### BL-M1-3 — Expose `analyzeGitLog` report API for CLI parity

Status: implemented.

**Files:** `packages/bus-lib/src/index.ts`, `packages/bus-lib/src/types.ts`

**Goal:** Replace the smoke-only empty report path with a real report object that
the CLI can format.

**Required change:**

- Export `analyzeGitLog(text, options?)`.
- Keep `createEmptyReport` for smoke/UI empty states.
- Extend report types as needed for weekly commits and file contribution rows.
- Include a compatibility section for the old tracked source set, mapped to
  `ts-js-css` where possible and documented where legacy HTML/YAML behavior is
  still compatibility-only.
- Keep stable sort order and deterministic JSON.

**Acceptance:**

- `npm --workspace bus-lib run build` succeeds.
- `npm --workspace bus-lib run test` succeeds.
- `npm --workspace bus-lib run typecheck` succeeds.
- CLI can import only from the `bus-lib` package root.

### BL-M1-4 — Add source categories and overall rollup

Status: implemented.

**Goal:** Support `ts-js-css`, `python`, `markdown`, and derived `overall` after
old-app parity is tested.

**Acceptance:**

- One fixture produces all four section reports.
- `overall` totals equal the selected source category totals.

## Notes

When adding any public function, follow
`docs/bus-lib/new-function-agent-guide.md`.
