# Bus Lib Pluggable File Category Plan

## Goal

Add a general `bus-lib` architecture for source file categories so Markdown,
Python, and future language or filetype support can be added without rebuilding
the analyzer around one hard-coded extension list.

The first implementation target is Markdown scanning, but the design should make
Markdown one default category definition rather than a special case.

## Compatibility Constraint

The current CLI call must keep working:

```ts
const report = analyzeGitLog(input.text, { source: input.source });
```

`bus-cli` should not need to understand language matchers, file extensions, or
overall rollup behavior. It should continue to format `report.sections` in order.

This means the initial implementation should preserve:

- the `analyzeGitLog(text, options?)` public function name and required inputs
- the `BusfactorReport` top-level shape
- the existing `source` option used by `bus-cli`
- default section order: `overall`, `ts-js-css`, `python`, `markdown`
- deterministic JSON suitable for `--agent`

Optional new `bus-lib` options are acceptable if they have defaults and do not
force CLI changes.

## Current Problem

`packages/bus-lib/src/analyzer.ts` currently has one legacy matcher:

- statuses: `A`, `C`, `M`
- extensions: `.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.html`, `.htm`, `.yml`
- ignored path segments: `node_modules`, `build`, `dist`

The analyzer then puts the same legacy file report rows into both `overall` and
`ts-js-css`, while `python` and `markdown` are empty. That works for the first
legacy slice, but it does not scale because adding Markdown by extending the same
extension list would mix categories and make `overall` double-counting harder to
reason about.

## Design Principles

- Keep `bus-lib` pure, deterministic, and runtime-neutral.
- Keep category rules in `bus-lib`; consumers must not duplicate matchers.
- Treat `overall` as a derived section, never as a matcher.
- Make source categories mutually exclusive by default.
- Keep the report formatter contract simple: consumers render section data, not
  classification internals.
- Prefer small typed definitions over plugin loading from the filesystem or
  runtime imports.

## Proposed Architecture

Introduce category definitions in `bus-lib`, likely in a new module such as
`categories.ts`.

```ts
export interface FileCategoryDefinition {
  readonly id: string;
  readonly label: string;
  readonly extensions: readonly string[];
  readonly includeInOverall: boolean;
}
```

Default definitions:

```ts
export const DEFAULT_FILE_CATEGORIES = [
  {
    id: "ts-js-css",
    label: "TS/JS/CSS",
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
    includeInOverall: true,
  },
  {
    id: "python",
    label: "Python",
    extensions: [".py", ".pyi"],
    includeInOverall: true,
  },
  {
    id: "markdown",
    label: "Markdown",
    extensions: [".md", ".mdx", ".markdown"],
    includeInOverall: true,
  },
] as const;
```

The analyzer flow becomes:

1. Parse git log text into commits and changed file rows.
2. Normalize changed paths for matching.
3. Ignore unsupported statuses and ignored path segments.
4. Classify each changed path into one source category.
5. Build file histories per category.
6. Score each category using the existing weighted activity and risk logic.
7. Build `overall` from the scored category file reports whose definitions set
   `includeInOverall: true`.
8. Return sections in stable report order.

The existing report section constants can continue to expose the visible section
list. The new category definitions should be the source of classification rules,
while `DEFAULT_REPORT_SECTIONS` remains the source of presentation order and
labels.

## Classification Rules

Use extension matching after path normalization:

