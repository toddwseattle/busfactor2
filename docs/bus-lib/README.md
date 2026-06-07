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

Initial public exports should include:

- `analyzeGitLog(text, options?)`
- `parseGitLog(text)`
- `classifyPath(path, categories?)`
- `createEmptyReport(source, options?)`
- `DEFAULT_SOURCE_CATEGORIES`
- `DEFAULT_ANALYSIS_OPTIONS`
- report and options types

Public functions should use named exports from `src/index.ts`.

## Report Sections

`bus-lib` should produce section reports in this order:

1. `overall`
2. `ts-js-css`
3. `python`
4. `markdown`

`overall` is derived from the selected source categories. It must not be a
separate file matcher.

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
