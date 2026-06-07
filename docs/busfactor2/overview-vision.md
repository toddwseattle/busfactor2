# Busfactor2 Overview And Implementation Vision

## Purpose

Busfactor2 should evolve the current browser-only Bus Factor analyzer into a TypeScript monorepo with shared analysis logic, a maintained React web app, and a yargs-based CLI that can be invoked reliably by humans and LLM agents.

The current app analyzes uploaded `git log --no-merges --name-status main` output and renders:

- weekly commit counts by author
- per-file bus factor contributions for selected source and documentation files

Busfactor2 should preserve that baseline behavior while adding:

- a CLI entry point suitable for terminal use and agent automation
- deterministic machine-readable report output
- separate bus factor sections for overall activity, TS/JS/CSS files, Python files, and Markdown files
- Vitest-based tests for the shared library, CLI, and web app
- a TypeScript package structure that keeps parsing, scoring, formatting, CLI, and web UI responsibilities separate
- a new repository target under `toddwseattle/busfactor2`, without pushing changes back to `criesbeck/busfactor`

## Product Vision

Busfactor2 should answer two related questions for small teams:

1. Are contributors participating steadily over time?
2. Which important files are known by too few people?

The web app should remain easy for a person to use by uploading a prepared git log. The CLI should make the same analysis easy to run from a local checkout, CI job, or LLM tool call.

The CLI should be explicit, repeatable, and parseable. An LLM should be able to call it, receive structured output, and make grounded recommendations without scraping prose tables.

## Target Users

- Developers reviewing team participation and knowledge spread.
- Team leads looking for high-risk files before planning work.
- Students and instructors using commit history as a collaboration signal.
- LLM agents that need to inspect repository ownership patterns and return structured findings.
- CI workflows that want optional bus factor checks or generated artifacts.

## Current State

The existing repository is a static browser app:

- `index.html` loads Vue 3 from a CDN.
- `app.js` contains parsing, filtering, scoring, date bucketing, and file upload helpers.
- `gitstats.js`, `bus-factor.js`, and `upload.js` define Vue components.
- `app.css` contains minimal styling.
- There is no `package.json`, build step, TypeScript config, test runner, or CLI.

The current analyzer tracks file edits matching:

```text
js, jsx, ts, tsx, css, html, htm, yml
```

It ignores paths containing:

```text
node_modules, build, dist
```

It uses a 7-day half-life decay model to compute file activity, then marks contributors as active when their decayed contribution is at least 5 percent of the file's total frecency.

## Repository Direction

The working branch can be developed locally from the existing `criesbeck/busfactor` clone, but the new project should be published as:

```text
toddwseattle/busfactor2
```

Recommended GitHub transition:

1. Create a new empty `toddwseattle/busfactor2` repository.
2. Update `origin` or add a new remote such as `busfactor2`.
3. Keep original attribution in the README and package metadata.
4. Avoid opening pull requests against `criesbeck/busfactor`.

## Target Monorepo Layout

Use npm workspaces with three packages:

```text
/
  package.json
  package-lock.json
  tsconfig.base.json
  docs/
    using-this-repo.md
    agents/
      README.md
    bus-cli/
      README.md
      work-items.md
    busfactor2/
      overview-vision.md
    bus-lib/
      README.md
      work-items.md
      new-function-agent-guide.md
    bus-web/
      README.md
      work-items.md
      web-design-template.md
    milestone-0/
      README.md
      work-items.md
      repo-cutover.md
      smoke-package-contracts.md
      legacy-source-plan.md
      git-hooks.md
  legacy/
    criesbeck-browser-app/
  packages/
    bus-lib/
      package.json
      tsconfig.json
      vitest.config.ts
      src/
        index.ts
        analyzer.ts
        categories.ts
        git-log.ts
        report.ts
        types.ts
      test/
        fixtures/
        analyzer.test.ts
        git-log.test.ts
    bus-cli/
      package.json
      tsconfig.json
      vitest.config.ts
      src/
        index.ts
        commands/
          analyze.ts
        formatters/
          human.ts
          json.ts
          markdown.ts
    bus-web/
      package.json
      tsconfig.json
      vite.config.ts
      vitest.config.ts
      index.html
      src/
        main.tsx
        App.tsx
        components/
          UploadPanel.tsx
          CommitStatsTable.tsx
          BusFactorSection.tsx
          ReportTabs.tsx
```

