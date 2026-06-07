# Bus CLI Work Items

These work items track the yargs-based CLI package.

## Milestone 0

### CLI-M0-1 — Create smoke package

**Files:** `packages/bus-cli/*`

**Goal:** Establish a CLI package that can import `bus-lib` and run a trivial
yargs command.

**Required change:**

- Add `package.json`, `tsconfig.json`, and `vitest.config.ts`.
- Add `src/index.ts` with yargs initialization.
- Add `busfactor --help` and a smoke command or smoke analyze path.
- Import one public `bus-lib` export.
- Add Vitest smoke tests for command construction.

**Acceptance:**

- `npm --workspace bus-cli run build` succeeds.
- `npm --workspace bus-cli run test` succeeds.
- `npm --workspace bus-cli run typecheck` succeeds.
- `npm --workspace bus-cli run dev -- --help` prints yargs help.

### CLI-M0-2 — Define CLI command contract

**Files:** `packages/bus-cli/src/commands/analyze.ts`,
`packages/bus-cli/src/index.ts`

**Goal:** Create the command surface before real analysis is wired in.

**Required change:**

- Add the `analyze [path]` command.
- Define planned options with descriptions.
- Keep behavior smoke-only until `bus-lib` analysis is ready.

**Acceptance:**

- `busfactor analyze --help` documents input, output, section, threshold, and
  agent options.

## Milestone 1

### CLI-M1-1 — Implement input loaders

**Goal:** Support repo, file, and stdin input.

**Acceptance:**

- Input precedence is tested.
- Git command construction is tested without live git.

### CLI-M1-2 — Implement human and agent formatters

**Goal:** Render readable console output and deterministic JSON.

**Acceptance:**

- Human formatter includes weekly commits plus overall, TS/JS/CSS, Python, and
  Markdown sections.
- Agent formatter emits parseable JSON with no prose.
