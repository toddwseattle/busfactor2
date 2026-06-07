# Milestone 0 Plan

Milestone 0 creates an agent-ready Busfactor2 foundation before the real analyzer
migration begins.

The goal is not to finish the TypeScript migration. The goal is to make the repo
safe for parallel agent work by establishing documentation, package boundaries,
smoke packages, legacy-source preservation, and the new GitHub repository target.

## Outcomes

Milestone 0 is complete when:

- the repository has Copilot, Codex, and Claude agent instructions
- the top-level README is current for Busfactor2
- humans have a guide for using the repo with agents
- package docs exist for `bus-lib`, `bus-cli`, and `bus-web`
- the root project is an npm workspace
- all three packages have smoke implementations
- Vitest runs in all three packages
- Husky + lint-staged hooks run fast local checks
- current static app files are preserved in a legacy migration location
- the new repository target is `toddwseattle/busfactor2`
- the milestone branch is pushed to the new repository

## Scope

In scope:

- docs and agent scaffolding
- top-level README replacement
- human-with-agents repo guide
- npm workspace scaffolding
- smoke package creation
- package-level Vitest setup
- local git hook setup
- preserving current files for migration
- creating and pushing to the new repo

Out of scope:

- full parser migration
- real yargs `analyze` implementation beyond smoke/help behavior
- real React upload/report rendering beyond smoke UI
- changing bus factor scoring rules
- publishing packages to npm

## Target Documentation Layout

```text
docs/
  using-this-repo.md
  agents/
    README.md
  busfactor2/
    overview-vision.md
  milestone-0/
    README.md
    work-items.md
    repo-cutover.md
    smoke-package-contracts.md
    legacy-source-plan.md
    git-hooks.md
  bus-lib/
    README.md
    work-items.md
    new-function-agent-guide.md
  bus-cli/
    README.md
    work-items.md
  bus-web/
    README.md
    work-items.md
    web-design-template.md
```

## Target Agent Files

```text
.github/
  copilot-instructions.md
  agents/
    bus-lib-function.md
    bus-cli-yargs.md
    bus-web-react.md
AGENTS.md
CLAUDE.md
```

`.github/copilot-instructions.md` is the source of truth. `AGENTS.md` and
`CLAUDE.md` route Codex and Claude to the same instructions.

## Target Workspace Layout

```text
packages/
  bus-lib/
  bus-cli/
  bus-web/
legacy/
  criesbeck-browser-app/
```

The `legacy/criesbeck-browser-app` directory contains a copied snapshot of the
original static app files so agents can migrate from a stable source while the
new package structure evolves. Root static app files are removed after the copy
so the repository root represents the new workspace direction.

## Workstreams

1. Documentation and agent scaffolding.
2. Repository cutover to `toddwseattle/busfactor2`.
3. npm workspace and TypeScript scaffolding.
4. Smoke implementations for `bus-lib`, `bus-cli`, and `bus-web`.
5. Husky + lint-staged hook setup.
6. Legacy source preservation.
7. Verification and push.

Detailed work items are in [work-items.md](work-items.md).

## Milestone 0 Verification

Run these checks before marking Milestone 0 complete:

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

Also confirm:

- `git remote -v` shows the new Busfactor2 remote.
- the branch is pushed to `toddwseattle/busfactor2`.
- `legacy/criesbeck-browser-app` contains the current static app source.
- root static files are not needed by the new smoke packages.
- `.husky/pre-commit` runs `lint-staged`.
- `.husky/pre-push` runs workspace typecheck and tests.

## Dependencies And Decisions

- Repository visibility for `toddwseattle/busfactor2` should be confirmed before
  creation. Default recommendation: public, to match the original GitHub Pages
  app, unless private development is preferred.
- Use npm workspaces rather than pnpm or yarn unless the project direction
  changes.
- Use Vitest in every package.
- Use React for `bus-web`.
- Use Husky + lint-staged for Milestone 0 hooks. Hooks are a local safety net;
  workspace scripts and CI remain authoritative.
- Reassess Lefthook later if hook performance, parallelism, or multi-runtime
  orchestration becomes a real problem.
- Do not copy `DESIGN.md` from another project; use
  `docs/bus-web/web-design-template.md`.