Recommended package names:

- `bus-lib`: shared parsing and analysis library
- `bus-cli`: yargs-powered command line app
- `bus-web`: browser app

If publishing to npm becomes a goal later, rename packages to a scope such as `@toddwseattle/busfactor-lib`, `@toddwseattle/busfactor-cli`, and `@toddwseattle/busfactor-web`.

## Shared Library Responsibilities

`bus-lib` should own all behavior that must stay consistent between web and CLI:

- parse git log text
- optionally collect git log text from a repository helper abstraction
- classify file paths into report categories
- apply ignore rules
- compute weekly commits by author
- compute per-file edit history
- compute decayed file activity
- compute active contributor counts
- create stable report objects
- expose pure functions with no browser or terminal dependencies

`bus-lib` should not depend on React, yargs, console rendering libraries, or Node-only process state unless those functions are isolated behind explicit Node entry points.

## Report Sections And File Categories

The report should have four visible sections:

- `overall`: all tracked file categories combined
- `ts-js-css`: TypeScript, JavaScript, and CSS files
- `python`: Python files
- `markdown`: Markdown files

`overall` is derived from the other tracked categories. It should not be configured as an independent matcher because that would risk double-counting. The file categories should be mutually exclusive, and the overall section should be the sum of the selected category reports.

Recommended default source categories:

| Category    | Extensions                           | Output table                          |
| ----------- | ------------------------------------ | ------------------------------------- |
| `ts-js-css` | `.ts`, `.tsx`, `.js`, `.jsx`, `.css` | TypeScript, JavaScript, and CSS files |
| `python`    | `.py`, `.pyi`, `.ipynb` optional     | Python files                          |
| `markdown`  | `.md`, `.mdx`, `.markdown`           | Markdown files                        |

Recommended default ignore paths:

```text
node_modules/
build/
dist/
coverage/
.git/
.next/
.nuxt/
.venv/
venv/
__pycache__/
```

Markdown files should be reported separately from source code because they usually represent docs ownership, not runtime ownership. Python files should be separate because a repository may have both TypeScript/JavaScript/CSS and Python service or automation code, and combining them can hide ownership risk. The overall section should still make the aggregate risk picture easy to scan.

The library should support custom categories later, but the first implementation can hard-code these defaults and expose a typed config object. Legacy HTML/YAML tracking can be added as an explicit compatibility category or an option later; the first Busfactor2 visible sections should follow `overall`, `ts-js-css`, `python`, and `markdown`.

## Git Log Input Strategy

Support two input modes:

1. Existing mode: parse uploaded or provided git log text.
2. CLI convenience mode: run `git log` from a local repository and analyze the result.

For compatibility, `bus-lib` should continue parsing the existing default `git log --no-merges --name-status main` shape.

For new CLI-generated logs, prefer a more stable format:

```text
git log --no-merges --name-status --date=iso-strict --format=commit:%H%nAuthor:%an <%ae>%nDate:%ad%nSubject:%s
```

This reduces locale ambiguity and makes test fixtures more reliable. The parser can support both old and new formats during migration.

## Analysis Model

The current scoring model should remain the default:

- commits are grouped into weeks ending on Sunday
- file edit activity uses exponential decay
- default half-life is 7 days
- default active contributor threshold is 5 percent
- files are sorted by total decayed activity, descending
- files with fewer than 3 active contributors are considered bus factor risks

Expose these as configuration:

```ts
export interface AnalysisOptions {
  activeThreshold: number;
  halfLifeDays: number;
  riskContributorCount: number;
  categories: FileCategory[];
  ignorePatterns: RegExp[];
}
```

The report should include enough raw counts and computed values for both terminal display and agent reasoning.

## Report Shape

Use a stable, versioned report model. Agents should not have to parse human tables.

Example high-level shape:

