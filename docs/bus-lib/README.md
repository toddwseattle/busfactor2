# Bus Lib Documentation

`bus-lib` is the shared TypeScript library for Busfactor2. It owns the behavior
that must be identical in the CLI and web app.

## Responsibilities

- Parse supported git log text.
- Classify changed files into source categories.
- Compute weekly commit counts by author.
- Compute file edit history and frequency weighted by recency scores.
- Detect active contributors and risky files.
- Build stable, versioned report objects.
- Derive the `overall` section from selected source categories.

## Runtime Boundary

`bus-lib` core modules must be pure and runtime-neutral.

Allowed:

- TypeScript types and functions.
- Deterministic parsing and transforms.
- Options objects.
- Fixtures in tests.

Not allowed in core modules:

- React.
- yargs.
- Browser APIs such as `FileReader`.
- Node filesystem APIs.
- `child_process`.
- direct console output.
- locale-dependent date formatting.

If a Node or browser adapter is needed later, keep it separate from the core
analysis modules.

## Planned Source Layout

```text
packages/bus-lib/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts
    analyzer.ts
    categories.ts
    git-log.ts
    report.ts
    types.ts
  test/
    fixtures/
    analyzer.test.ts
    categories.test.ts
    git-log.test.ts
    report.test.ts
```

## Public API Direction

Current public exports include:

- `analyzeGitLog(text, options?)`
- `parseGitLog(text)`
- `createEmptyReport()`
- `DEFAULT_ANALYSIS_OPTIONS`
- `DEFAULT_REPORT_SECTIONS`
- `DEFAULT_SECTION_IDS`
- report and options types

Public functions should use named exports from `src/index.ts`.

`analyzeGitLog` accepts prepared `git log --no-merges --name-status <ref>` text
and returns a deterministic `busfactor.report.v1` report. The report includes:

- sorted `authors`
- UTC ISO Sunday `weeks`
- per-author weekly commit counts
- section file rows with edit counts, last edit timestamps, frequency weighted
  by recency, active contributor counts, and risk flags

The legacy browser app called the weighted activity value `frecency`. Busfactor2
uses `weightedActivity` and `totalWeightedActivity` in public types, and keeps
`compatibilityFrecency` fields while this migration slice is being verified.

## Report Sections

`bus-lib` should produce section reports in this order:

1. `overall`
2. `ts-js-css`
3. `python`
4. `markdown`

`overall` is derived from the selected source categories. It must not be a
separate file matcher.

The first CLI legacy slice maps the old browser app's tracked extensions
(`.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.html`, `.htm`, and `.yml`) into the
`ts-js-css` section for compatibility. `python` and `markdown` are present but
empty until category expansion work follows. HTML and YAML in `ts-js-css` are a
compatibility bridge, not the final category model.

The fixture for this behavior is
`packages/bus-lib/test/fixtures/legacy-git-log.txt`.

## Legacy Compatibility Notes

- Tracked name-status codes are exactly `A`, `C`, and `M`.
- Ignored path segments are `node_modules`, `build`, and `dist`.
- Defaults remain a 7-day half-life, 5 percent active contributor threshold, and
  fewer than 3 active contributors is risky.
- The legacy app code counts commits when it reads each `Date:` line, so a
  delete-only commit contributes to weekly commit counts even though delete file
  lines do not contribute to file activity. This differs from the legacy README
  wording and is preserved as code compatibility.
- The legacy app rendered week labels with `toLocaleDateString()`. Busfactor2
  stores week buckets as UTC ISO Sunday dates such as `2024-02-04` to keep JSON
  deterministic across machines.

## Testing

Use Vitest for all library tests.

Minimum coverage:

- parser behavior for legacy and stable git log formats
- file classification
- ignore rules
- weekly commit buckets
- weighted frequency scoring
- active contributor detection
- risk detection
- overall section rollup
- stable JSON report shape

Use fixture git logs. Do not call live git from unit tests.

## Agent Entry Points

- Agent prompt: `.github/agents/bus-lib-function.md`
- New function guide: `docs/bus-lib/new-function-agent-guide.md`
- Work items: `docs/bus-lib/work-items.md`
