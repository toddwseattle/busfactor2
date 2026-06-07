# Busfactor2

Busfactor2 is the planned TypeScript evolution of the original
[`criesbeck/busfactor`](https://github.com/criesbeck/busfactor) browser app.

The tool analyzes git history to help small teams see:

- weekly commit participation by author
- files with low contributor overlap
- bus factor risk across source and documentation areas

The new project target is:

```text
toddwseattle/busfactor2
```

This repository is currently in Milestone 0 setup. The original static app
implementation is preserved under `legacy/criesbeck-browser-app`, while the
root now contains the TypeScript npm workspace foundation.

## Packages

Busfactor2 is an npm workspace with three smoke packages:

- `bus-lib`: shared TypeScript library foundation for report constants, public
  types, and deterministic smoke report objects.
- `bus-cli`: yargs-based Node CLI with smoke help and `analyze --agent` JSON
  output.
- `bus-web`: React + Vite web app with smoke upload and section placeholders.

## Planned Report Sections

Reports will include:

- `overall`: derived rollup over selected source categories
- `ts-js-css`: TypeScript, JavaScript, and CSS files
- `python`: Python files
- `markdown`: Markdown files

The `overall` section is computed from the selected source categories. It is not
matched independently, which avoids double-counting.

## Current Docs

Start here:

- [Vision](docs/busfactor2/overview-vision.md)
- [Milestone 0 plan](docs/milestone-0/README.md)
- [Using this repo with agents](docs/using-this-repo.md)
- [bus-lib docs](docs/bus-lib/README.md)
- [bus-cli docs](docs/bus-cli/README.md)
- [bus-web docs](docs/bus-web/README.md)

Agent instructions:

- [.github/copilot-instructions.md](.github/copilot-instructions.md)
- [AGENTS.md](AGENTS.md)
- [CLAUDE.md](CLAUDE.md)

## Milestone 0 Goal

Milestone 0 creates an agent-ready foundation:

- current top-level documentation
- Copilot, Codex, and Claude routing files
- package-specific docs and work items
- npm workspace scaffold
- smoke versions of `bus-lib`, `bus-cli`, and `bus-web`
- Vitest in all packages
- Husky + lint-staged git hooks for fast local checks
- preserved copy of the original static browser app under `legacy/`
- new repository remote for `toddwseattle/busfactor2`

## Workspace Commands

Use these commands for Milestone 0 verification:

```bash
npm install
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-cli run dev -- analyze --help
npm --workspace bus-cli run dev -- analyze --agent
npm --workspace bus-web run build
npm --workspace bus-web run dev
npm run lint-staged
```

## Original App

The original app analyzes output from:

```bash
git log --no-merges --name-status main > ~/gitlog.txt
```

The current static implementation is copied into
`legacy/criesbeck-browser-app` so the parser, scoring, and UI behavior can be
migrated deliberately into the new packages. Treat the legacy snapshot as
read-only reference unless intentionally updating the migration baseline.