- Normalize `\` to `/` before ignore and extension checks.
- Match extensions case-insensitively by default.
- Match the final filename suffix, not any earlier path segment.
- Keep only tracked status codes `A`, `C`, and `M` for activity rows.
- Preserve the legacy behavior where delete-only commits still count in weekly
  commit stats but deleted file rows do not count toward file activity.
- Keep ignored path segments as shared defaults: `node_modules`, `build`, and
  `dist`.

Markdown default extensions:

- `.md`
- `.mdx`
- `.markdown`

Recommended exclusions from Markdown for the first implementation:

- no special handling for generated docs beyond existing ignored path segments
- no syntax-aware parsing of Markdown content
- no separate category for README files
- no frontmatter parsing

Future category definitions can add `predicate` support if extension matching is
not enough, but the first slice should avoid that unless tests prove it is
needed.

## Category Conflicts

The default categories should be mutually exclusive by extension. If a future
custom category set creates a conflict, the classifier should use definition
order as the deterministic tie-breaker.

Implementation guidance:

- Return the first matching category.
- Document that custom category order matters.
- Add a test proving duplicate extension definitions are deterministic.

This avoids making the public report carry one file in multiple category
sections, which would make `overall` ambiguous.

## Overall Rollup

`overall` should be built from already-classified source category histories, not
by re-running a broad matcher.

Preferred implementation:

- collect file histories keyed by category id
- build `FileContributionReport[]` for each category
- concatenate the included category file reports for `overall`
- sort the overall files with the same comparator used for category files
- compute `overall.totalFiles` and `overall.riskFiles` from that concatenated
  list

This preserves the existing report shape while preventing double-counting from
category overlap.

## Public API Shape

Keep the current CLI-compatible API:

```ts
analyzeGitLog(text, { source });
```

Add optional category configuration behind the same options object:

```ts
analyzeGitLog(text, {
  source,
  categories: DEFAULT_FILE_CATEGORIES,
});
```

Potential exported types:

```ts
export type DefaultReportSectionId =
  | "overall"
  | "ts-js-css"
  | "python"
  | "markdown";

export interface FileCategoryDefinition {
  readonly id: string;
  readonly label: string;
  readonly extensions: readonly string[];
  readonly includeInOverall?: boolean;
}

