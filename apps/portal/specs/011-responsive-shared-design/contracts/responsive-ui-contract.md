# UI Contract: Shared Responsive Design

**Feature**: `011-responsive-shared-design`

## Purpose

Define the shared UI behavior contract for responsive layouts so representative screens remain functionally usable across mobile, tablet, and desktop while preserving current style direction.

## Viewport Classes

| Class | Validation Width | Intent |
|-------|------------------|--------|
| `mobile` | 360px | Primary narrow-screen usability |
| `tablet` | 768px | Mid-width layout stability |
| `desktop` | Existing baseline | Current web behavior reference |

## Shared Shell Contract

| Area | Required Behavior |
|------|-------------------|
| Navigation | Must remain accessible on all classes; controls must not overlap content |
| Main content container | Must avoid horizontal overflow in primary flows |
| Section spacing | Must follow a consistent spacing scale across pages with class-appropriate compaction |
| Header/action region | Must keep key actions visible and tappable without clipping |

## Responsive Content Contract

| Pattern | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Card/list blocks | Multi-column allowed | Reduced columns | Single-column priority |
| Filter/action clusters | Inline groups allowed | Wrap when needed | Stack/expand pattern allowed |
| Forms | Multi-column allowed when readable | Mixed layout | Single-column priority with touch-safe controls |
| Empty/loading/error states | Full layout context | Preserved | Preserved without clipped text/actions |

## Style Consistency Contract

- Existing color palette remains unchanged across all viewport classes.
- Existing component shape language (radius, border tone, elevation style) remains consistent.
- Typography hierarchy stays consistent; only responsive sizing/spacing adjustments are allowed.
- No alternate mobile-only visual theme is introduced.

## Reusable Responsive Pattern Contract

Representative pages in this feature adopt one shared implementation pattern:

1. `responsive-page-container`: constrains width and applies shared adaptive page paddings.
2. `responsive-page-stack`: enforces vertical section rhythm with tokenized spacing.
3. `ResponsivePageSection`: wraps functional page blocks with consistent border/background/radius behavior.
4. Data-heavy content: use desktop table at medium/large widths and mobile card/list fallback on narrow widths.
5. Shell alignment: responsive shell must reserve top offset for compact-nav trigger and prevent horizontal overflow.

Any new page that follows this contract can be considered compliant without redefining per-page spacing logic.

## Acceptance Rules

- Any representative screen failing mobile/tablet usability blocks feature acceptance.
- Horizontal scroll is disallowed for primary content flows.
- Critical actions must remain visible and operable in all classes.
- A screen is marked responsive-ready only when shell, content, and style contracts all pass.
