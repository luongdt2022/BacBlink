# Data Model: Design Tokens

## Brand Design Tokens

These tokens represent the fundamental visual units of the NACENTECH identity. They will be implemented as CSS variables in `src/styles/theme.css`.

### Colors (OKLCH)

| Token Name           | Brand Color       | Value                  | Usage                                 |
| :------------------- | :---------------- | :--------------------- | :------------------------------------ |
| `--brand-deep-teal`  | Deep Teal         | `oklch(0.48 0.08 185)` | Dark backgrounds, high contrast text  |
| `--brand-teal-green` | Teal Green        | `oklch(0.60 0.14 175)` | Primary brand color, Hero backgrounds |
| `--brand-olive`      | Light Olive Green | `oklch(0.80 0.14 135)` | Secondary sections, supporting blocks |
| `--brand-cyan`       | Bright Cyan       | `oklch(0.72 0.12 210)` | Primary accent, Buttons, Hover states |
| `--brand-blue`       | Royal Blue        | `oklch(0.45 0.15 250)` | Secondary accent, Highlights, Links   |

### Semantic Mapping (60-30-10)

| Semantic Token | Brand Token          | Rationale                                 |
| :------------- | :------------------- | :---------------------------------------- |
| `--primary`    | `--brand-teal-green` | Dominant brand color (60%)                |
| `--secondary`  | `--brand-olive`      | Supporting section color (30%)            |
| `--accent`     | `--brand-cyan`       | Interactive/highlight color (10%)         |
| `--foreground` | `--brand-deep-teal`  | High legibility text on light backgrounds |

### Typography

| Token Name         | Value                          | Usage                    |
| :----------------- | :----------------------------- | :----------------------- |
| `--font-sans`      | `Inter, system-ui, sans-serif` | Headlines, Body text     |
| `--font-secondary` | `Roboto, sans-serif`           | Technical data, captions |

## UI Components Mapping

- **Hero Section**: Background uses `--brand-teal-green` or 5-color gradient.
- **Section Headers**: Use `--font-sans` with Bold weight.
- **Buttons**: Background `--brand-cyan`, Hover `--brand-blue`.
- **Secondary Cards**: Background `--brand-olive` with low opacity or as border accent.
