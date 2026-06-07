# Milestone 0 Git Hooks Plan

Milestone 0 should add local git hooks so humans and agents catch cheap issues
before commits and pushes.

## Recommendation

Use Husky + lint-staged for Milestone 0.

Reasons:

- The project is an npm workspace, and Husky is a conventional fit for npm-based
  git hooks.
- Husky's current setup path creates `.husky/pre-commit` and updates the root
  `prepare` script.
- lint-staged is built for running tools only against staged files, which keeps
  pre-commit checks fast.
- lint-staged documents monorepo support through package-local configuration
  when needed.
- Prettier's own docs list lint-staged as the right option when formatting is
  combined with other code quality tools.

Lefthook is a valid alternative if Busfactor2 later needs faster parallel hooks,
more complex multi-runtime orchestration, or a single YAML hook config. It is not
necessary for Milestone 0.

## Hook Philosophy

Hooks should be fast and local. They should not replace CI.

Use hooks to catch:

- formatting issues
- obvious lint issues
- broken typecheck before push
- broken tests before push

Do not use hooks for:

- long-running integration tests
- network-dependent checks
- full release validation
- anything that would make agents routinely need `--no-verify`

## Planned Dependencies

Root dev dependencies:

```text
husky
lint-staged
prettier
```

ESLint can be added when the workspace lint story is defined. Until then, hooks
should not reference lint scripts that do not exist.

## Planned Root Scripts

Add these root scripts during workspace setup:

```json
{
  "scripts": {
    "prepare": "husky",
    "lint-staged": "lint-staged",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "precommit": "lint-staged",
    "prepush": "npm run typecheck --workspaces && npm run test --workspaces"
  }
}
```

`prepare` installs Husky hooks after `npm install`.

## Planned Files

```text
.husky/
  pre-commit
  pre-push
lint-staged.config.mjs
.prettierignore
```

Recommended `.husky/pre-commit`:

```sh
npm run lint-staged
```

Recommended `.husky/pre-push`:

```sh
npm run prepush
```

Recommended `lint-staged.config.mjs`:

```js
export default {
  "*.{js,jsx,ts,tsx,json,css,md,yml,yaml}": "prettier --write",
};
```

## Acceptance

Milestone 0 hook setup is complete when:

- `npm install` installs Husky hooks.
- `git commit` runs lint-staged through `.husky/pre-commit`.
- `git push` runs typecheck and tests through `.husky/pre-push`.
- hook commands are documented in `README.md` and
  `docs/using-this-repo.md`.
- CI or explicit verification remains the source of truth.

## Future Reassessment

Revisit the hook manager if:

- pre-push is too slow for normal development
- hooks need package-aware parallel execution
- non-Node tooling becomes a first-class part of the repo
- the team sees recurring Husky install or shell portability issues

The main alternative to evaluate is Lefthook, which supports a central
`lefthook.yml`, parallel jobs, and multi-language installation paths.

## References

- [Husky get started](https://typicode.github.io/husky/get-started.html)
- [lint-staged README](https://github.com/lint-staged/lint-staged)
- [Prettier pre-commit hook docs](https://prettier.io/docs/precommit)
- [Lefthook documentation](https://lefthook.dev/)