```ts
export interface BusfactorReport {
  schemaVersion: "busfactor.report.v1";
  generatedAt: string;
  source: {
    mode: "git-log" | "repository" | "stdin";
    ref?: string;
    path?: string;
  };
  options: {
    activeThreshold: number;
    halfLifeDays: number;
    riskContributorCount: number;
  };
  authors: string[];
  weeks: string[];
  commitStats: AuthorCommitStats[];
  sections: SectionReport[];
  summary: ReportSummary;
}
```

Each `SectionReport` should contain one table of file ownership data. The first section should be `overall`, followed by the configured source categories:

```ts
export interface SectionReport {
  id: "overall" | "ts-js-css" | "python" | "markdown" | string;
  label: string;
  sourceCategoryIds: string[];
  files: FileContributionReport[];
  riskFiles: FileContributionReport[];
}
```

For `overall`, `sourceCategoryIds` should include the selected source categories that were summed, for example `["ts-js-css", "python", "markdown"]`.

Each file report should include:

- path
- total edit count
- total frecency
- active contributor count
- risk boolean
- last edited date
- per-author edit counts
- per-author last edited date
- per-author frecency and percentage contribution
- per-author active contributor boolean

## CLI Vision

Use yargs for command construction, validation, help output, and command aliases.

Primary command:

```text
busfactor analyze [path]
```

Examples:

```text
busfactor analyze --repo . --ref main
busfactor analyze --input ~/gitlog.txt
cat ~/gitlog.txt | busfactor analyze --stdin
busfactor analyze --repo . --format json --output busfactor-report.json
busfactor analyze --repo . --format markdown --sections summary,commits,overall,ts-js-css,python,markdown
```

Recommended options:

| Option                         | Purpose                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | -------- | -------- | --------------------------------------- |
| `--repo <path>`                | Run git log inside a local repository.                                                         |
| `--ref <ref>`                  | Git ref or branch to analyze. Default: `main`.                                                 |
| `--input <file>`               | Analyze an existing git log text file.                                                         |
| `--stdin`                      | Read git log text from standard input.                                                         |
| `--format <human               | json                                                                                           | markdown | ndjson>` | Select output format. Default: `human`. |
| `--agent`                      | Shortcut for deterministic agent output. Equivalent to JSON, no color, stable ordering.        |
| `--output <file>`              | Write report output to a file instead of stdout.                                               |
| `--sections <list>`            | Include selected sections: `summary`, `commits`, `overall`, `ts-js-css`, `python`, `markdown`. |
| `--categories <list>`          | Analyze selected source categories: `ts-js-css`, `python`, `markdown`. Default: all.           |
| `--threshold <number>`         | Active contributor threshold. Default: `0.05`.                                                 |
| `--half-life-days <number>`    | Decay half-life. Default: `7`.                                                                 |
| `--risk-contributors <number>` | Minimum active contributors before a file is not risky. Default: `3`.                          |
| `--top <number>`               | Limit rows per bus factor section.                                                             |
| `--no-color`                   | Disable terminal colors. Useful for agents and CI logs.                                        |
| `--fail-on-risk`               | Exit non-zero when risky files are found. Useful for CI.                                       |

Input precedence should be explicit:

1. `--input`
2. `--stdin`
3. `--repo`
4. positional path, interpreted as a repo path

If no input is provided, default to `--repo .`.

## Human Console Output

The default `human` output should be compact and readable:

```text
Busfactor2 report
Source: . at main
Authors: 4
Weeks: 12
Risk files: 7

Summary
  Overall: 33 files, 7 risky
  TS/JS/CSS: 18 files, 4 risky
  Python: 6 files, 2 risky
  Markdown: 9 files, 1 risky

Weekly commits
  Author          Total  2026-05-17  2026-05-24  2026-05-31
  Alice          14     4           6           4
  Bob            7      1           2           4

Overall bus factor
  File                         Active  Risk  Alice  Bob  Chris
  src/app.ts                   1       yes   92%    8%   0%
  scripts/import.py            2       yes   65%    35%  0%
  docs/setup.md                1       yes   100%   0%   0%

TS/JS/CSS bus factor
  File                         Active  Risk  Alice  Bob  Chris
  src/app.ts                   1       yes   92%    8%   0%

Python bus factor
  File                         Active  Risk  Alice  Bob  Chris
  scripts/import.py            2       yes   65%    35%  0%

Markdown bus factor
  File                         Active  Risk  Alice  Bob  Chris
  docs/setup.md                1       yes   100%   0%   0%
```

