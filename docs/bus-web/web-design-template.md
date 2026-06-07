# Bus Web Design Template

Use this template when starting the Busfactor2 web app design documentation.

Do not copy `DESIGN.md` from another project. Fill this document with
Busfactor2-specific decisions as the web app takes shape.

## Screen Or Surface Name

Name the screen, route, or major component.

## User Goal

Describe what the user is trying to accomplish in one or two sentences.

## Primary Workflow

List the steps a user should complete:

1. Open the app.
2. Upload or choose git log input.
3. Review summary.
4. Inspect overall and source-specific bus factor sections.
5. Export or copy report data when needed.

## Information Hierarchy

Document what should be most visible:

- report source and generation state
- summary risk counts
- weekly commit table
- overall bus factor section
- TS/JS/CSS bus factor section
- Python bus factor section
- Markdown bus factor section
- export actions

## Interaction Model

Choose and document one:

- tabs
- collapsible panels
- segmented control

Include keyboard behavior and focus management.

## Component Inventory

List expected components:

- `UploadPanel`
- `ReportSummary`
- `CommitStatsTable`
- `ReportTabs` or `ReportAccordion`
- `BusFactorSection`
- `ExportActions`
- `EmptyState`
- `ErrorState`

## Visual Direction

Document Busfactor2-specific choices:

- color tokens
- typography
- spacing scale
- table density
- risk and low-contribution highlights
- responsive behavior

## States

Document required states:

- no file uploaded
- file loading
- parse success
- parse error
- no tracked files
- report generated with risks
- report generated with no risks

## Accessibility

Define requirements:

- labelled file input
- keyboard-accessible tabs or collapsibles
- semantic tables
- text alternatives for color-coded risk
- visible focus states
- no information conveyed by color alone

## Test Notes

List behavior to cover with React Testing Library:

- initial render
- upload interaction
- section navigation
- risk labels
- error state
- export action

## Acceptance Criteria

Define what must be true before this design is implemented.
