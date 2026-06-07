# Bus CLI Work Items

These work items track the yargs-based CLI package.

## Milestone 0

Status: complete.

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
- Add top-level `--version`.
- Define planned options with descriptions.
- Keep behavior smoke-only until `bus-lib` analysis is ready.

**Acceptance:**

- `busfactor analyze --help` documents input, output, section, threshold, and
  agent options.
- `busfactor --version` prints the package version.

## Milestone 1

Milestone 1 gets the CLI working with the old browser app functionality using
the real analyzer from `bus-lib`. Keep parsing, scoring, and report construction
out of `bus-cli`.

Status: CLI-M1-0 through CLI-M1-4 are implemented for the first CLI legacy
functionality slice.

### CLI-M1-0 — Expand top-level and `analyze` options for the first real slice

Status: implemented.

**Files:** `packages/bus-cli/src/commands/analyze.ts`,
`packages/bus-cli/src/index.ts`

**Goal:** Document and parse the options needed for old-app parity before
implementing all future CLI options.

**Required change:**

- Support `busfactor analyze [path]`.
- Support `busfactor --version`.
- Support `--input <file>`, `--stdin`, `--repo <path>`, `--ref <ref>`,
  `--format <human|json>`, `--agent`, and `--no-color`.
- Default to `--repo .` when no input is provided.
- Treat a positional path as the first local repository path workflow.
- Treat `--agent` as JSON output with no prose and no color.

**Acceptance:**

- Help output documents each supported option.
- Version output is tested.
- Unit tests cover yargs parsing and defaults.

### CLI-M1-1 — Implement input loaders

Status: implemented.

**Goal:** Support repo, file, and stdin input.

**Required change:**

- Read `--input` files with Node filesystem APIs.
- Read stdin only when `--stdin` is set.
- Run git with argument arrays for `--repo` and `--ref`.
- Use `git log --no-merges --name-status <ref>` for local path and `--repo`
  compatibility in the first slice.
- Return clear errors for unreadable files, empty input, missing git, and git
  command failure.
- Keep input-loading code isolated from formatter and command logic.

**Acceptance:**

- Input precedence is tested.
- Git command construction is tested without live git.

### CLI-M1-2 — Wire `analyze` to `bus-lib`

Status: implemented.

**Goal:** Replace smoke output with real analysis from the shared package.

**Required change:**

- Import `analyzeGitLog` from `bus-lib`.
- Pass loaded git log text into the library.
- Keep exit code `0` for successful analysis, even when risk files exist.
- Return non-zero only for input, parse, or command failures in this slice.

**Acceptance:**

- `busfactor analyze . --agent` can analyze a local repo path.
- `busfactor analyze --input <fixture> --agent` prints valid report JSON.
- Tests prove the CLI does not import `bus-lib` internals.

### CLI-M1-3 — Implement human and agent formatters

Status: implemented.

**Goal:** Render readable console output and deterministic JSON.

**Required change:**

- Agent output is pretty JSON with no prose.
- Human output includes report source, author count, week count, risk count,
  weekly commits, and bus factor rows.
- Human output can stay plain text for the first slice.
- Formatter tests use library fixture reports rather than live git.

**Acceptance:**

- Human formatter includes weekly commits plus overall, TS/JS/CSS, Python, and
  Markdown sections.
- Agent formatter emits parseable JSON with no prose.

### CLI-M1-4 — Add end-to-end fixture command tests

Status: implemented.

**Goal:** Prove old browser app functionality is reachable through the CLI.

**Acceptance:**

- `npm --workspace bus-cli run test` covers `--input` with a fixture log.
- `npm --workspace bus-cli run test` covers positional local path behavior with
  mocked git execution.
- `npm --workspace bus-cli run dev -- analyze --input <fixture> --agent` emits
  deterministic JSON.
- Workspace build, test, typecheck, and existing smoke commands pass.
