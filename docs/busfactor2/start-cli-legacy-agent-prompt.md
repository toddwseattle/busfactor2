# Agent Prompt: Start CLI Legacy Functionality

Use this prompt to start the next implementation agent.

````text
Implement the first Busfactor2 CLI legacy functionality slice in this repository.

Start by reading and following:

- .github/copilot-instructions.md
- docs/busfactor2/overview-vision.md
- docs/busfactor2/cli-legacy-functionality-plan.md
- docs/bus-lib/README.md
- docs/bus-lib/work-items.md
- docs/bus-lib/new-function-agent-guide.md
- docs/bus-cli/README.md
- docs/bus-cli/work-items.md
- .github/agents/bus-lib-function.md
- .github/agents/bus-cli-yargs.md
- legacy/criesbeck-browser-app/README.md
- legacy/criesbeck-browser-app/app.js

Goal:

Make `bus-cli analyze` perform the old browser app analysis from the command
line by porting legacy parser/scoring behavior into `bus-lib` first, then wiring
`bus-cli` to the public `bus-lib` package export.

Important constraints:

- Do not put parser, scoring, or report-construction rules in `bus-cli`.
- Do not import `bus-lib` internals from `bus-cli`; import from the package root.
- Keep `bus-lib` runtime-neutral and deterministic.
- Preserve legacy behavior before expanding categories.
- Use fixture git logs. Do not call live git from unit tests.
- Preserve existing uncommitted user changes, if any.

Suggested implementation order:

1. Add fixture coverage for `git log --no-merges --name-status main` text under
   `packages/bus-lib/test/fixtures`.
2. Implement BL-M1-0 through BL-M1-3 from `docs/bus-lib/work-items.md`.
3. Implement CLI-M1-0 through CLI-M1-4 from `docs/bus-cli/work-items.md`.
4. Update docs if report shape, fixture path, or compatibility behavior changes.

Required behavior:

- `busfactor analyze --input <fixture> --agent` prints deterministic JSON from
  real analysis, not `createEmptyReport`.
- `busfactor analyze --input <fixture>` prints readable human output with weekly
  commits and bus factor rows.
- CLI supports `--input`, `--stdin`, `--repo`, `--ref`, `--format <human|json>`,
  `--agent`, and `--no-color` for the first slice.
- Old defaults are preserved: 7-day half-life, 5 percent active threshold, and
  fewer than 3 active contributors is risky.

Run verification:

```bash
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-cli run dev -- analyze --help
npm --workspace bus-cli run dev -- analyze --agent
npm --workspace bus-cli run dev -- analyze --input packages/bus-lib/test/fixtures/legacy-git-log.txt --agent
npm run lint-staged
````

If any check fails, fix it unless the failure is caused by missing external auth
or an explicit environment blocker.

Report back with:

- implemented work items
- changed files
- verification results
- any compatibility gaps found in the old app behavior
- branch, commit, and push status if you commit or push

```

```
