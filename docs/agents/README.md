# Agent File Index

This directory explains how agent-facing files are organized for Busfactor2.

The authoritative project instructions live in:

- `.github/copilot-instructions.md`

Routing files for specific agent tools:

- `AGENTS.md` for Codex-compatible agents.
- `CLAUDE.md` for Claude Code.

Package-specific prompts:

- `.github/agents/bus-lib-function.md`
- `.github/agents/bus-cli-yargs.md`
- `.github/agents/bus-web-react.md`

Package docs:

- `docs/bus-lib/README.md`
- `docs/bus-cli/README.md`
- `docs/bus-web/README.md`

Milestone sequencing:

- `docs/using-this-repo.md`
- `docs/milestone-0/README.md`
- `docs/milestone-0/work-items.md`
- `docs/milestone-0/smoke-package-contracts.md`
- `docs/milestone-0/repo-cutover.md`
- `docs/milestone-0/legacy-source-plan.md`
- `docs/milestone-0/git-hooks.md`

## How Agents Should Choose Context

Use the smallest relevant context:

- Changing shared report behavior: read `docs/bus-lib` and
  `.github/agents/bus-lib-function.md`.
- Changing CLI behavior: read `docs/bus-cli` and
  `.github/agents/bus-cli-yargs.md`.
- Changing React UI behavior: read `docs/bus-web` and
  `.github/agents/bus-web-react.md`.
- Changing repo shape, package scaffolding, or migration order: read
  `docs/milestone-0`.

Do not copy or import design docs from other projects. Start new Busfactor2 web
design work from `docs/bus-web/web-design-template.md`.
