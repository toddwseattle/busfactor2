# Bus Web Work Items

These work items track the React + Vite web package.

## Milestone 0

### WEB-M0-1 — Create smoke React package

**Files:** `packages/bus-web/*`

**Goal:** Establish a React package that builds, tests, and imports `bus-lib`.

**Required change:**

- Add Vite React package files.
- Add `tsconfig.json` and `vitest.config.ts`.
- Add `src/App.tsx` and `src/main.tsx`.
- Render smoke UI with section labels.
- Import one public `bus-lib` export.
- Add React Testing Library smoke tests.

**Acceptance:**

- `npm --workspace bus-web run build` succeeds.
- `npm --workspace bus-web run test` succeeds.
- `npm --workspace bus-web run typecheck` succeeds.

### WEB-M0-2 — Add design template

**Files:** `docs/bus-web/web-design-template.md`

**Goal:** Provide a Busfactor2-specific starting point for future web design
documentation without copying another project's `DESIGN.md`.

**Acceptance:**

- Template includes workflow, information hierarchy, components, states,
  accessibility, and acceptance sections.

## Milestone 1

Implementation plan: `docs/bus-web/legacy-functionality-plan.md`

### WEB-M1-1 — Rebuild upload flow

**Status:** Implemented in `packages/bus-web/src/App.tsx` and
`packages/bus-web/src/components/UploadPanel.tsx`.

**Goal:** Replace smoke UI with a real upload flow using `bus-lib`.

**Acceptance:**

- Uploaded legacy git log text creates a report.
- Empty and malformed files show clear errors.

### WEB-M1-2 — Render report sections

**Status:** Implemented with raw semantic tables in
`packages/bus-web/src/components`.

**Goal:** Show weekly commits and bus factor sections.

**Acceptance:**

- Overall, TS/JS/CSS, Python, and Markdown sections are available as tabs or
  collapsible panels.
- Tables use accessible headings and controls.
