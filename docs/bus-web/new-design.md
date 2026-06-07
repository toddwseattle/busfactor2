# Bus Web New Design Plan

Status: proposed implementation plan

This plan translates the Stitch prototype in `docs/bus-web/stitch-ui/` into
Busfactor2-specific React work. The prototype is useful visual source material,
but it should not be copied directly into `packages/bus-web`.

## Source Material

- `docs/bus-web/stitch-ui/DESIGN.md`: generated visual direction and tokens.
- `docs/bus-web/stitch-ui/component-description.md`: generated component
  breakdown.
- `docs/bus-web/stitch-ui/code.html`: generated static HTML reference.
- `docs/bus-web/stitch-ui/screen.png`: rendered prototype screenshot.
- `docs/bus-web/web-design-template.md`: required Busfactor2 design doc
  starting point.
- `docs/bus-web/README.md`: current web app responsibilities and source
  layout.
- `.github/agents/bus-web-react.md`: React implementation guidance for agents.
- Tailwind CSS Vite installation docs
  (`https://tailwindcss.com/docs/installation/using-vite`): reference for the
  current `tailwindcss` plus `@tailwindcss/vite` setup.

## Design Direction Summary

The prototype proposes a dense analytical dashboard with an "Academic
Precision" visual treatment. The implementation should use generic Busfactor2
branding that follows Northwestern-inspired visual cues; it should not call the
app "Northwestern Engineering" or present the tool as an official Northwestern
property.

- restrained off-white surfaces and low-contrast outlines
- Northwestern-inspired purple as the primary brand color
- orange status treatment for high-risk files
- compact, data-forward tables
- summary metric cards above the report
- weekly commit activity grid
- language/report-section accordions
- file-level contributor tables with risk labels
- footer text: `(c) Todd Warren and Chris Riesbeck 2026`

The direction fits the app better than the current smoke UI, but the
implementation needs to be validated against the actual report schema and the
existing React package before component names or data views are treated as
final.

## Current Repo Reality

`packages/bus-web` currently contains only a smoke React app:

- `src/App.tsx` renders the title, file input, report section labels, and schema
  footer.
- There are no app components under `src/components` yet.
- There is no Tailwind, icon, chart, or design token dependency yet.
- The app imports public values from `bus-lib`, but does not yet analyze
  uploaded git logs.

`bus-lib` already exposes the data needed for the first-pass design:

- `summary.authorCount`, `summary.totalFiles`, `summary.riskFiles`,
  `summary.weekCount`
- `authors`, `weeks`, and `commitStats` for the weekly commits table
- `sections` for `overall`, `ts-js-css`, `python`, and `markdown`
- per-file `totalEdits`, `contributors`, `contributionPercent`,
  `activeContributorCount`, and `isRisk`

Prototype adjustments to make in the first pass:

- The prototype chart says "LOC". The first implementation should relabel and
  render it as file distribution by report section using `section.totalFiles`.
  Do not request new library data for this chart in the first pass.
- The first pass should only show `High Risk` from `FileContributionReport.isRisk`.
  Do not add a presentation-only "Low Familiarity" rule.
- The prototype uses static sample data and inline browser behavior. The React
  implementation must derive all report values from `bus-lib`.
- The prototype uses Tailwind CDN, Google Fonts, and Material Symbols. The Vite
  app should use a repo-installed Tailwind setup, not CDN scripts, and should
  avoid remote font or icon dependencies for core UI.

## Component Validation Matrix

