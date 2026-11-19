# Data Model: Intake Match Tab Refresh

**Branch**: `008-intake-match-tab` | **Date**: 2026-04-02

## Overview

This feature does not introduce new backend entities. It adds frontend view-state around the existing intake detail and match result data so the page can present matching as a primary tab and conditionally confirm reruns.

## Existing Domain Data Reused

### Intake

Represents the current detail-page record.

| Field | Type | Purpose in this feature |
|-------|------|-------------------------|
| `id` | `string` | Identifies the intake for rerun actions |
| `type` | `'ip' \| 'challenge'` | Drives whether the tab label shows "Nhu cầu phù hợp" or "Giải pháp phù hợp" |
| `status` | `'draft' \| 'published'` | Determines whether the manual matching action is available |
| `matches` | `IntakeMatch[] \| undefined` | Determines whether the tab shows results, an empty state, or requires rerun confirmation |

### IntakeMatch

Represents one current counterpart result shown in the matching tab.

| Field | Type | Purpose in this feature |
|-------|------|-------------------------|
| `id` | `string` | Stable result identity for rendering |
| `score` | `number` | Existing relevance metadata displayed in match cards |
| `computedAt` | `string` | Indicates result freshness if surfaced in the UI |
| `ipIntake` / `challengeIntake` | `Intake \| undefined` | Provides counterpart intake details shown in cards |

## New Frontend View State

### Match Tab State

Tracks the state of the newly elevated matching tab on the detail page.

| Field | Type | Description |
|-------|------|-------------|
| `activeTab` | `string` | Current detail-page tab selection, now including the match tab |
| `hasMatches` | `boolean` | Derived from `intake.matches.length > 0` |
| `matchCount` | `number` | Derived count displayed on the tab and empty/result states |

### Match Search CTA State

Tracks the status of the redesigned match-search action.

| Field | Type | Description |
|-------|------|-------------|
| `isMatching` | `boolean` | Prevents duplicate requests and drives loading feedback |
| `isEligibleForMatching` | `boolean` | Derived from published-state rules |
| `requiresResearchConfirmation` | `boolean` | Derived from `hasMatches` before a click proceeds |

### Re-search Confirmation State

Tracks the blocking confirmation dialog shown before rerunning matching.

| Field | Type | Description |
|-------|------|-------------|
| `showResearchConfirm` | `boolean` | Whether the popup is visible |
| `pendingAction` | `rerun \| none` | User intent awaiting confirmation |

## State Transitions

### Match Search Flow

1. User lands on Intake Detail page.
2. System derives `hasMatches` and `matchCount` from the current intake payload.
3. If the intake is published and `hasMatches === false`, clicking the CTA starts matching immediately.
4. If the intake is published and `hasMatches === true`, clicking the CTA opens the confirmation popup.
5. If the user confirms, matching starts and the CTA enters loading state.
6. When matching completes, the detail view refreshes and the tab reflects the latest result set.

### Confirmation Flow

1. Existing matches are present.
2. User clicks the redesigned CTA.
3. Popup opens with confirm and cancel actions.
4. Cancel closes the popup and preserves the current result set.
5. Confirm closes the popup and proceeds to the normal match-start flow.
