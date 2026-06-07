---
name: bus-cli-yargs
description: Implement or change the yargs-based Busfactor2 CLI
tools:
  - bash
---

# Bus CLI Yargs Agent

Use `.github/copilot-instructions.md` as the source of truth.

## Scope

Use this agent when changing `packages/bus-cli`, including:

- yargs command definitions
- CLI option parsing and validation
- repo, file, and stdin input resolution
- human, JSON, Markdown, and NDJSON formatters
- exit code behavior
- `--agent` and `--fail-on-risk` behavior

## Runtime Rules

- `bus-cli` may use Node APIs and yargs.
- Use `child_process` with argument arrays for git commands. Do not shell-concat
  user-provided paths or refs.
- Do not import React or browser code.
- Keep analysis logic in `bus-lib`; the CLI should orchestrate, not score.
- Disable color for `--agent`, `--no-color`, and file output.

## Implementation Checklist

1. Read `docs/bus-cli/README.md`.
2. Read `docs/bus-cli/work-items.md` for the current CLI scope.
3. Confirm the required library function exists in `bus-lib`; add it there first
   if needed.
4. Add or update yargs command tests with Vitest.
5. Add formatter tests with deterministic expected output.
6. Document option changes in the CLI docs.

## Testing Expectations

```bash
npm --workspace bus-cli run test
npm --workspace bus-cli run typecheck
npm --workspace bus-cli run dev -- --help
```

Unit tests should mock filesystem, stdin, and git command boundaries where
possible.

## Output Expectations

When done, report:

- commands/options changed
- output formats changed
- exit code behavior changed
- tests added or updated
- any changes required in `bus-lib`
