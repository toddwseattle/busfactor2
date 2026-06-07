# Legacy Source Preservation Plan

The current repository is a static browser app. Milestone 0 should preserve that
implementation in a stable location so agents can migrate from it without
depending on root files that will change during workspace setup.

## Target Location

```text
legacy/
  criesbeck-browser-app/
    README.md
    index.html
    app.js
    bus-factor.js
    gitstats.js
    upload.js
    app.css
    images/
```

## Files To Preserve

- original app `README.md` from `criesbeck/busfactor` or git history
- `index.html`
- `app.js`
- `bus-factor.js`
- `gitstats.js`
- `upload.js`
- `app.css`
- `images/bus-factor-1.png`
- `images/bus-factor-2.png`

## Legacy README Requirements

Add `legacy/criesbeck-browser-app/README.md` with:

- original repository attribution: `criesbeck/busfactor`
- statement that files are copied for migration reference
- original browser-app usage details from `criesbeck/busfactor` or git history
  because the top-level Busfactor2 README is now current project guidance
- instruction not to modify legacy files unless intentionally updating the
  migration snapshot
- map from legacy files to target packages:

| Legacy file                       | Target                                           |
| --------------------------------- | ------------------------------------------------ |
| `app.js` parser/scoring functions | `packages/bus-lib`                               |
| `app.js` `loadFile` helper        | `packages/bus-web` upload adapter                |
| `bus-factor.js`                   | `packages/bus-web` bus factor section components |
| `gitstats.js`                     | `packages/bus-web` commit stats table            |
| `upload.js`                       | `packages/bus-web` upload panel                  |
| `app.css`                         | `packages/bus-web` styles/design system          |
| `index.html`                      | `packages/bus-web/index.html`                    |

If the root `README.md` has already been replaced with Busfactor2 content, do
not copy it into legacy as the old app README. Recover the original README from
the original source remote or git history.

## Migration Rules

- Treat legacy files as read-only reference after Milestone 0.
- Port behavior through tests in `bus-lib` before rewriting UI.
- Keep parser and scoring behavior out of React components.
- Preserve compatibility with existing `git log --no-merges --name-status main`
  output until explicitly changed.

## Acceptance

Milestone 0 is complete only when the legacy snapshot exists and an agent can
understand where each old file should migrate.