export interface BusfactorAnalysisOptions {
  readonly activeThreshold: number;
  readonly halfLifeDays: number;
  readonly riskContributorCount: number;
  readonly source?: BusfactorReportSource;
  readonly categories?: readonly FileCategoryDefinition[];
}
```

The default keeps the CLI unchanged. CLI and web can later expose category
selection or custom categories by passing options through, but they do not need
that for Markdown scanning.

## Type Strategy

The existing `ReportSectionId` union is useful for default sections, but it is a
bad fit for a genuinely pluggable category system because every new category
would require widening the union before callers could configure it.

Preferred type direction:

- keep a `DefaultReportSectionId` union for built-in defaults
- allow `FileCategoryDefinition.id` to be any non-empty string
- allow `BusfactorReportSection.id` to be a string in the public report type
- keep `DEFAULT_SECTION_IDS` as the typed default list for built-in sections

This preserves the current CLI interface because `bus-cli` already iterates
`report.sections` and prints each section's `label`, counts, and file rows. It
does not need exhaustive handling for section ids.

If widening `BusfactorReportSection.id` to `string` feels too disruptive for the
first Markdown implementation, use a two-step migration:

1. Keep default built-in categories typed by the existing union while extracting
   the classifier architecture.
2. Widen report section ids to strings only when custom categories become a real
   consumer requirement.

## Git Log Parsing Integration

`parseGitLog` should stay focused on parsing `git log --name-status` text. It
should not classify paths.

Integration points:

- `GitFileChange` remains `{ status, path }`.
- Rename-aware status formats can be added later if needed.
- Classification belongs after parsing and before scoring.
- Weekly commit stats continue to use all parsed commits, including commits
  where no file change matches a category.

The current parser only handles single-letter status lines. Before expanding
rename support, add tests that document current behavior for `R100 old new` and
`C100 old new` lines. If the implementation starts supporting multi-field
name-status rows, keep that parser behavior separate from category matching.

## Tests And Fixtures

Add deterministic `bus-lib` fixtures rather than live git commands.

Suggested fixtures:

- `category-git-log.txt`: contains TS/JS/CSS, Python, Markdown, ignored paths,
  unsupported extensions, and delete-only commits.
- `markdown-git-log.txt`: focused Markdown fixture with `.md`, `.mdx`, and
  `.markdown` files across multiple authors and weeks.
- `category-conflict-git-log.txt`: small fixture or inline input for duplicate
  extension category-order behavior if custom categories are exposed.

Test coverage:

- default categories classify Markdown into the `markdown` section
- Python files no longer stay empty when `.py` or `.pyi` files are present
- TS/JS/CSS no longer includes legacy HTML/YAML unless compatibility is
  intentionally preserved
- ignored path segments apply to every category
- unsupported statuses are excluded from file activity
- delete-only commits affect weekly commit counts but not file reports
- `overall` equals the included source category file rows
- default `analyzeGitLog(text, { source })` keeps CLI-compatible behavior
- empty input still returns stable empty sections
- malformed date or author lines remain deterministic

## CLI Impact

No CLI code change should be required for the Markdown slice if `bus-lib`
preserves `analyzeGitLog(text, { source })` and the report schema shape.

Expected CLI behavior after the library change:

- human output automatically shows Markdown rows because it iterates
  `report.sections`
- JSON and `--agent` output automatically include populated `markdown` and
  `overall` sections
- CLI tests may need fixture expectation updates if default category behavior
  intentionally stops mapping legacy `.html`, `.htm`, and `.yml` files into
  `ts-js-css`

If keeping legacy HTML/YAML in `ts-js-css` makes the category design ugly, prefer
one of these options:

1. Keep a temporary `legacy-compatible` category preset in `bus-lib` and let the
   default move to clean source categories.
2. Add a CLI option such as `--category-preset <default|legacy>` only if users
   still need first-slice legacy parity.
3. Keep `bus-cli` defaulting to the clean `bus-lib` default and update CLI
   snapshots to reflect Markdown/Python category expansion.

The cleaner design is to remove HTML/YAML from `ts-js-css` default categories
and document that the earlier mapping was a compatibility bridge.

## Web Consumer Impact

No web code change should be required for the smoke UI because it already reads
public section constants. Once real upload/report rendering exists, the web app
should render populated Markdown data from the same report object and should not
own any category matchers.

If the web app later exposes category selection, it should import public
category definitions or option types from `bus-lib` and pass selected categories
to `analyzeGitLog`.

## Edge Cases

Path handling:

- Windows separators in fixture paths.
- Uppercase extensions such as `README.MD`.
- Extension-like directory names such as `docs.md/file`.
- Root files such as `README.md`.
- Dotfiles such as `.markdownlint.md`.

Git status handling:

- deleted files remain excluded from file activity.
- renamed files should be documented before implementation because name-status
  lines contain old and new paths.
- copied files currently use status `C`; parser support for similarity scores
  should be clarified before relying on it.

Category handling:

- duplicate extension definitions use first-match wins.
- categories with `includeInOverall: false` appear in their own section but do
  not affect `overall`.
- empty categories still appear as empty report sections.
- unsupported filetypes are ignored rather than placed in an `other` section.

Report stability:

- authors remain sorted.
- weeks remain ISO Sunday dates.
- category file sorting remains weighted activity descending with stable
  encounter-order fallback.
- overall sorting uses the same comparator as category sorting.

## Implementation Sequence

1. Add category types and default category definitions in `bus-lib`.
2. Extract path normalization, ignore checks, status checks, and extension
   matching into pure helpers.
3. Add classifier tests before changing analyzer behavior.
4. Refactor analyzer collection from one legacy file set to per-category file
   histories.
5. Build category sections from per-category histories.
6. Derive `overall` from included category report rows.
7. Add Markdown and mixed-category fixtures.
8. Update `docs/bus-lib/README.md` to describe category defaults and Markdown
   support.
9. Update CLI tests only where report expectations change because the library
   now returns populated source categories.
10. Run `npm --workspace bus-lib run test` and
    `npm --workspace bus-lib run typecheck`, then run affected CLI tests if
    snapshots or formatter expectations changed.

## Open Decisions

- Should `.html`, `.htm`, and `.yml` remain in a legacy preset only, or stay in
  `ts-js-css` until a larger category cleanup?
- Should `.ipynb` join the Python category now or wait for notebook-specific
  handling?
- Should custom categories be public in the first implementation, or should the
  first slice only export default definitions and keep override support internal?
- Should category definitions allow arbitrary predicates later, or are extension
  lists enough for Busfactor2's current scope?