| Prototype component     | Repo-aligned component                               | Validation needed                                                                                               |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Layout`                | `AppShell` or keep in `App` until more screens exist | Only extract once header/main/footer structure has enough reuse.                                                |
| `TopNavBar`             | `AppHeader`                                          | Header upload action should scroll/focus the upload panel, not open a modal.                                    |
| `DashboardOverview`     | `ReportSummary`                                      | Backed by `BusfactorReport.summary`; hide or show empty state before upload.                                    |
| `StatCard`              | `SummaryMetricCard`                                  | Safe to implement as a small presentational component.                                                          |
| `LanguagePieChart`      | `SectionDistributionChart`                           | First pass shows file distribution by report section from `section.totalFiles`; do not use or request LOC data. |
| `WeeklyCommitsSection`  | `CommitStatsSection`                                 | Backed by `BusfactorReport.commitStats` and `weeks`.                                                            |
| `ActivityHeatmap`       | `CommitStatsTable`                                   | Existing docs already name `CommitStatsTable`; keep semantic table markup.                                      |
| `ActivityCell`          | local helper/component inside `CommitStatsTable`     | Intensity can be derived from max weekly count; labels must expose author, week, and count.                     |
| `BusFactorAnalysis`     | `ReportSections`                                     | Should render the existing default sections, not arbitrary language names.                                      |
| `LanguageAccordion`     | `ReportAccordion`                                    | Use sections `overall`, `ts-js-css`, `python`, `markdown`; labels come from `bus-lib`.                          |
| `LanguageSummaryHeader` | `ReportSectionSummary`                               | `totalEdits` and file share can be derived from section files.                                                  |
| `FileAnalysisTable`     | `BusFactorSection` or `FileContributionTable`        | Existing docs name `BusFactorSection`; split table only if the component grows.                                 |
| `FileRow`               | local row component inside table                     | Keep risk label, file path, edits, and contributor cells accessible.                                            |
| `StatusBadge`           | `StatusBadge`                                        | First pass only renders `High Risk` from `isRisk`.                                                              |
| `Button`                | `Button` only if repeated                            | Avoid a shared component until multiple button variants exist.                                                  |
| `Icon`                  | defer                                                | Choose a local icon strategy before introducing an icon dependency.                                             |
| `DesignTokens`          | Tailwind theme tokens plus minimal CSS variables     | Install Tailwind through Vite; do not use the generated CDN config.                                             |

## Recommended Source Layout

Start with a small set of focused files and let the component tree grow only
when implementation pressure justifies it:

```text
packages/bus-web/src/
  App.tsx
  App.test.tsx
  styles.css
  components/
    AppHeader.tsx
    UploadPanel.tsx
    ReportSummary.tsx
    SectionDistributionChart.tsx
    CommitStatsTable.tsx
    ReportAccordion.tsx
    BusFactorSection.tsx
    StatusBadge.tsx
    EmptyState.tsx
    ErrorState.tsx
