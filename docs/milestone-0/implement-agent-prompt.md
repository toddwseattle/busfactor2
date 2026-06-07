# Agent Prompt: Implement Milestone 0

You are implementing Milestone 0 for Busfactor2 in the repository at:

```text
/Users/toddwseattle/dev/busfactor
```

## Goal

Implement the Milestone 0 foundation described in:

- `README.md`
- `docs/busfactor2/overview-vision.md`
- `docs/milestone-0/README.md`
- `docs/milestone-0/work-items.md`
- `docs/milestone-0/smoke-package-contracts.md`
- `docs/milestone-0/git-hooks.md`
- `docs/milestone-0/legacy-source-plan.md`
- `docs/milestone-0/repo-cutover.md`
- `docs/using-this-repo.md`

Milestone 0 is complete when the repo is an agent-ready TypeScript npm workspace
with smoke implementations of all three packages, local hooks, preserved legacy
source, and a verified branch pushed to `toddwseattle/busfactor2`.

## Current Planning State

The current thread already created or updated the planning docs and agent files.
Do not discard those changes.

Important existing files:

- `.github/copilot-instructions.md`
- `.github/agents/bus-lib-function.md`
- `.github/agents/bus-cli-yargs.md`
- `.github/agents/bus-web-react.md`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `docs/using-this-repo.md`
- `docs/milestone-0/*`
- `docs/bus-lib/*`
- `docs/bus-cli/*`
- `docs/bus-web/*`
- `docs/busfactor2/overview-vision.md`
- `legacy/criesbeck-browser-app/README.md`

The old top-level README content has already been archived at:

```text
legacy/criesbeck-browser-app/README.md
```

## Required Implementation

### 1. Preserve Legacy Source

Create and populate:

```text
legacy/criesbeck-browser-app/
```

It should contain the original static app implementation:

- `README.md` already exists and should be kept
- `index.html`
- `app.js`
- `bus-factor.js`
- `gitstats.js`
- `upload.js`
- `app.css`
- `images/bus-factor-1.png`
- `images/bus-factor-2.png`

After copying the legacy files, decide whether the root static files should stay
temporarily or move fully under legacy. Prefer a clean root for the new workspace,
but do not lose source material. If files are moved, update docs as needed.

### 2. Create Root npm Workspace

Create:

- `package.json`
- `package-lock.json`
- `tsconfig.base.json`
- `.gitignore` updates if needed
- `.prettierignore`
- `lint-staged.config.mjs`
- `.husky/pre-commit`
- `.husky/pre-push`

Use npm workspaces:

```json
{
  "workspaces": ["packages/*"]
}
```

Root scripts should include:

- `build`
- `test`
- `typecheck`
- `dev:web`
- `dev:cli`
- `prepare`
- `lint-staged`
- `format`
- `format:check`
- `precommit`
- `prepush`

Use Husky + lint-staged as planned in `docs/milestone-0/git-hooks.md`.

### 3. Create `bus-lib` Smoke Package

Create:

```text
packages/bus-lib/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts
    types.ts
  src/index.test.ts
```

The package should:

- build with TypeScript
- run Vitest
- export report constants/types
- export a deterministic `createEmptyReport` smoke function
- expose `overall`, `ts-js-css`, `python`, and `markdown` section IDs

The CLI and web packages must import from the `bus-lib` package root, not
internal source paths.

### 4. Create `bus-cli` Smoke Package

Create:

```text
packages/bus-cli/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts
    commands/
      analyze.ts
  src/index.test.ts
```

The package should:

- use yargs
- expose `busfactor --help`
- expose `busfactor analyze --help`
- support a smoke `analyze --agent` path that prints the empty report JSON from
  `bus-lib`
- build with TypeScript
- run Vitest

Keep behavior smoke-only. Do not migrate parser/scoring logic yet.

### 5. Create `bus-web` Smoke Package

Create:

```text
packages/bus-web/
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  index.html
  src/
    main.tsx
    App.tsx
    App.test.tsx
```

The package should:

- use React + Vite + TypeScript
- use Vitest + React Testing Library
- import from `bus-lib`
- render smoke UI with:
  - Busfactor2 title
  - labelled file input placeholder
  - section labels for Overall, TS/JS/CSS, Python, Markdown
  - schema/version indicator from `bus-lib`
- build successfully
- test successfully

### 6. Hooks

Implement Husky + lint-staged:

- `.husky/pre-commit` runs `npm run lint-staged`
- `.husky/pre-push` runs `npm run prepush`
- `lint-staged.config.mjs` formats staged JS/TS/TSX/CSS/JSON/YAML/Markdown with
  Prettier

Hooks are local safety checks, not a replacement for explicit verification.

### 7. Repository Cutover

Set up the new repository target:

```text
toddwseattle/busfactor2
```

Follow `docs/milestone-0/repo-cutover.md`.

Recommended branch:

```text
codex/milestone-0
```

Do not push to `criesbeck/busfactor`.

If GitHub repository creation or push requires auth/approval, ask clearly and
stop at the point requiring credentials.

## Verification

Run these checks:

```bash
npm install
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-cli run dev -- analyze --help
npm --workspace bus-cli run dev -- analyze --agent
npm --workspace bus-web run build
npm run lint-staged
```

If any check fails, fix it unless the failure is caused by missing external auth
or an explicit environment blocker.

## Git And Safety Rules

- Do not revert existing user/planning changes.
- Do not use destructive git commands.
- Do not commit or push until verification passes.
- Preserve attribution to `criesbeck/busfactor`.
- Keep root docs current with the actual state after implementation.
- If package implementation changes the milestone plan, update the docs.

## Final Response Expectations

In the final response, include:

- files/packages created
- verification commands run and results
- whether legacy source was preserved
- whether repo remote/branch was created
- whether the branch was pushed
- any blockers requiring human action
