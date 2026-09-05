# Research: Marketplace Live Data

**Branch**: `009-marketplace-live-data` | **Date**: 2026-04-03

## Finding 1 - Reuse the authenticated intake list as the live Marketplace source

**Decision**: Use the existing authenticated intake list as the initial live dataset for the Marketplace page, limited to the first page of 10 records.

**Rationale**: The requested scope explicitly points the page at the authenticated intake source. This avoids inventing a new marketplace-specific backend contract and allows the frontend to ship a real-data marketplace quickly using already available entities.

**Alternatives considered**:
- Continue with mock data until a separate marketplace API exists: rejected because the user explicitly asked to switch to live data now.
- Use the public intake listing instead of the authenticated source: rejected because the requested endpoint for this iteration is the authenticated list.

## Finding 2 - Split Marketplace tabs by intake type after loading one shared dataset

**Decision**: Fetch one live intake result set, then derive the IP and Challenge marketplace tabs client-side by filtering on the intake type.

**Rationale**: The page already uses a two-tab structure. Keeping one source fetch and splitting it into the two existing marketplace areas minimizes integration complexity and keeps the current UX intact.

**Alternatives considered**:
- Fetch separate datasets per tab: rejected because it adds more requests without a clear requirement.
- Collapse both types into a single mixed result list: rejected because it would break the current tabbed information architecture.

## Finding 3 - Drive sector filters from the live sector catalog only

**Decision**: Replace hard-coded field/filter values with sector options sourced from the sector catalog API.

**Rationale**: Once marketplace records are live, hard-coded sector values become a consistency risk. A shared live vocabulary ensures filters match the intake data model and reduces drift between records and filter choices.

**Alternatives considered**:
- Keep the hard-coded sector list temporarily: rejected because it can become inaccurate immediately.
- Hide all filters until every dimension is supported: rejected because sector filtering is already requested and supported by existing data.

## Finding 4 - Remove unsupported filters instead of showing placeholders

**Decision**: Temporarily remove TRL, Đơn vị, Nguồn cung, and Ngân sách filters from the live-data marketplace UI.

**Rationale**: Unsupported filter controls create misleading expectations and dead-end interactions. Hiding them is cleaner than displaying inactive controls or deriving unreliable approximations from fields that are not part of the current live marketplace contract.

**Alternatives considered**:
- Leave the filters visible but disabled: rejected because it still adds clutter and raises questions for users.
- Fill the removed filters with mock or inferred values: rejected because that would undermine the move to trustworthy live data.

## Finding 5 - Keep existing card layouts but normalize missing values

**Decision**: Preserve the current card components and map live intake data into their display model, providing a default image when no profile picture is present.

**Rationale**: The current cards already express the intended marketplace layout. The problem is data sourcing, not card structure. Normalizing missing values at the mapping layer keeps UI changes small while delivering a complete live experience.

**Alternatives considered**:
- Redesign the cards entirely for the live-data rollout: rejected because it expands scope away from the data integration request.
- Allow image areas to remain empty when no picture exists: rejected because broken visual blocks reduce perceived quality immediately.

## Finding 6 - Preserve keyword search as an in-memory refinement on loaded results

**Decision**: Keep the existing keyword search interaction and apply it on top of the loaded live records together with sector filtering.

**Rationale**: Search already exists in the page mental model and does not require a separate backend search contract for this iteration. Applying it client-side to the loaded result set satisfies the feature without adding scope.

**Alternatives considered**:
- Remove search entirely until backend search exists: rejected because it would be a regression from the current page behavior.
- Send every keyword change back to the backend: rejected because the spec does not require live server-side search and the page only loads 10 initial records in this iteration.
