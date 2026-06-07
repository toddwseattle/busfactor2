# Busfactor2

Busfactor2 is the TypeScript evolution of the original
[`criesbeck/busfactor`](https://github.com/criesbeck/busfactor) browser app.

The tool analyzes git history to help small teams see:

- weekly commit participation by author
- files with low contributor overlap
- bus factor risk across source and documentation areas

<img src="packages/bus-web/public/images/Bus_Factor_Splash_Large.png" alt="Busfactor2 project splash" width="720">

The project is published at:

```text
toddwseattle/busfactor2
```

The original static app implementation is preserved under
`legacy/criesbeck-browser-app`, while the root contains the Busfactor2 npm
workspace.

## Packages

Busfactor2 is an npm workspace with three packages:

- `bus-lib`: shared TypeScript library for legacy git log parsing, weekly
  commit stats, weighted activity scoring, bus factor risk detection, report
  constants, and public report types.
- `bus-cli`: yargs-based Node CLI. It can analyze a local repository, prepared
  git log file, or stdin and render human text or deterministic JSON.
- `bus-web`: React + Vite web app. It currently has the upload-first smoke UI
  and imports public values from `bus-lib`; full report rendering is still a
  follow-up migration.

## Report Sections

Reports will include:

- `overall`: derived rollup over selected source categories
- `ts-js-css`: TypeScript, JavaScript, and CSS files
- `python`: Python files
- `markdown`: Markdown files

The `overall` section is computed from the selected source categories. It is not
matched independently, which avoids double-counting.

The current compatibility slice maps legacy `.js`, `.jsx`, `.ts`, `.tsx`,
`.css`, `.html`, `.htm`, and `.yml` files into `ts-js-css`. Python and Markdown
sections are present but remain empty until category expansion work lands.

## CLI Usage

Install dependencies once:

```bash
npm install
```

Show help and version:

```bash
npm --workspace bus-cli run dev -- --help
npm --workspace bus-cli run dev -- --version
npm --workspace bus-cli run dev -- analyze --help
```

Analyze the current repository and emit agent-readable JSON:

```bash
npm --workspace bus-cli run dev -- analyze . --agent
```

Analyze a prepared legacy git log fixture:

```bash
npm --workspace bus-cli run dev -- analyze --input packages/bus-lib/test/fixtures/legacy-git-log.txt
npm --workspace bus-cli run dev -- analyze --input packages/bus-lib/test/fixtures/legacy-git-log.txt --agent
```

Supported first-slice `analyze` options:

- `--input <file>`
- `--stdin`
- `--repo <path>`
- `--ref <ref>`
- `--format <human|json>`
- `--agent`
- `--no-color`

## Current Docs

Start here:

- [Vision](docs/busfactor2/overview-vision.md)
- [CLI legacy functionality plan](docs/busfactor2/cli-legacy-functionality-plan.md)
- [Milestone 0 completion record](docs/milestone-0/README.md)
- [Using this repo with agents](docs/using-this-repo.md)
- [bus-lib docs](docs/bus-lib/README.md)
- [bus-cli docs](docs/bus-cli/README.md)
- [bus-web docs](docs/bus-web/README.md)

Agent instructions:

- [.github/copilot-instructions.md](.github/copilot-instructions.md)
- [AGENTS.md](AGENTS.md)
- [CLAUDE.md](CLAUDE.md)

## Current Status

The repository default branch is `main`. Milestone 0 is merged to `main`, and
the first CLI legacy functionality slice is also merged.

Complete:

- npm workspace scaffold exists
- Copilot, Codex, and Claude routing files exist
- package-specific docs and work items exist
- `bus-lib` parses legacy git log text and computes real reports
- `bus-cli analyze` uses `bus-lib` for local repo, file, and stdin analysis
- deterministic JSON output is available through `--agent` or `--format json`
- human CLI output includes weekly commits and bus factor rows
- `bus-web` builds and tests as a smoke React app
- Vitest runs in all packages
- Husky + lint-staged git hooks are installed
- the original static browser app is preserved under `legacy/`
- the new repository remote is `toddwseattle/busfactor2`

Current follow-up focus:

- expand `bus-lib` categories beyond legacy compatibility into TS/JS/CSS,
  Python, and Markdown
- migrate `bus-web` from smoke UI to real upload and report rendering
- add later CLI features such as Markdown/NDJSON output, `--output`, threshold
  overrides, row limits, and `--fail-on-risk`

## Workspace Commands

Use these commands for current workspace verification:

```bash
npm install
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-cli run dev -- --version
npm --workspace bus-cli run dev -- analyze --help
npm --workspace bus-cli run dev -- analyze --agent
npm --workspace bus-cli run dev -- analyze . --agent
npm --workspace bus-cli run dev -- analyze --input packages/bus-lib/test/fixtures/legacy-git-log.txt --agent
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
