---
name: Academic Precision
colors:
  surface: "#f9f9f9"
  surface-dim: "#dadada"
  surface-bright: "#f9f9f9"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f3f3"
  surface-container: "#eeeeee"
  surface-container-high: "#e8e8e8"
  surface-container-highest: "#e2e2e2"
  on-surface: "#1b1b1b"
  on-surface-variant: "#4a4451"
  inverse-surface: "#303030"
  inverse-on-surface: "#f1f1f1"
  outline: "#7b7482"
  outline-variant: "#ccc3d2"
  surface-tint: "#6f4ca6"
  primary: "#370d6d"
  on-primary: "#ffffff"
  primary-container: "#4e2a84"
  on-primary-container: "#be98f9"
  inverse-primary: "#d6baff"
  secondary: "#a73a1c"
  on-secondary: "#ffffff"
  secondary-container: "#fe7955"
  on-secondary-container: "#6d1700"
  tertiary: "#362600"
  on-tertiary: "#ffffff"
  tertiary-container: "#513b00"
  on-tertiary-container: "#d6a200"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ecdcff"
  primary-fixed-dim: "#d6baff"
  on-primary-fixed: "#280057"
  on-primary-fixed-variant: "#56338c"
  secondary-fixed: "#ffdbd1"
  secondary-fixed-dim: "#ffb4a1"
  on-secondary-fixed: "#3c0800"
  on-secondary-fixed-variant: "#862205"
  tertiary-fixed: "#ffdf9d"
  tertiary-fixed-dim: "#f7be27"
  on-tertiary-fixed: "#251a00"
  on-tertiary-fixed-variant: "#5b4300"
  background: "#f9f9f9"
  on-background: "#1b1b1b"
  surface-variant: "#e2e2e2"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "700"
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style

This design system is engineered for the intersection of academic rigor and high-velocity software engineering. It draws heavily from the identity of Northwestern University to project an image of institutional trust and technical authority.

The visual style is **Corporate / Modern** with a focus on data density and clarity. It utilizes a restrained color palette dominated by Northwestern Purple to maintain a professional, focused atmosphere. The interface emphasizes structural integrity through clean lines and a systematic approach to information hierarchy, ensuring that complex "bus factor" data is digestible yet comprehensive. The aesthetic is "technical-premium"—avoiding unnecessary flourish in favor of functional elegance.

## Colors

The palette is rooted in **Northwestern Purple**, used primarily for headers, primary actions, and brand-level accents. The neutral foundation consists of **Rich Black** for primary text and **Northwestern Gray** for borders and UI dividers.

### Functional Status Palette

To ensure the "bus factor" analysis is color-blind friendly and highly legible:

- **Risk:** Defined by a high-contrast Heritage Orange (#D85D3C). In UI applications, this color should be accompanied by a subtle pattern (e.g., diagonal stripes) or a distinct "Warning" icon to provide double-encoding.
- **Low Familiarity:** Represented by Northwestern Gold (#FFC52F). This serves as a cautionary middle-ground.
- **Normal/No Risk:** Utilizes a transparent background or a very light "Cool Gray" tint to keep the focus on problematic areas.

## Typography

The design system uses **Inter** exclusively to achieve a clean, utilitarian aesthetic that excels in high-density data environments.

- **Headlines:** Use tighter letter-spacing and heavier weights to anchor the page layout.
- **Data Tables:** For file paths and commit hashes, use a monospaced font at a slightly smaller scale (`13px`) to ensure alignment and technical familiarity.
- **Labels:** Use bold, uppercase labels for table headers and metadata to provide clear differentiation from live data values.
- **Mobile Scaling:** Headline sizes should scale down by approximately 20% on mobile devices to prevent excessive wrapping in data-heavy views.

## Layout & Spacing

The layout utilizes a **Fixed Grid** system on desktop to maintain readability of large data tables, transitioning to a fluid model on smaller screens.

- **Grid:** A 12-column grid with 16px gutters.
- **Data Density:** In analytical views, the spacing rhythm shifts to a more compact 4px/8px baseline to allow more information to be visible without scrolling.
- **Table Structure:** Tables should utilize generous horizontal padding (16px) within cells but tight vertical padding (8px) to maximize the "above-the-fold" data count.
- **Breakpoints:**
  - Desktop: 1280px+ (Fixed 1200px container)
  - Tablet: 768px - 1279px (Fluid, 24px margins)
  - Mobile: <767px (Fluid, 16px margins, horizontal scrolling enabled for tables).

## Elevation & Depth

This system favors **Tonal Layers** and **Low-Contrast Outlines** over heavy shadows to keep the interface feeling "flat" and academically precise.

- **Surfaces:** Use a slight off-white or very light gray (#F9F9F9) for container backgrounds to separate them from the pure white page background.
- **Shadows:** When used (primarily on buttons or active dropdowns), shadows are "Ambient"—extremely diffused with a 10% opacity black, intended to provide just enough lift to indicate interactivity.
- **Borders:** Use 1px solid borders in Northwestern Gray (#D8D6D6) for all table cells and input fields. This reinforces the grid-based, technical nature of the tool.

## Shapes

The design system employs a **Soft** shape language. A corner radius of `4px` (0.25rem) is applied to primary UI elements like buttons, input fields, and chips.

- **Standard Elements:** 4px radius.
- **Large Containers:** 8px radius for cards and modal windows.
- **Data Indicators:** Small status dots or square icons should remain sharp or have a minimal 2px radius to maintain a technical, "indicator-light" feel.

## Components

- **Buttons:** Primary buttons use the Northwestern Purple background with white text and a subtle 4px corner radius. Secondary buttons use a Northwestern Gray outline.
- **Data Tables:** The core of the product. Use zebra-striping (very faint gray) for long rows. Headers must be "sticky" to maintain context during scroll.
- **Bus Factor Chips:** Status indicators for "Risk" should use the Heritage Orange background with a white "!" icon. "Low Familiarity" uses Northwestern Gold with a "?" icon.
- **Input Fields:** Clean, rectangular fields with 1px Northwestern Gray borders. On focus, the border transitions to Northwestern Purple.
- **Cards:** Used for summary statistics (e.g., "Total Authors," "Risk Files"). Use a white background, 1px gray border, and no shadow to maintain a flat, clean look.
- **File Path Links:** Use a blue-toned variant of purple or a standard link blue, always underlined on hover, rendered in the `mono-data` font style.
