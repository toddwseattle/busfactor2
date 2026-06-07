# New Bus Lib Function Agent Guide

Use this guide when an agent needs to add a new `bus-lib` function for
consumption by `bus-cli`, `bus-web`, or another project.

## Goal

Add shared functionality once, behind a stable TypeScript export, so consumers do
not duplicate parsing, scoring, formatting-neutral transforms, or report logic.

## Pre-Work

1. Read `.github/copilot-instructions.md`.
2. Read `docs/bus-lib/README.md`.
3. Check `docs/bus-lib/work-items.md`.
4. Search existing exports before adding a new function.

## Design The Function

Use this checklist before writing code:

- Is the behavior needed by more than one package?
- Is it runtime-neutral?
- Can it be deterministic?
- Does it need an options object?
- What should happen for empty, malformed, or unsupported input?
- What exact type should consumers import?

If the function needs filesystem, git, process, DOM, or console behavior, split
the pure logic into `bus-lib` and keep the adapter in the consuming package.

## Implementation Pattern

Recommended source shape:

```text
packages/bus-lib/src/
  feature-name.ts
  feature-name.test.ts
  types.ts
  index.ts
```

Recommended function shape:

```ts
export interface BuildThingOptions {
  readonly includeDetails?: boolean;
}

export const buildThing = (
  input: string,
  options: BuildThingOptions = {},
): ThingResult => {
  // Pure deterministic logic only.
};
```

Export from `src/index.ts`:

```ts
export { buildThing } from "./feature-name";
export type { BuildThingOptions, ThingResult } from "./types";
```

## Consumer Contract

Consumers should import from the package root:

```ts
import { buildThing } from "bus-lib";
import type { ThingResult } from "bus-lib";
```

Do not require consumers to import from internal paths such as
`bus-lib/src/feature-name`.

## Tests

Add Vitest coverage for:

- valid input
- empty input
- malformed input
- boundary values
- deterministic sorting
- stable dates or timestamps

Use fixtures for git log text. Do not call live git from `bus-lib` tests.

## Documentation

Update at least one of:

- `docs/bus-lib/README.md` for durable package behavior
- `docs/bus-lib/work-items.md` for planned or follow-up work
- `docs/busfactor2/overview-vision.md` when the function changes project-level
  architecture or report contracts

## Done Checklist

- Function is exported from `src/index.ts`.
- Public types are exported.
- No runtime-boundary violations.
- Tests cover the expected behavior.
- CLI or web consumer imports from the package root.
- Docs mention the new behavior when relevant.
