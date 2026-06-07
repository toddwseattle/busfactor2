web application/stitch/projects/17853970719971116361/screens/47148c74ebdc49378089ba395036aab1

# Gitstats Component Architecture

To build the Gitstats dashboard effectively in React, I recommend the following component structure. This modular approach ensures reusability, especially for the complex data tables and status indicators.

## 1. Layout Components

- **`Layout`**: The main wrapper that manages the page structure.
- **`TopNavBar`**: Contains the logo, "Bus Factor" title, section navigation links (Weekly Commits, Bus Factor Analysis), and the "Open Upload" action.

## 2. Summary & Visualization Components

- **`DashboardOverview`**: The top section container for stats and charts.
- **`StatCard`**: Reusable card for single metrics (Total Authors, Tracked Files, etc.).
- **`LanguagePieChart`**: A wrapper for the file distribution visualization.

## 3. Weekly Commits Components

- **`WeeklyCommitsSection`**: The container for the activity heatmap.
- **`ActivityHeatmap`**: A specialized table component that renders the author activity grid.
- **`ActivityCell`**: A smart cell that determines background intensity based on commit count.

## 4. Bus Factor Analysis Components

- **`BusFactorAnalysis`**: The main container for language-specific analysis.
- **`LanguageAccordion`**: A collapsible wrapper for language groups.
- **`LanguageSummaryHeader`**: The header for the accordion, displaying summary stats (Edits, Risk Files, File Share).
- **`FileAnalysisTable`**: The core table for file-level data.
- **`FileRow`**: Represents a single file, managing risk highlights and contributor stats.

## 5. UI Primaries (Shared)

- **`StatusBadge`**: Renders "High Risk" or "Low Familiarity" labels with color-blind friendly styling.
- **`Button`**: Modern button component following "Academic Precision" styling.
- **`Icon`**: Unified icon component for risk markers and navigation.

## 6. Theme & Tokens

- **`DesignTokens`**: Centralized configuration for Northwestern Purple (#4E2A84), Heritage Orange, and Northwestern Gold.
