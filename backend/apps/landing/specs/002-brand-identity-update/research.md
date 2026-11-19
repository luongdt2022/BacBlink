# Research: Brand Identity Update

## Decision: Color System

**Chosen Approach**: Convert brand HEX colors to `oklch` for the primary `theme.css` tokens, while maintaining HEX values in comments for reference.
**Rationale**: The current project uses Tailwind v4 with `oklch` variables in `theme.css`. Using `oklch` allows for better color manipulation (e.g., generating shades, adjusting lightness for dark mode) while staying consistent with the existing codebase.

### Color Mapping (HEX to OKLCH)

- **Deep Teal (#137F79)**: `oklch(0.48 0.08 185)`
- **Teal Green (#00A388)**: `oklch(0.60 0.14 175)`
- **Light Olive Green (#9DCE77)**: `oklch(0.80 0.14 135)`
- **Bright Cyan (#15BCD4)**: `oklch(0.72 0.12 210)`
- **Royal Blue (#0D64B0)**: `oklch(0.45 0.15 250)`

## Decision: Typography Integration

**Chosen Approach**: Self-host Inter and Roboto fonts using `@font-face` in `src/styles/fonts.css`.
**Rationale**: Self-hosting ensures privacy, better performance (no external DNS lookups), and offline availability. Inter 4.0 is available as a variable font, which is ideal for performance.

## Decision: Information Hierarchy (60-30-10)

**Chosen Approach**: Map `Teal Green` to `--primary`, `Light Olive Green` to `--secondary`, and `Bright Cyan/Royal Blue` to `--accent`.
**Rationale**: This aligns with the brand manual's distribution rule. Teal Green (60%) becomes the primary identity color, Olive (30%) supports sections, and Cyan/Blue (10%) provides highlights.

## Alternatives Considered

- **Alternative**: Using HEX directly in `theme.css`.
  - **Rejected Because**: Breaks consistency with existing `oklch` tokens and makes dark mode adaptation harder.
- **Alternative**: Google Fonts CDN.
  - **Rejected Because**: Potential layout shift (CLS) and privacy concerns.