Human output can use colors when stdout is a TTY:

- red or pink for risky files
- yellow for low file familiarity
- muted text for zero contribution

Color should be disabled automatically when writing to a file, and always disabled by `--agent` or `--no-color`.

## Agent-Readable Output

The `--agent` mode should optimize for deterministic structured data:

```text
busfactor analyze --repo . --agent
```

Recommended behavior:

- output JSON only
- no ANSI color
- no prose
- stable sort order
- include `schemaVersion`
- include all configured source categories plus the derived `overall` section
- exit code `0` unless analysis failed or `--fail-on-risk` is supplied

The JSON should be directly usable by other tools. It should avoid locale-dependent dates by using ISO 8601 dates internally and only formatting local dates in human renderers.

For streaming or multi-repo automation, add `--format ndjson` after the JSON format is stable. NDJSON can emit one object per section or per file risk finding.

## Web App Vision

`bus-web` should preserve the current upload-first workflow:

1. User exports a git log.
2. User uploads the log file.
3. App renders weekly commits and bus factor tables.
4. App renders an overall bus factor section plus TS/JS/CSS, Python, and Markdown sections.

Recommended web stack:

- Vite
- React
- TypeScript
- Vitest
- React Testing Library
- import analysis functions from `bus-lib`

The web app should not reimplement parsing or scoring. It should call the shared library and render the report.

Useful web enhancements after parity:

- section tabs or collapsible panels for `overall`, `ts-js-css`, `python`, and `markdown`
- summary counts at the top
- downloadable JSON report
- optional threshold controls
- clearer copy for TS/JS/CSS, Python, Markdown, and overall ownership

## TypeScript Migration Strategy

Migrate in small, verifiable steps:

1. Add root `package.json`, npm workspaces, TypeScript, and a test runner.
2. Extract current pure logic from `app.js` into `packages/bus-lib/src`.
3. Add fixtures that represent current git log input.
4. Write tests proving current weekly commit counts and bus factor scores are preserved.
5. Add source category support for TS/JS/CSS, Python, and Markdown, plus a derived overall section.
6. Build `bus-cli` around the shared report API with yargs.
7. Convert the web app to Vite, React, and TypeScript.
8. Retire the root static JavaScript files after `bus-web` reaches parity.

This order keeps the core analyzer stable while the project structure changes around it.

## Testing Plan

Use Vitest throughout the workspace:

- `bus-lib`: Vitest for parser, classification, scoring, and report-shape tests.
- `bus-cli`: Vitest for argument parsing, input resolution, formatters, and command behavior.
- `bus-web`: Vitest plus React Testing Library for components and upload/report rendering.

Minimum tests:

- parse authors from default git log output
- parse dates and commit timestamps
- parse changed files and status codes
- ignore delete-only changes unless intentionally supported later
- ignore configured build and dependency paths
- classify files into TS/JS/CSS, Python, and Markdown categories
- derive the overall section as the sum of selected source categories
- compute weekly commit buckets
- compute frecency and contribution percentages
- detect active contributors by threshold
- detect risky files by active contributor count
- produce stable JSON report snapshots
- render CLI human output without throwing

Fixtures should include:

- multiple authors
- multiple weeks
- JavaScript, TypeScript, and CSS files
- Python files
- Markdown files
- ignored paths
- deleted files
- renamed files, even if first support is documented as limited

## Build And Scripts

Recommended root scripts:

```json
{
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "typecheck": "npm run typecheck --workspaces",
    "lint": "npm run lint --workspaces",
    "dev:web": "npm --workspace bus-web run dev",
    "dev:cli": "npm --workspace bus-cli run dev"
  }
}
```

Recommended package scripts:

- `bus-lib`: `build`, `test`, `typecheck`
- `bus-cli`: `build`, `test`, `typecheck`, `dev`
- `bus-web`: `build`, `test`, `typecheck`, `dev`

## CLI Implementation Notes

`bus-cli` should keep command code thin:

- yargs parses and validates arguments
- input loader reads stdin, file, or git log
- shared library analyzes data
- formatter writes human, JSON, Markdown, or NDJSON output
- command returns a clear exit code