```

Potential later additions:

- `components/SummaryMetricCard.tsx` if summary cards are reused or tested
  separately.
- `styles/tokens.css` if Tailwind theme values need companion custom CSS.

## Step-by-Step Implementation Plan

### Recommended First Implementation Slice

First slice: build the design foundation and the top report summary path.

Scope:

- Install and wire Tailwind through Vite using `tailwindcss` and
  `@tailwindcss/vite`.
- Add the generic Busfactor2 app shell with Northwestern-inspired brand tokens.
- Add the footer text `(c) Todd Warren and Chris Riesbeck 2026`.
- Replace the smoke upload area with an inline `UploadPanel`.
- Read an uploaded git log file and call `analyzeGitLog`.
- Render empty, loading, success, and error states.
- Render `ReportSummary` metric cards from `BusfactorReport.summary`.
- Render `SectionDistributionChart` as file distribution from
  `BusfactorReport.sections[*].totalFiles`.
- Keep existing report section labels visible as lightweight placeholders if
  needed, but do not implement the full accordion/table views yet.

Out of scope for this slice:

- Weekly commit heatmap/table.
- Full report-section accordion behavior.
- File-level contributor tables.
- Low Familiarity status.
- Upload modal.
- New `bus-lib` report data.

Acceptance:

- `npm --workspace bus-web run test` passes.
- `npm --workspace bus-web run typecheck` passes.
- `npm --workspace bus-web run build` passes.
- Initial render shows the branded shell, inline upload panel, and footer.
- Uploading a valid git log fixture shows summary cards and a file-distribution
  chart labelled as files or tracked files.
- Empty or malformed upload content shows an accessible error state.
- The implementation uses Tailwind through Vite, not CDN scripts.
- The slice establishes enough styling and data flow for the later weekly
  commits and file-level analysis tables to land incrementally.

### 1. Curate the Design Doc

- Keep the raw Stitch export in `docs/bus-web/stitch-ui/` as prototype
  provenance.
- Promote the Busfactor2-specific decisions into a canonical web design doc
  based on `docs/bus-web/web-design-template.md`.
- Use `docs/bus-web/new-design.md` as the implementation plan while the design
  is still being validated.
- After validation, create or rename the canonical design reference to
  `docs/bus-web/design.md`.

Acceptance:

- Agents can distinguish prototype artifacts from Busfactor2 source-of-truth
  docs.
- The canonical design doc does not contain generated static HTML or CDN setup.

### 2. Define Data Mapping Before UI Work

- Map each visible metric to `BusfactorReport`.
- Confirm summary cards:
  - Total Authors: `summary.authorCount`
  - Tracked Files: `summary.totalFiles`
  - Risk Files: `summary.riskFiles`
  - Active Weeks: `summary.weekCount`
- Confirm weekly commits:
  - columns from `weeks`
  - rows from `commitStats`
  - totals from `AuthorCommitStats.totalCommits`
- Confirm section summaries:
  - files from `section.totalFiles`
  - risk files from `section.riskFiles`
  - total edits from `section.files.reduce(...)`
  - file share from `section.totalFiles / summary.totalFiles`
- Confirm distribution chart:
  - slices from each report section's `section.totalFiles`
  - percentages from `section.totalFiles / summary.totalFiles`
  - labels from `section.label`
  - no LOC or line-count data in the first pass

Acceptance:

- No visual component duplicates analysis rules from `bus-lib`.
- The first pass uses existing `BusfactorReport` data only.
- Missing data should become follow-up design scope instead of blocking the
  first implementation.

### 3. Rebuild Upload Flow

- Replace the smoke upload placeholder with `UploadPanel`.
- Read uploaded text through browser file APIs.
- Call `analyzeGitLog` from `bus-lib`.
- Track app states:
  - no file uploaded
  - file loading
  - parse/analyze success
  - parse/analyze error
  - report with no tracked files
- Keep the file input labelled and keyboard reachable.

Acceptance:

- A legacy git log fixture can produce a visible report in the browser.
- Empty or malformed files show a clear error without crashing.

### 4. Add Visual Tokens

- Add Tailwind to the Vite app using current packages compatible with the
  repository's Vite `^5.4.11` setup:
  - `tailwindcss`
  - `@tailwindcss/vite`
- Follow Tailwind's Vite plugin setup: add the Tailwind plugin to
  `packages/bus-web/vite.config.ts` and import Tailwind from the web app CSS.
- Use the prototype palette as input, but normalize token names for Busfactor2.
- Configure generic Busfactor2 brand tokens that follow Northwestern-inspired
  colors without using Northwestern Engineering language.
- Avoid generated Tailwind CDN configuration and avoid runtime CDN scripts.
- Avoid remote icon/font dependencies for core rendering. Use system font
  fallbacks first; add font or icon packages only if intentionally chosen.

Acceptance:

- The app can build and render offline after `npm install`.
- Color-coded risk states also include text or icon labels.
- Tailwind utilities are compiled through Vite, not loaded from a CDN.

### 5. Implement Report Summary

- Add `ReportSummary` with four metric cards.
- Render the summary only after report generation.
- Preserve an empty state before upload.
- Include the distribution chart as file distribution by report section.
- Use `section.totalFiles` and `summary.totalFiles`; do not ask `bus-lib` for
  LOC or other new chart-specific data in the first pass.

Acceptance:

- Summary cards are populated from `BusfactorReport.summary`.
- The chart is labelled as files, not LOC.
- Tests cover empty and populated summary states.

### 6. Implement Weekly Commit Table

- Add `CommitStatsTable`.
- Render one row per author and one column per week.
- Use semantic table markup with accessible headings.
- Add activity intensity as visual enhancement only; text count remains visible.
- Compute intensity in the presentation layer from existing commit counts.

Acceptance:

- Tests can query author names, week headings, and visible counts.
- No information is conveyed by color alone.

### 7. Implement Bus Factor Sections

- Add `ReportAccordion` for `overall`, `ts-js-css`, `python`, and `markdown`.
- Use section labels and ordering from `bus-lib`.
- Render `BusFactorSection` content inside each panel.
- Start with one expanded section by default, likely `overall`.
- Keep accordion buttons keyboard accessible and expose `aria-expanded`.

Acceptance:

- All default sections are reachable by keyboard.
- Tests cover expanding and collapsing at least one section.

### 8. Implement File-Level Analysis Tables

- Render file path, total edits, active contributor count, risk status, and
  contributor contribution cells.
- Use `StatusBadge` for high-risk files.
- Do not render "Low Familiarity" in the first pass.
- Use monospaced styling for file paths and numeric data.

Acceptance:

- Risk files are labelled with visible text.
- Non-risk files do not receive a second risk-like status label.
- Contributor percentages and edit counts come from `bus-lib` output.

### 9. Add File Distribution Visualization

- Implement the chart as file distribution by report section, not LOC.
- Use only existing `BusfactorReport.sections` and `summary.totalFiles` data.
- Keep it CSS/SVG-based unless a real charting need emerges.
- Include a text legend and table-friendly fallback.

Acceptance:

- The chart and legend match `BusfactorReport.sections`.
- The chart copy says files or tracked files, never LOC.
- The chart does not introduce a dependency for a simple four-slice view.

### 10. Verify Responsive Behavior

- Use a constrained desktop content width.
- Keep tables horizontally scrollable on small screens.
- Avoid nested card stacks that make the dashboard feel heavier than the data.
- Ensure the upload flow and accordion controls remain usable on mobile.
- Use an inline upload panel. Do not introduce an upload modal in the first
  pass.

Acceptance:

- No clipped controls or overlapping table headers at mobile width.
- Tables remain readable through horizontal scrolling.
- Header upload affordances move focus to the upload panel or trigger the
  panel's file input.

### 11. Add Tests and Verification

- Update React Testing Library tests around user-visible behavior.
- Prefer accessible queries: `getByRole`, `getByLabelText`, visible text.
- Add focused tests for:
  - initial empty state
  - upload success
  - upload error
  - summary metrics
  - weekly commit table
  - section accordion behavior
  - risk labels
  - upload panel focus or trigger behavior
- Run:

```bash
npm --workspace bus-web run test
npm --workspace bus-web run typecheck
npm --workspace bus-web run build
```

Acceptance:

- The web package tests, typecheck, and build pass.
- Any missing `bus-lib` report data is documented as future scope, not as a
  first-pass prerequisite.

## DESIGN.md Placement Recommendation

Do not make `docs/bus-web/stitch-ui/DESIGN.md` authoritative for agents. It is
a generated prototype artifact and should stay with the other Stitch files for
traceability.

Recommended final structure:

```text
docs/bus-web/
  README.md
  web-design-template.md
  design.md
  new-design.md
  stitch-ui/
    DESIGN.md
    code.html
    component-description.md
    screen.png
