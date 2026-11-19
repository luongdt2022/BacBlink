# Research: Intake Match Tab Refresh

**Branch**: `008-intake-match-tab` | **Date**: 2026-04-02

## Finding 1 - Move match results into the existing main tab system

**Decision**: Add the match-results experience as an additional top-level tab within the existing `Tabs` layout on `IntakeDetailPage`, rather than keeping it as a separate section below the page body.

**Rationale**: The current page already uses a clear tab model for content confidentiality levels. Promoting matching into that same interaction pattern makes the workflow visible without forcing the user to discover a lower-page section by scrolling. This satisfies the request to make "Nhu cầu phù hợp" a prominent tab and keeps navigation within the page consistent.

**Alternatives considered**:
- Keep the current bottom section and just restyle its header: rejected because it does not materially improve discoverability.
- Add a separate route such as `/intakes/:id/matches`: rejected because the spec calls for a more visible in-page experience, not another screen.

## Finding 2 - Use stronger tab emphasis for the matching tab than ordinary content tabs

**Decision**: Treat the matching tab as a highlighted tab trigger that can surface result count and primary-state cues directly in the tab control.

**Rationale**: The feature request is about prominence, not merely relocation. A highlighted tab with a count and stronger emphasis communicates both status and importance before the user clicks. This is more useful than burying count and state only inside the tab content.

**Alternatives considered**:
- Use the same neutral visual style as the other tabs: rejected because it would not satisfy the "nổi bật" requirement.
- Add a badge elsewhere in the sidebar instead of on the tab: rejected because the tab itself is the intended entry point to results.

## Finding 3 - Keep the match-search action in the right sidebar, but redesign it as a stateful CTA card

**Decision**: Preserve the right-sidebar placement of the manual matching action but redesign it to read as a primary CTA area with richer status messaging rather than a plain full-width button.

**Rationale**: The existing feature already trains users to find matching actions in the sidebar. Keeping the location stable reduces behavioral change, while redesigning its presentation improves visibility and perceived importance. This aligns the sidebar CTA with the newly promoted tab in the main content area.

**Alternatives considered**:
- Move the action into the tab content only: rejected because the user explicitly called out redesigning the current search button, not relocating it entirely.
- Add multiple duplicate actions on page: rejected because duplicate CTAs would increase ambiguity.

## Finding 4 - Require confirmation only when current match results exist

**Decision**: Gate reruns behind a confirmation popup only when the intake already has at least one current match result.

**Rationale**: First-time searches should stay fast and direct. The higher-risk action is rerunning matching after users already have a visible result set, because it can refresh or replace what they are currently reviewing. A conditional confirm step prevents accidental reruns without adding friction to the initial use case.

**Alternatives considered**:
- Always ask for confirmation: rejected because it adds unnecessary friction to first-time matching.
- Never ask for confirmation: rejected because it does not protect existing results from accidental reruns.

## Finding 5 - Reuse the existing shared dialog primitives for re-search confirmation

**Decision**: Use the existing shared dialog system already present in the repo for the confirmation popup.

**Rationale**: The codebase already ships with `Dialog` primitives and several confirmation-style modal patterns. Reusing this pattern keeps the new confirmation step visually consistent and avoids inventing a separate confirmation mechanism for a standard blocking decision.

**Alternatives considered**:
- Browser `window.confirm`: rejected due to inconsistent styling and poor UX fit.
- Inline two-click confirmation near the button: rejected because the request explicitly asks for a popup and the action merits a more explicit interruption.

## Finding 6 - Preserve existing matching API and refresh behavior

**Decision**: Continue using the current `computeMatches` action and existing detail-page data source, with the page refreshing or reloading match data using the current detail fetch pattern after a rerun completes.

**Rationale**: This feature is UX-focused. No new backend capability is required by the spec, and the existing API already supports triggering matching. The plan should avoid introducing backend scope unless implementation later proves the current success flow does not update the visible result set sufficiently.

**Alternatives considered**:
- Introduce a new endpoint dedicated to "refresh matches": rejected because there is no evidence the current backend cannot support the UX.
- Add polling for result updates in this feature: rejected for now because the spec asks for confirmation and redesign, not asynchronous live status infrastructure.