Recommended internal flow:

```text
yargs argv
  -> resolve input source
  -> load git log text
  -> create AnalysisOptions
  -> analyzeGitLog(text, options)
  -> format report
  -> write stdout or output file
  -> set exit code
```

Avoid putting analysis rules in the CLI package. If a web view and CLI command need the same answer, the answer belongs in `bus-lib`.

## Git Command Execution

For `--repo`, the CLI can use Node's `child_process` to run git:

```text
git -C <repo> log --no-merges --name-status --date=iso-strict --format=...
```

Use safe argument arrays instead of shell string concatenation. This is important for repository paths with spaces and for agent safety.

The CLI should report clear errors for:

- missing git executable
- path is not a git repository
- unknown ref
- empty git log
- unreadable input file
- malformed git log

## Output Files

When `--output` is provided:

- write exactly the selected format to the target file
- keep stdout minimal, for example `Wrote busfactor report to <path>` for human mode
- print no extra stdout in `--agent` mode unless the output format itself goes to stdout

For CI and agent use, it may be useful to support:

```text
busfactor analyze --repo . --format json --output reports/busfactor.json
busfactor analyze --repo . --format markdown --output reports/busfactor.md
```

## Markdown Report Output

Markdown output should be useful for PR comments or project docs:

- summary section
- weekly commit table
- overall bus factor table
- TS/JS/CSS bus factor table
- Python bus factor table
- Markdown bus factor table
- concise risk notes

Markdown should remain deterministic so it can be snapshot tested.

## CI Use Cases

Busfactor2 should eventually support CI workflows:

```text
busfactor analyze --repo . --format markdown --output busfactor.md
busfactor analyze --repo . --agent --fail-on-risk
```

`--fail-on-risk` should be opt-in. The tool should not make bus factor risk a default build failure because risk may be expected in small or early projects.

## Backward Compatibility

Keep the existing uploaded git log workflow working through the first TypeScript version.

Compatibility requirements:

- existing `git log --no-merges --name-status main > ~/gitlog.txt` output should parse
- existing JavaScript, TypeScript, and CSS file analysis should still appear in the `ts-js-css` section
- current threshold and decay defaults should be preserved
- README should stay current with the repository state; full end-user CLI and web usage details should be added after those packages are implemented

## Documentation Plan

Initial docs:

- `README.md`: user-facing install and usage guide
- `docs/using-this-repo.md`: human guide for assigning bounded work to agents
- `docs/busfactor2/overview-vision.md`: detailed implementation plan
- `docs/milestone-0/README.md`: agent-ready repository, workspace, smoke package, and repo cutover plan
- `docs/milestone-0/git-hooks.md`: Husky + lint-staged hook setup and rationale
- `docs/bus-lib/README.md`: shared library package documentation
- `docs/bus-lib/new-function-agent-guide.md`: guide for adding library functions consumed by CLI/web/other projects
- `docs/bus-cli/README.md`: CLI package documentation
- `docs/bus-web/README.md`: React web package documentation
- `docs/bus-web/web-design-template.md`: Busfactor2-specific design documentation template
- `.github/copilot-instructions.md`, `AGENTS.md`, and `CLAUDE.md`: agent routing and repository rules
- `docs/busfactor2/cli.md`: CLI reference after the yargs interface is implemented
- `docs/busfactor2/report-schema.md`: JSON schema and examples after schema stabilizes
- `docs/busfactor2/migration-notes.md`: notes from browser-only app to workspace project

## Suggested Milestones

### Milestone 0: Agent-Ready Smoke Workspace And Repo Cutover

- Add Copilot, Codex, and Claude agent files.
- Replace the top-level README with current Busfactor2 guidance.
- Add `docs/using-this-repo.md` for humans coordinating work with agents.
- Add package documentation under `docs/bus-lib`, `docs/bus-cli`, and `docs/bus-web`.
- Add Milestone 0 planning docs under `docs/milestone-0`.
- Create root npm workspace scaffolding.
- Create smoke versions of `bus-lib`, `bus-cli`, and `bus-web`.
- Add Husky + lint-staged local hooks.
- Preserve current static app files under `legacy/criesbeck-browser-app`.
- Create and push the Milestone 0 branch to `toddwseattle/busfactor2`.

