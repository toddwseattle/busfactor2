# Busfactor2 Claude Code Instructions

Use this file as a Claude-specific routing layer. The source of truth is
`.github/copilot-instructions.md`.

## Precedence

1. `.github/copilot-instructions.md` is authoritative.
2. This file provides Claude-specific routing only.
3. Other docs are context only when they do not conflict with the source of truth.

If any rule in this file conflicts with `.github/copilot-instructions.md`, follow
`.github/copilot-instructions.md`.

## Package Agent Prompts

Use the relevant prompt before making package-specific changes:

- Shared library work: `.github/agents/bus-lib-function.md`
- CLI/yargs work: `.github/agents/bus-cli-yargs.md`
- React web work: `.github/agents/bus-web-react.md`

## Repository Anchors

- Product vision: `docs/busfactor2/overview-vision.md`
- Human-agent guide: `docs/using-this-repo.md`
- Milestone 0: `docs/milestone-0/README.md`
- Library docs: `docs/bus-lib/README.md`
- CLI docs: `docs/bus-cli/README.md`
- Web docs: `docs/bus-web/README.md`
- Web design template: `docs/bus-web/web-design-template.md`

## Intended Commands

These commands are expected after Milestone 0 scaffolding lands:

```bash
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-web run dev
```