```

Use these roles:

- `docs/bus-web/stitch-ui/DESIGN.md`: raw prototype design export.
- `docs/bus-web/new-design.md`: implementation plan and validation checklist.
- `docs/bus-web/design.md`: future canonical Busfactor2 web design spec after
  the plan is accepted and implementation feedback is folded in.

Agent reference plan:

- Keep `.github/copilot-instructions.md` as the policy source of truth.
- Keep `.github/agents/bus-web-react.md` as the package-specific agent prompt.
- Add `docs/bus-web/new-design.md` to `docs/bus-web/README.md` while this work
  is planned.
- After the design is validated, reference `docs/bus-web/design.md` from
  `.github/agents/bus-web-react.md` and `docs/bus-web/README.md`.
- Do not point agents directly at `docs/bus-web/stitch-ui/code.html` as an
  implementation source. It can be used only for visual comparison.

## Decisions

- Brand: generic Busfactor2 branding that follows Northwestern-inspired visual
  cues.
- Footer: `(c) Todd Warren and Chris Riesbeck 2026`.
- Distribution chart: ship in the first pass as file distribution by report
  section.
- Risk status: first pass only shows `High Risk` from `isRisk`.
- Styling: add Tailwind through the Vite plugin path, using current packages
  compatible with Vite `^5.4.11`.
- Canonical design doc: wait; keep `docs/bus-web/new-design.md` as the active
  plan for now.
- Upload: use an inline upload panel, not a modal.
