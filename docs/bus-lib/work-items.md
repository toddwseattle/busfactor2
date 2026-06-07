# Bus Lib Work Items

These work items track the shared library. Items are grouped by milestone.

## Milestone 0

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

### BL-M1-1 — Port legacy parser into pure TypeScript

**Legacy source:** `legacy/criesbeck-browser-app/app.js`

**Goal:** Move parser and scoring logic into `bus-lib` without changing behavior.

**Acceptance:**

- Fixture tests prove current author, week, file, frecency, and risk behavior.

### BL-M1-2 — Add source categories and overall rollup

**Goal:** Support `ts-js-css`, `python`, `markdown`, and derived `overall`.

**Acceptance:**

- One fixture produces all four section reports.
- `overall` totals equal the selected source category totals.

## Notes

When adding any public function, follow
`docs/bus-lib/new-function-agent-guide.md`.
