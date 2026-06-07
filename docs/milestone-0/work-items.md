# Milestone 0 Work Items

Items are grouped by workstream. Complete them in order unless a later item is
explicitly independent.

## Documentation And Agents

### M0-D1 — Add authoritative agent instructions

**Files:** `.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`

**Required change:**

- Create Copilot instructions as the source of truth.
- Create Codex and Claude routing files that point back to Copilot
  instructions.
- Document runtime boundaries for `bus-lib`, `bus-cli`, and `bus-web`.

**Acceptance:**

- GitHub Copilot, Codex, and Claude can all discover package-specific guidance.

### M0-D2 — Add package-specific agent prompts

**Files:** `.github/agents/bus-lib-function.md`,
`.github/agents/bus-cli-yargs.md`, `.github/agents/bus-web-react.md`

**Required change:**

- Add one prompt for shared library work.
- Add one prompt for yargs CLI work.
- Add one prompt for React web work.

**Acceptance:**

- Each prompt names its runtime boundary, testing expectations, and output
  expectations.

### M0-D3 — Add package documentation sections

**Files:** `docs/bus-lib/*`, `docs/bus-cli/*`, `docs/bus-web/*`

**Required change:**

- Create README and work-item files for each package.
- Add `docs/bus-lib/new-function-agent-guide.md`.
- Add `docs/bus-web/web-design-template.md`.

**Acceptance:**

- An agent can start work in any package by reading one package README, one
  work-item file, and one matching `.github/agents` prompt.

### M0-D4 — Replace top-level README

**Files:** `README.md`

**Required change:**

- Replace the original browser-app README with a Busfactor2 README.
- Explain the project purpose, planned package layout, report sections, current
  milestone state, and key docs.
- Preserve original project attribution.

**Acceptance:**

- A human opening the repo sees current Busfactor2 guidance, not only the old
  static browser-app usage.

### M0-D5 — Add human guide for using agents

**Files:** `docs/using-this-repo.md`

**Required change:**

- Explain how humans should assign work to Copilot, Codex, Claude, or another
  agent.
- Document package boundaries, verification expectations, and review checklist.
- Link to package docs and agent prompts.

**Acceptance:**

- A human can use the guide to create bounded agent tasks without rediscovering
  repository conventions.

## Repository Cutover

### M0-R1 — Create `toddwseattle/busfactor2`

**Required change:**

- Create a new GitHub repository named `toddwseattle/busfactor2`.
- Preserve original attribution in docs.
- Do not open a PR against `criesbeck/busfactor`.

**Acceptance:**

- New repository exists and is ready for push.

### M0-R2 — Configure remotes safely

**Required change:**

- Keep `criesbeck/busfactor` available as `upstream` or a clearly named remote.
- Set `origin` to `toddwseattle/busfactor2`, or add a separate `busfactor2`
  remote if origin should remain unchanged during transition.

**Acceptance:**

- `git remote -v` clearly shows the original source and new Busfactor2 target.

### M0-R3 — Push Milestone 0 branch

**Required change:**

- Push the Milestone 0 branch to `toddwseattle/busfactor2`.

**Acceptance:**

- GitHub shows the branch in the new repository.

## Workspace Scaffold

### M0-W1 — Add root npm workspace files

**Files:** `package.json`, `package-lock.json`, `tsconfig.base.json`

**Required change:**

- Create an npm workspace with `packages/*`.
- Add root scripts for `build`, `test`, `typecheck`, `dev:web`, and `dev:cli`.
- Add root scripts needed by git hooks: `lint-staged`, `format`,
  `format:check`, `precommit`, and `prepush`.
- Add shared TypeScript strict settings.

**Acceptance:**

- `npm install` succeeds.
- workspace commands discover all three packages.

### M0-W2 — Add smoke `bus-lib`

**Files:** `packages/bus-lib/*`

**Required change:**

- Create the library package.
- Add TypeScript and Vitest config.
- Export minimal public types and a deterministic smoke function.

**Acceptance:**

- `npm --workspace bus-lib run build` succeeds.
- `npm --workspace bus-lib run test` succeeds.
- `npm --workspace bus-lib run typecheck` succeeds.

### M0-W3 — Add smoke `bus-cli`

**Files:** `packages/bus-cli/*`

**Required change:**

- Create the CLI package.
- Add yargs.
- Add smoke `busfactor --help` and `busfactor analyze --help`.
- Import a public value from `bus-lib`.

**Acceptance:**

- `npm --workspace bus-cli run build` succeeds.
- `npm --workspace bus-cli run test` succeeds.
- `npm --workspace bus-cli run typecheck` succeeds.
- CLI help output includes `analyze`.

### M0-W4 — Add smoke `bus-web`

**Files:** `packages/bus-web/*`

**Required change:**

- Create the React + Vite package.
- Add Vitest and React Testing Library.
- Render smoke UI for Overall, TS/JS/CSS, Python, and Markdown sections.
- Import a public value from `bus-lib`.

**Acceptance:**

- `npm --workspace bus-web run build` succeeds.
- `npm --workspace bus-web run test` succeeds.
- `npm --workspace bus-web run typecheck` succeeds.

## Git Hooks

### M0-H1 — Add Husky + lint-staged hook setup

**Files:** `package.json`, `.husky/pre-commit`, `.husky/pre-push`,
`lint-staged.config.mjs`, `.prettierignore`,
`docs/milestone-0/git-hooks.md`

**Required change:**

- Add Husky and lint-staged as root dev dependencies.
- Add `prepare: husky` to the root package.
- Add `.husky/pre-commit` to run `npm run lint-staged`.
- Add `.husky/pre-push` to run `npm run prepush`.
- Add a minimal `lint-staged.config.mjs` that formats staged JS/TS/CSS/JSON/YAML
  and Markdown files with Prettier.
- Document hook philosophy and future Lefthook reassessment.

**Acceptance:**

- `npm install` installs Husky hooks.
- `git commit` runs staged-file formatting.
- `git push` runs workspace typecheck and tests.
- Hooks are documented as local checks, not a replacement for CI.

## Legacy Source Preservation

### M0-L1 — Preserve current static app files

**Target:** `legacy/criesbeck-browser-app/`

**Required change:**

- Copy the current root static files into the legacy directory:
  - `index.html`
  - `app.js`
  - `bus-factor.js`
  - `gitstats.js`
  - `upload.js`
  - `app.css`
  - the original app `README.md` from `criesbeck/busfactor` or git history
  - `images/`
- Add a legacy README explaining the source and migration intent.

**Acceptance:**

- Agents can read the old implementation from `legacy/criesbeck-browser-app`
  without relying on root files.

### M0-L2 — Keep root clean for new workspace

**Required change:**

- After the legacy copy is verified, decide whether root static files should stay
  temporarily or move fully under legacy.
- If moving them, update docs and ensure no smoke package depends on root static
  files.

**Acceptance:**

- The root of the repository clearly represents the new workspace direction.

## Verification

### M0-V1 — Run workspace checks

**Required change:**

Run:

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

**Acceptance:**

- All checks pass or documented failures are fixed before push.

### M0-V2 — Push verified branch

**Required change:**

- Push the verified branch to `toddwseattle/busfactor2`.

**Acceptance:**

- GitHub contains the verified Milestone 0 branch.