Exit criteria:

- `npm install` succeeds.
- `npm run build --workspaces`, `npm run test --workspaces`, and `npm run typecheck --workspaces` succeed.
- `bus-cli` help works through the workspace script.
- `bus-web` builds as a React + Vite app.
- local hooks run staged-file checks before commit and workspace checks before push.
- legacy static app files are available for migration reference.
- no work is pushed back to `criesbeck/busfactor`.

### Milestone 1: Workspace Hardening And Public Contracts

- Replace smoke-only exports with initial real public types and package boundaries.
- Confirm workspace scripts, TypeScript references, Vitest configs, and package exports are stable.
- Add initial fixture-based tests that will support analyzer migration.
- Keep root package metadata aligned with `toddwseattle/busfactor2`.

Exit criteria:

- CLI and web packages consume `bus-lib` only through public package exports.
- test fixtures exist for legacy git log inputs.
- package docs match implemented package boundaries.

### Milestone 2: Shared Analyzer

- Port parser and scoring logic from `app.js` to `bus-lib`.
- Preserve current behavior with tests.
- Expose typed report model.

Exit criteria:

- fixture reports match expected authors, weeks, files, and active contributor counts.

### Milestone 3: File Category Expansion

- Add TS/JS/CSS, Python, and Markdown source categories.
- Produce separate `SectionReport` entries plus a derived overall section.
- Add source category and overall rollup tests.

Exit criteria:

- one fixture produces four bus factor sections: overall, TS/JS/CSS, Python, and Markdown.

### Milestone 4: CLI

- Add yargs command structure.
- Implement `busfactor analyze`.
- Support `--repo`, `--input`, `--stdin`, `--format`, `--agent`, `--output`, and threshold options.
- Add CLI tests around argument parsing and formatter output.

Exit criteria:

- `busfactor analyze --input fixture.log --format human` prints readable tables.
- `busfactor analyze --input fixture.log --agent` prints valid JSON.

### Milestone 5: Web Migration

- Create Vite React app in `bus-web`.
- Rebuild upload flow using shared library.
- Render commit stats and section-specific bus factor tables.
- Present overall, TS/JS/CSS, Python, and Markdown sections as tabs or collapsible panels.

Exit criteria:

- uploaded legacy git log renders equivalent commit data plus overall, TS/JS/CSS, Python, and Markdown sections.

### Milestone 6: Release Readiness

- Update README with web and CLI usage.
- Confirm GitHub repository metadata, package names, CI, and docs are ready for normal development.

Exit criteria:

- `toddwseattle/busfactor2` contains the verified workspace project.
- README explains web and CLI usage.
- no pull request is opened against `criesbeck/busfactor`.

## Risks And Decisions

### Date Handling

The current implementation uses locale-formatted Sunday labels. The library should use ISO dates internally and let formatters choose display text. This prevents agent and CI output from changing by machine locale.

### Rename Handling

The current code has a TODO for deletes and renames. Git rename lines can include both old and new paths. First implementation should document current behavior and add tests before changing semantics.

### Commit Counting Versus File Edits

Weekly commit counts are author-level commit counts. Bus factor tables are file edit counts weighted by recency. Keep these concepts distinct in types and documentation.

### Markdown Ownership

Markdown files can be generated or project metadata-heavy. The default ignore rules should avoid generated docs directories only when clearly generated. Do not ignore all docs by default.

### Agent Output Stability

Machine-readable output should never depend on terminal width, colors, locale date strings, or object key insertion accidents. Add snapshot tests for JSON output.

## Definition Of Done

Busfactor2 is ready when:

- the project is a TypeScript npm workspace
- shared analysis logic lives in `bus-lib`
- the CLI uses yargs and can analyze a repo, file, or stdin
- human console output includes weekly commits plus overall, TS/JS/CSS, Python, and Markdown bus factor sections
- agent output is deterministic JSON with a documented schema version
- the web app imports the same shared analyzer
- tests cover parser behavior, category classification, scoring, and CLI output
- docs explain both web and CLI usage
- the repository is set up for `toddwseattle/busfactor2`
