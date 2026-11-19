# UI Contract: Intake Detail Match Tab Refresh

**Feature**: `008-intake-match-tab`

## Purpose

Define the UI behavior contract for promoting match results into a prominent tab and adding confirmation before rerunning matching on the Intake Detail page.

## Inputs

### Intake Detail Payload

The page consumes the existing intake detail data source.

Required UI-facing fields:

| Field | Meaning |
|-------|---------|
| `id` | Current intake identifier |
| `type` | Determines counterpart label |
| `status` | Determines whether matching action is available |
| `matches` | Existing counterpart result set |

## Derived UI Rules

### Match Tab Label

| Intake Type | Tab Label |
|-------------|-----------|
| `ip` | `Nhu cầu phù hợp` |
| `challenge` | `Giải pháp phù hợp` |

### Match Tab Summary State

| Condition | Expected Tab State |
|-----------|--------------------|
| `matches.length > 0` | Highlighted tab with visible count |
| `matches.length === 0` or no `matches` | Highlighted tab without count, empty-state content inside |

### Match Search CTA Behavior

| Condition | Click Result |
|-----------|--------------|
| `status !== 'published'` | Action unavailable |
| `status === 'published'` and no existing matches | Start matching immediately |
| `status === 'published'` and existing matches | Open confirmation popup |
| `isMatching === true` | Ignore repeat click / keep action disabled |

## Confirmation Popup Contract

### Trigger Condition

Open only when:

- the intake is eligible for manual matching, and
- at least one current match result already exists

### Required Content

- Title explaining the user is about to search again
- Body copy explaining that a new search will rerun matching for the current intake
- Explicit `Confirm` action
- Explicit `Cancel` action

### Required Outcomes

| User Action | System Outcome |
|-------------|----------------|
| Cancel | Close popup, preserve current page state |
| Confirm | Close popup, start match request, show normal loading feedback |

## Result Content Contract

### When Results Exist

- Match tab shows the current result count
- Tab content shows the existing match cards
- Users can review results without scrolling to a separate lower-page section

### When No Results Exist

- Match tab still exists and remains discoverable
- Tab content shows an empty state
- Empty state should orient users toward the match-search action
