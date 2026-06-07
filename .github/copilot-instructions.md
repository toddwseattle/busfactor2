# Busfactor2 Copilot Instructions

This is the authoritative instruction file for GitHub Copilot, Codex, Claude, and
other coding agents working in this repository.

## Project Shape

Busfactor2 is planned as a TypeScript npm workspace with three packages:

- `packages/bus-lib`: shared pure analysis library for git log parsing, file
  classification, bus factor scoring, and stable report generation.
- `packages/bus-cli`: Node CLI built with yargs. It reads git logs from a repo,
  file, or stdin and formats reports for humans and agents.
- `packages/bus-web`: React + Vite web app. It uploads a git log file and
  renders the same report produced by `bus-lib`.

Until Milestone 0 is implemented, the current static browser files remain at the
repository root. They are legacy source material to preserve and migrate from,
not the long-term architecture.

## Source Of Truth

Read these docs before changing package behavior:

- `docs/busfactor2/overview-vision.md`
- `docs/using-this-repo.md`
- `docs/milestone-0/README.md`
- `docs/milestone-0/git-hooks.md`
- `docs/bus-lib/README.md`
- `docs/bus-cli/README.md`
- `docs/bus-web/README.md`

Package-specific agent prompts live in `.github/agents/`.

## Runtime Boundaries

- `bus-lib` must stay runtime-neutral and deterministic. It must not import
  React, yargs, Node process state, filesystem APIs, child processes, or browser
  APIs from core analysis modules.
- `bus-cli` may use Node APIs and yargs. It must not import React or browser-only
  code.
- `bus-web` may use React and browser APIs. It must not run git commands or
  duplicate analysis rules that belong in `bus-lib`.

If two packages need the same behavior, put it in `bus-lib` first and consume it
through a named export.

## Report Sections

The default report has these bus factor sections:

1. `overall`: derived rollup over selected source categories.
2. `ts-js-css`: TypeScript, JavaScript, and CSS files.
3. `python`: Python files.
4. `markdown`: Markdown files.

Do not implement `overall` as an independent matcher. It is derived from the
selected source categories to avoid double-counting.

## TypeScript Standards

- Use TypeScript strict mode.
- Prefer named exports.
- Prefer explicit interfaces for exported object shapes.
- Avoid `any`. Use `unknown` and narrow it when needed.
- Keep functions deterministic unless the module is explicitly an adapter.
- Use small options objects when a function has more than two configurable
  inputs.
- Keep dates as ISO strings or timestamps in shared data. Format for humans only
  in presentation layers.

## Testing

Use Vitest throughout:

- `bus-lib`: pure parser, classifier, scoring, and report tests.
- `bus-cli`: yargs parsing, input resolution, formatter, and command tests.
- `bus-web`: Vitest with React Testing Library.

Tests should be deterministic:

- No real network calls.
- No live git operations in unit tests.
- No locale-dependent expectations in shared library snapshots.
- Use fixtures for git log inputs.

## Package Guidance

Use the package-specific prompts when the task fits:

- `.github/agents/bus-lib-function.md`: adding or changing shared library API.
- `.github/agents/bus-cli-yargs.md`: adding or changing CLI behavior.
- `.github/agents/bus-web-react.md`: adding or changing React UI behavior.

## Commands

Milestone 0 will define the final scripts. The intended commands are:

```bash
npm install
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-web run dev
npm run lint-staged
```

If scripts do not exist yet, update the relevant Milestone 0 work item rather
than inventing a conflicting script name.

## Documentation Rules

- Update package docs when adding public package behavior.
- Keep work items in `docs/bus-lib`, `docs/bus-cli`, or `docs/bus-web` when the
  work clearly belongs to one package.
- Keep cross-package setup, repo cutover, and migration sequencing in
  `docs/milestone-0`.
- Do not copy `DESIGN.md` files from other projects. Use
  `docs/bus-web/web-design-template.md` when starting Busfactor2 web design docs.

## Git Hooks

Milestone 0 uses Husky + lint-staged for local hooks:

- pre-commit should run staged-file checks through `lint-staged`
- pre-push should run workspace typecheck and tests
- hooks are a local safety net, not a replacement for CI or explicit
  verification commands

If hook runtime or multi-runtime orchestration becomes a real problem, evaluate
Lefthook later.

## Completion Standard

A task is complete only when:

- runtime boundaries are respected
- relevant package docs are updated
- Vitest coverage is added or an explicit test gap is documented
- package scripts relevant to the touched code pass
- agent-readable outputs remain deterministic
