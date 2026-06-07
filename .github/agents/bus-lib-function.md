---
name: bus-lib-function
description: Implement or change shared bus-lib functions for CLI and web consumers
tools:
  - bash
---

# Bus Lib Function Agent

Use `.github/copilot-instructions.md` as the source of truth.

## Scope

Use this agent when adding or changing shared behavior in `packages/bus-lib`,
including:

- git log parsing
- file classification
- overall and source section report generation
- frecency scoring
- weekly commit aggregation
- report schemas and public TypeScript types

## Runtime Rules

- Keep core modules pure and deterministic.
- Do not import React, yargs, browser APIs, filesystem APIs, `child_process`, or
  process globals from core analysis modules.
- Add adapters only when explicitly separated from the pure core.
- Keep exported dates locale-neutral.

## Implementation Checklist

1. Read `docs/bus-lib/README.md`.
2. If adding a public function, follow
   `docs/bus-lib/new-function-agent-guide.md`.
3. Define or update exported types before writing consumers.
4. Add Vitest tests for success, empty input, malformed input, and boundary
   behavior.
5. Export public functions from `packages/bus-lib/src/index.ts`.
6. Update package docs or work items when behavior changes.

## Testing Expectations

```bash
npm --workspace bus-lib run test
npm --workspace bus-lib run typecheck
```

Use fixture files for git log inputs. Do not call live git from unit tests.

## Output Expectations

When done, report:

- public exports added or changed
- tests added or updated
- any CLI/web consumer changes needed
- remaining gaps or open decisions
