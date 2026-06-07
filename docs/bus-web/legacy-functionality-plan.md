# Bus Web Legacy Functionality Plan

This plan tracks the first real `bus-web` implementation slice after the smoke
UI. The goal is to preserve the legacy browser app workflow with React while
keeping analysis logic in `bus-lib`.

## Goal

Replace the current smoke UI in `packages/bus-web` with raw, accessible
functionality equivalent to the legacy app:

1. User uploads a prepared `git log --no-merges --name-status main` text file.
2. The app reads the file with browser file APIs.
3. The app calls `analyzeGitLog` from `bus-lib`.
4. The app renders weekly commit counts by author.
5. The app renders bus factor file tables for the report sections returned by
   `bus-lib`.

Do not add real visual styling in this slice. Use semantic HTML, clear labels,
and enough class names or structural hooks to support later design work.

## Legacy Behavior To Preserve

The legacy Vue app in `legacy/criesbeck-browser-app` provides these behaviors:

- Upload panel defaults open before data exists and can be toggled.
- Upload instructions show the expected git log command.
- File input reads the uploaded text as UTF-8 text.
- Weekly commit table appears only when authors exist.
- Weekly commit rows show author name, total commits, and one count per week.
- Bus factor table appears only when tracked files exist.
- File rows are sorted by decayed file activity.
- Files with fewer than 3 active contributors are risk rows.
- Contributor cells show percent contribution, edit count, and last edit date.
- Contributors below the active threshold are low-contribution cells.

`bus-web` should preserve the behavior, not the Vue component structure or
Bootstrap styling.

## Current Constraints

- `bus-web` must not run git commands in the browser.
- `bus-web` must not duplicate parsing, filtering, scoring, or category rules.
- `bus-lib` currently emits legacy-compatible file data for `overall` and
  `ts-js-css`; `python` and `markdown` sections exist but are empty until
  category expansion lands in `bus-lib`.
- `bus-web` should render all report sections generically so category expansion
  does not require a UI rewrite.

## Proposed Source Layout

```text
packages/bus-web/src/
  App.tsx
  components/
    UploadPanel.tsx
    ReportSummary.tsx
    CommitStatsTable.tsx
    ReportSections.tsx
    BusFactorSection.tsx
  lib/
    file-upload.ts
    format.ts
```

Component responsibilities:

- `App`: owns upload/report/error state and calls `analyzeGitLog`.
- `UploadPanel`: renders instructions, toggle, file input, and upload status.
- `ReportSummary`: renders author, week, total file, and risk file counts.
- `CommitStatsTable`: renders `report.commitStats` and `report.weeks`.
- `ReportSections`: renders accessible section controls or headings for each
  `report.sections` entry.
- `BusFactorSection`: renders one section table from
  `BusfactorReportSection.files`.
- `file-upload.ts`: wraps browser `File.text()` with validation-friendly errors.
- `format.ts`: contains UI-only formatting for dates, percentages, and empty
  values.

## Implementation Steps

### 1. Upload State

- Replace smoke upload markup with a labelled file input.
- Accept `.txt`, `.log`, and generic text files, but do not reject by extension.
- On change, clear the prior error and report.
- Read the selected file with browser file APIs.
- Show a loading/pending message while reading and analyzing.
- Treat a missing file or empty file as an error.
- Pass file name into the `source.label` option when calling `analyzeGitLog`.

### 2. Report Rendering

- Render nothing beyond upload guidance before a report exists.
- Render `ReportSummary` once a report exists.
- Render `CommitStatsTable` when `report.commitStats.length > 0`.
- Render all `report.sections` in report order.
- Use section labels from `bus-lib`, not hard-coded display strings.
- Keep `overall`, `ts-js-css`, `python`, and `markdown` visible even when a
  section is empty.
- Show a plain empty message for empty sections.

### 3. Bus Factor Table

- Columns:
  - file path
  - total edits
  - active contributors
  - risk
  - one contribution column per report author
- In each author cell, render contribution percent, edit count, active status,
  and last edit date.
- Use the report fields directly:
  - `file.totalEdits`
  - `file.activeContributorCount`
  - `file.isRisk`
  - `contributor.contributionPercent`
  - `contributor.editCount`
  - `contributor.isActive`
  - `contributor.lastEditedAt`
- Add structural class names such as `is-risk` and `is-low-contribution`, but
  do not define real styling for them yet.

### 4. Accessibility

- Keep one visible `h1`.
- Associate upload input with a real label.
- Use `aria-live="polite"` for upload status and errors.
- Use real tables for commit stats and file ownership.
- Use table captions or section headings that identify each report table.
- If tabs are added in this slice, implement proper tab roles and keyboard
  behavior. Otherwise, prefer simpler section headings and render all sections.

### 5. Tests

Add React Testing Library coverage for:

- initial upload guidance and labelled file input
- successful upload using `packages/bus-lib/test/fixtures/legacy-git-log.txt`
- summary counts after analysis
- weekly commit table values
- `overall` and `ts-js-css` bus factor rows from the fixture
- empty `python` and `markdown` section messages
- empty upload error
- malformed or non-git-log text producing an empty deterministic report or an
  error, depending on the final `bus-lib` behavior

Prefer accessible queries such as `getByRole`, `getByLabelText`, and visible
text. Avoid test IDs unless a table assertion cannot be expressed cleanly.

## Acceptance Criteria

- `packages/bus-web` no longer shows smoke-only report placeholders.
- Uploading a legacy git log file renders weekly commit counts and bus factor
  tables.
- Report rendering consumes `BusfactorReport` from `bus-lib`.
- No parser, file classifier, scoring, or category rules are duplicated in
  `bus-web`.
- Empty, loading, and error states are covered.
- `overall`, `ts-js-css`, `python`, and `markdown` sections are represented.
- The UI is intentionally unstyled beyond default browser rendering.

## Verification

Run these commands from the repository root:

```bash
npm --workspace bus-web run test
npm --workspace bus-web run typecheck
npm --workspace bus-web run build
```

If shared report data changes are needed, also run the relevant `bus-lib`
checks before merging.
