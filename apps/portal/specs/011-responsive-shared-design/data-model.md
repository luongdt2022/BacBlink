# Data Model: Shared Responsive Web Design

**Branch**: `011-responsive-shared-design` | **Date**: 2026-04-06

## Overview

This feature introduces no backend schema changes. It defines a frontend design-state model for shared responsive behavior across representative screens.

## Design Entities

### Responsive Layout Profile

Defines expected layout behavior for a screen across viewport classes.

| Field | Type | Description |
|-------|------|-------------|
| `screenKey` | `string` | Stable identifier for a target page/screen |
| `viewportClass` | `mobile \| tablet \| desktop` | Viewport class being validated |
| `contentFlow` | `single-column \| split-layout \| mixed` | Expected section stacking strategy |
| `navMode` | `drawer \| collapsible-rail \| fixed-rail` | Expected navigation presentation |
| `actionPlacement` | `inline \| stacked \| pinned` | Expected action/control placement |
| `overflowAllowed` | `boolean` | Whether horizontal overflow is acceptable (`false` for primary flows) |

### Shared Style Ruleset

Captures non-negotiable style consistency constraints across breakpoints.

| Field | Type | Description |
|-------|------|-------------|
| `paletteSource` | `string` | Current approved color system reference |
| `shapeLanguage` | `string` | Expected radius/border/visual tone consistency |
| `typographyHierarchy` | `string` | Rules for heading/body emphasis consistency |
| `themeDriftAllowed` | `boolean` | Whether alternate visual themes are allowed (`false`) |

### Screen Readiness Record

Tracks completion status for each representative screen in the responsive pass.

| Field | Type | Description |
|-------|------|-------------|
| `screenKey` | `string` | Matched to responsive layout profile |
| `route` | `string` | Route path used for validation |
| `mobilePass` | `boolean` | 360px validation result |
| `tabletPass` | `boolean` | 768px validation result |
| `desktopPass` | `boolean` | Desktop baseline validation result |
| `notes` | `string` | QA comments or known constraints |

## Derived View State

### Responsive Shell State

| Field | Type | Description |
|-------|------|-------------|
| `isNavCollapsed` | `boolean` | Sidebar collapse/expand state on supported widths |
| `isNavDrawerOpen` | `boolean` | Mobile drawer visibility state |
| `activeBreakpoint` | `mobile \| tablet \| desktop` | Current active viewport class |

### Responsive Section State

| Field | Type | Description |
|-------|------|-------------|
| `isSectionStacked` | `boolean` | Whether major content sections are stacked vertically |
| `isControlWrapped` | `boolean` | Whether action controls move to wrapped/stacked rows |
| `hasCriticalOverflow` | `boolean` | Signals overflow risk for primary content/actions |

## State Transitions

### Viewport Transition

1. Viewport crosses a responsive threshold.
2. `activeBreakpoint` updates.
3. Shell and section layout states recompute.
4. Navigation and content areas reflow using shared profile rules.

### Responsive Validation Flow

1. Tester opens a target route.
2. Tester validates layout profile at mobile, tablet, desktop classes.
3. Readiness record is updated with pass/fail and notes.
4. Screen is marked ready when all target classes pass.

### Style Consistency Flow

1. Screen is validated against shared style ruleset.
2. Visual drift checks compare color/shape/typography signals across breakpoints.
3. Any drift is recorded as a design defect before acceptance.
