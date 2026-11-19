# Quickstart: Shared Responsive Web Design

## Prerequisites

- Frontend dev server running
- User authenticated
- Browser with responsive device emulation enabled
- Seed data available for list/grid screens and at least one empty/error scenario

---

## 1. Validate shared shell responsiveness

Open representative authenticated routes:

- `/marketplace`
- `/intakes`
- `/infrastructure`
- one service route (for example `/services/tech-expert`)

For each route, check at `360px`, `768px`, and desktop.

**Expected**:
- Navigation remains accessible
- No critical content/action is clipped
- Primary flow does not require horizontal scrolling

---

## 2. Validate layout reflow on content-heavy screens

On `/marketplace` and `/intakes`, switch between viewport classes.

**Expected**:
- Card/list modules reflow cleanly between desktop and narrow widths
- Action bars, tabs, and filters remain usable
- Result/action text remains readable

---

## 3. Validate touch-friendly interaction behavior

At mobile width (`360px`), test common controls:

- tab switches
- filter toggles/dropdowns
- primary action buttons
- form inputs (on a create/edit page if available)

**Expected**:
- Controls are tappable without overlap
- Interaction states are visible
- Input controls stay within viewport bounds

---

## 4. Validate style consistency across breakpoints

Compare the same screens on desktop and mobile.

**Expected**:
- Color palette remains the same
- Component style language remains the same
- Typography hierarchy is consistent with responsive adjustments only

---

## 5. Validate state rendering on narrow screens

Trigger or simulate loading, empty, and error states on representative pages.

**Expected**:
- Messages and actions are readable on mobile width
- State blocks do not overflow horizontally
- Users can recover from error states without layout breakage

---

## 6. Regression check after responsive pass

Repeat steps 1-5 after all responsive updates are applied.

**Expected**:
- No route in the representative set regresses to non-responsive behavior
- Shared shell and page-level patterns remain consistent
- Responsive behavior is stable across multiple route transitions

---

## Baseline Notes (Captured During Implementation)

- High-priority routes with pre-refactor density issues: `/marketplace`, `/intakes`, `/infrastructure`, `/intakes/detail`, and `/services/*` list pages.
- Primary recurring issue pattern: desktop-first table/control clusters on narrow widths.
- Applied shared fix pattern:
  - tokenized container spacing (`responsive-page-container`, `responsive-page-stack`)
  - reusable section wrapper (`ResponsivePageSection`)
  - card fallback for table-heavy pages at small viewports.

Use these notes as the reference baseline for future responsive QA and follow-up pages.
