# Using This Repo With Agents

This repository is intended to be friendly to humans working with coding agents.
The docs are structured so agents can take small, bounded tasks without first
reverse-engineering the whole project.

## Start Here

Humans should read:

1. [README](../README.md)
2. [Vision](busfactor2/overview-vision.md)
3. [Milestone 0 plan](milestone-0/README.md)

Agents should start from:

1. `.github/copilot-instructions.md`
2. the relevant package README
3. the relevant `.github/agents/*` prompt
4. the relevant work-item file

## Agent File Map

General agent routing:

- `.github/copilot-instructions.md`: source of truth for all agents
- `AGENTS.md`: Codex routing
- `CLAUDE.md`: Claude routing
- `docs/agents/README.md`: index of agent-facing files

Package-specific prompts:

- `.github/agents/bus-lib-function.md`
- `.github/agents/bus-cli-yargs.md`
- `.github/agents/bus-web-react.md`

Package docs:

- `docs/bus-lib/README.md`
- `docs/bus-cli/README.md`
- `docs/bus-web/README.md`

## How To Assign Work To An Agent

Give the agent:

- the exact package or docs area
- the work-item ID when one exists
- expected verification commands
- whether implementation is allowed or only planning is requested

Good examples:

```text
Implement BL-M0-1 from docs/bus-lib/work-items.md. Use the bus-lib agent prompt.
Run the bus-lib build, typecheck, and test scripts.
```

```text
Update the bus-web design template only. Do not scaffold React code yet.
```

```text
Implement CLI-M0-2. Keep behavior smoke-only and do not migrate parser logic.
```

## Work Boundaries

Use these boundaries to avoid cross-package drift:

- Shared parsing, scoring, and report data belongs in `bus-lib`.
- CLI input handling, yargs options, terminal output, and exit codes belong in
  `bus-cli`.
- Upload UI, React components, tabs/collapsibles, and browser file handling
  belong in `bus-web`.
- Cross-package sequencing belongs in `docs/milestone-0`.

If a change affects more than one package, update the library first, then the
consumers.

## Runtime Rules For Agents

`bus-lib`:

- no React
- no yargs
- no Node filesystem or process APIs in core modules
- no browser APIs
- deterministic output

`bus-cli`:

- Node APIs are allowed
- yargs is allowed
- do not duplicate `bus-lib` analysis logic
- use argument arrays for git commands

`bus-web`:

- React and browser APIs are allowed
- do not run git commands
- do not duplicate parser or scoring logic

## Verification Expectations

Milestone 0 target commands:

```bash
npm run build --workspaces
npm run test --workspaces
npm run typecheck --workspaces
npm --workspace bus-cli run dev -- --help
npm --workspace bus-cli run dev -- analyze --help
npm --workspace bus-cli run dev -- analyze --agent
npm --workspace bus-web run build
npm run lint-staged
```

Package-level work should use package-level commands when available:

```bash
npm --workspace bus-lib run test
npm --workspace bus-cli run test
npm --workspace bus-web run test
```

## Git Hooks

Milestone 0 should add Husky + lint-staged for fast local checks. Hooks are a
local safety net, not the source of truth. CI and explicit verification commands
remain authoritative.

Expected local behavior:

- pre-commit runs staged-file formatting/linting through `lint-staged`
- pre-push runs workspace typecheck and tests once the packages exist
- hooks stay fast enough that humans and agents do not routinely bypass them

If hooks become slow or need richer multi-runtime orchestration, evaluate
Lefthook as a later replacement.

## Human Review Checklist

Before asking an agent to continue, check:

- the latest docs reflect the intended package boundaries
- no package imported internals from another package
- verification output is included in the agent's final response
- docs were updated when public behavior changed
- agent-created work did not push back to `criesbeck/busfactor`

## Commit And PR Guidance

For Milestone 0:

- preserve original project attribution
- push to `toddwseattle/busfactor2`
- do not open pull requests against `criesbeck/busfactor`
- keep commits scoped to a clear workstream when practical
