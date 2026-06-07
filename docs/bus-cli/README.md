# Bus CLI Documentation

`bus-cli` is the Node command line package for Busfactor2. It should be usable by
humans at a terminal and by LLM agents that need deterministic structured output.

## Responsibilities

- Define the yargs command surface.
- Read git log input from a repo, file, or stdin.
- Call `bus-lib` for analysis.
- Format reports as human text, JSON, Markdown, or NDJSON.
- Implement agent-friendly output and exit codes.

## Runtime Boundary

Allowed:

- Node filesystem and process APIs.
- yargs.
- `child_process` for git commands, using argument arrays.
- console output and terminal formatting.

Not allowed:

- React or browser-only APIs.
- scoring or parsing rules duplicated from `bus-lib`.
- shell-concatenated user input.

## Planned Source Layout

```text
packages/bus-cli/
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
      ndjson.ts
    input/
      file.ts
      git.ts
      stdin.ts
```

## Initial Command Surface

Primary command:

```bash
busfactor analyze [path]
```

Important options:

- `--repo <path>`
- `--ref <ref>`
- `--input <file>`
- `--stdin`
- `--format <human|json|markdown|ndjson>`
- `--agent`
- `--output <file>`
- `--sections <summary,commits,overall,ts-js-css,python,markdown>`
- `--categories <ts-js-css,python,markdown>`
- `--threshold <number>`
- `--half-life-days <number>`
- `--risk-contributors <number>`
- `--top <number>`
- `--no-color`
- `--fail-on-risk`

## Agent Mode

`--agent` should mean:

- JSON output only.
- No ANSI color.
- No prose.
- Stable ordering.
- Include `schemaVersion`.
- Include all selected source categories plus `overall`.

## Testing

Use Vitest for CLI tests.

Minimum coverage:

- yargs parses expected aliases and defaults
- invalid option combinations fail clearly
- input precedence is deterministic
- git command builder uses argument arrays
- human output is readable
- JSON output is parseable and stable
- `--agent` disables prose and color
- `--fail-on-risk` controls exit behavior

## Agent Entry Points

- Agent prompt: `.github/agents/bus-cli-yargs.md`
- Work items: `docs/bus-cli/work-items.md`
