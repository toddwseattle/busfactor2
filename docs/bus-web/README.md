# Bus Web Documentation

`bus-web` is the React + Vite web app for Busfactor2. It should preserve the
upload-first workflow of the current static app while consuming shared analysis
from `bus-lib`.

## Responsibilities

- Let a user upload a git log text file.
- Call `bus-lib` to analyze the uploaded text.
- Render weekly commit counts.
- Render bus factor sections for `overall`, `ts-js-css`, `python`, and
  `markdown`.
- Present sections as tabs or collapsible panels.
- Offer download/export affordances after the report schema stabilizes.

## Runtime Boundary

Allowed:

- React.
- Vite.
- Browser file APIs.
- React Testing Library.
- UI-specific formatting.

Not allowed:

- Running git commands.
- Importing Node-only APIs.
- Duplicating parsing, scoring, or category rules from `bus-lib`.
- Copying design docs from another project.

## Planned Source Layout

```text
packages/bus-web/
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

## Current UI Shape

The current web package renders smoke content only:

- app title
- upload placeholder
- section navigation placeholders
- visible section labels for Overall, TS/JS/CSS, Python, and Markdown
- proof that the app can import a public value from `bus-lib`

`bus-lib` now exposes the analyzer. The next web work is replacing the smoke UI
with real upload, analysis, report rendering, empty/loading/error states, and
tests that consume `bus-lib` report output.

## Testing

Use Vitest plus React Testing Library.

Minimum coverage:

- app renders without crashing
- upload control is labelled
- section tabs or collapsible controls are accessible
- report data is rendered from `bus-lib` output
- empty, loading, and error states are covered once real upload parsing lands

## Design Documentation

Start design work from `docs/bus-web/web-design-template.md`.

Do not copy a `DESIGN.md` from another project. The template is intentionally
blank enough to let Busfactor2 define its own visual system.

## Agent Entry Points

- Agent prompt: `.github/agents/bus-web-react.md`
- Work items: `docs/bus-web/work-items.md`
- Design template: `docs/bus-web/web-design-template.md`
