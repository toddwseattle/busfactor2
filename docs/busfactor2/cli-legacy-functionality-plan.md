# CLI Legacy Functionality Plan

This plan defines the next implementation slice after Milestone 0. The goal is
to make `bus-cli` perform the old browser app analysis from the command line
while preserving behavior in `bus-lib` first.

Reference docs:

- [Overview vision](overview-vision.md)
- [bus-lib work items](../bus-lib/work-items.md)
- [bus-cli work items](../bus-cli/work-items.md)
- [legacy source plan](../milestone-0/legacy-source-plan.md)
- [legacy app snapshot](../../legacy/criesbeck-browser-app/README.md)
- [starter agent prompt](start-cli-legacy-agent-prompt.md)

## Scope

In scope for the first CLI parity slice:

- parse existing `git log --no-merges --name-status main` text
- preserve legacy author, date, weekly commit, file edit, frecency, active
  contributor, and risk calculations
- support `busfactor analyze --input <file>`
- support `busfactor analyze --agent`
- add enough human output to show weekly commits and bus factor rows
- keep CLI and web consumers importing `bus-lib` through the package root

Out of scope for the first slice:

- React web migration
- Markdown and NDJSON output
- `--output`, `--top`, and `--fail-on-risk`
- changing old scoring rules
- broad custom category configuration

## Compatibility Target

The old app lives in `legacy/criesbeck-browser-app`. The first CLI slice should
preserve these behaviors:

- input shape: `git log --no-merges --name-status main`
- tracked edit statuses: `A`, `C`, and `M`
- tracked legacy extensions: `.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.html`,
  `.htm`, and `.yml`
- ignored paths: `node_modules`, `build`, and `dist`
- half-life: 7 days
- active contributor threshold: 5 percent
- risk threshold: fewer than 3 active contributors
- file ordering: highest total frecency first

The Busfactor2 report model should still use current section IDs. If exact
legacy HTML/YAML handling does not fit cleanly into `ts-js-css`, document it in
types and tests before changing behavior.

## Implementation Order

1. Add `bus-lib` fixtures and failing expectation tests for the old app
   behavior.
2. Port pure parser helpers from `legacy/criesbeck-browser-app/app.js` into
   `bus-lib`.
3. Port weekly commit and frecency scoring into `bus-lib`.
4. Export `analyzeGitLog(text, options?)` from the `bus-lib` package root.
5. Expand `bus-cli analyze` option parsing for `--input`, `--stdin`, `--repo`,
   `--ref`, `--format`, `--agent`, and `--no-color`.
6. Implement input loaders using Node APIs and safe git argument arrays.
7. Wire `bus-cli analyze` to `analyzeGitLog`.
8. Add human and agent formatter tests.
9. Run full workspace verification.

## Verification

Required commands for the first slice:

```bash
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-cli run dev -- analyze --help
npm --workspace bus-cli run dev -- analyze --agent
npm --workspace bus-cli run dev -- analyze --input packages/bus-lib/test/fixtures/legacy-git-log.txt --agent
npm run lint-staged
```

If fixture paths change, update this plan and the package work items in the same
commit.

## Completion Criteria

The slice is complete when:

- `bus-lib` owns parser and scoring behavior.
- CLI analysis works from a fixture input file.
- `--agent` returns deterministic JSON from real analysis.
- human output includes weekly commits and bus factor risk rows.
- tests cover parser, scoring, input loading, and formatter behavior.
- docs describe any compatibility gaps discovered during migration.
