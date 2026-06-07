---
name: bus-web-react
description: Implement or change the React + Vite Busfactor2 web app
tools:
  - bash
---

# Bus Web React Agent

Use `.github/copilot-instructions.md` as the source of truth.

## Scope

Use this agent when changing `packages/bus-web`, including:

- React components
- upload flow
- report summary presentation
- section tabs or collapsible panels
- tables for `overall`, `ts-js-css`, `python`, and `markdown`
- downloadable report output
- web-specific Vitest and React Testing Library tests

## Runtime Rules

- `bus-web` may use React, Vite, DOM APIs, and browser file upload APIs.
- Do not run git commands from the browser app.
- Do not duplicate parsing, scoring, or category rules. Use `bus-lib`.
- Keep accessibility in mind: tabs, buttons, file inputs, and tables need usable
  roles, labels, and keyboard behavior.
- Use the Busfactor2 design template, not design docs copied from another
  project.

## Implementation Checklist

1. Read `docs/bus-web/README.md`.
2. Read `docs/bus-web/web-design-template.md` before adding visual patterns.
3. Confirm the needed report data exists in `bus-lib`.
4. Add or update React Testing Library tests near the component.
5. Keep components focused and named exports explicit.
6. Update docs when adding a user-facing workflow.

## Testing Expectations

```bash
npm --workspace bus-web run test
npm --workspace bus-web run typecheck
npm --workspace bus-web run build
```

Prefer `getByRole`, `getByLabelText`, and visible text queries. Avoid test IDs
unless accessible queries are impractical.

## Output Expectations

When done, report:

- user-visible behavior changed
- components added or changed
- tests added or updated
- any `bus-lib` report data requirements
