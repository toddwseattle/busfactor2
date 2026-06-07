# Busfactor2 Codex Agent Instructions

This file is for Codex-compatible agents. The source of truth for repository
conventions is `.github/copilot-instructions.md`.

## Precedence

1. `.github/copilot-instructions.md` is authoritative.
2. `AGENTS.md` and `CLAUDE.md` are routing helpers.
3. Other markdown docs provide context only when they do not conflict with the
   source of truth.

When conflicts exist, follow `.github/copilot-instructions.md`.

## Package Agent Prompts

Use these files when relevant:

- `.github/agents/bus-lib-function.md`
- `.github/agents/bus-cli-yargs.md`
- `.github/agents/bus-web-react.md`

## Project Docs

- `docs/busfactor2/overview-vision.md`
- `docs/using-this-repo.md`
- `docs/milestone-0/README.md`
- `docs/bus-lib/README.md`
- `docs/bus-cli/README.md`
- `docs/bus-web/README.md`

## Intended Commands

These commands are expected after Milestone 0 scaffolding lands:

```bash
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-web run dev
```
