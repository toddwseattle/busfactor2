# Repository Cutover Plan

Busfactor2 should be developed in `toddwseattle/busfactor2`, not pushed back to
`criesbeck/busfactor`.

## Recommended Remote Strategy

Use explicit remotes so the original source stays visible:

```bash
git remote rename origin upstream
git remote add origin git@github.com:toddwseattle/busfactor2.git
git remote -v
```

If HTTPS is preferred:

```bash
git remote rename origin upstream
git remote add origin https://github.com/toddwseattle/busfactor2.git
git remote -v
```

Alternative if keeping `origin` pointed at the original during transition:

```bash
git remote add busfactor2 git@github.com:toddwseattle/busfactor2.git
git push -u busfactor2 <branch>
```

## Repository Creation

Create the new repository before changing remotes:

```bash
gh repo create toddwseattle/busfactor2 --public --source=. --remote=origin
```

Use `--private` instead of `--public` if private development is preferred.

## Initial Branch

Recommended branch:

```bash
codex/milestone-0
```

Push after verification:

```bash
git push -u origin codex/milestone-0
```

## Attribution

Preserve attribution to the original project in README or migration docs:

- original repository: `criesbeck/busfactor`
- new repository: `toddwseattle/busfactor2`
- current static app copied for migration into `legacy/criesbeck-browser-app`

## Safety Checks

Before pushing:

```bash
git remote -v
git status --short
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
```

Confirm no remote points accidentally push Milestone 0 work back to
`criesbeck/busfactor`.
