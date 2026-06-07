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

Implemented first-slice options:

- `--repo <path>`
- `--ref <ref>`
- `--input <file>`
- `--stdin`
- `--format <human|json>`
- `--agent`
- `--no-color`

Planned later options include Markdown/NDJSON output, `--output`, section and
category selection, threshold overrides, `--top`, and `--fail-on-risk`.

Input precedence for the first slice is:

1. `--input <file>`
2. `--stdin`
3. positional `path`
4. `--repo <path>`, defaulting to `.`

Repository input runs `git -C <repo> log --no-merges --name-status <ref>` using
argument arrays. The default ref is `main` to match the legacy browser app usage.

## Agent Mode

`--agent` should mean:

- JSON output only.
- No ANSI color.
- No prose.
- Stable ordering.
- Include `schemaVersion`.
- Include all selected source categories plus `overall`.

For the first slice, `--agent` is equivalent to JSON output and does not change
the process exit code for risky files. Non-zero exits are reserved for input,
parse, or command failures.

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
