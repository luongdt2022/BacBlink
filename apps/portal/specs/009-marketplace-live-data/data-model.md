# Data Model: Marketplace Live Data

**Branch**: `009-marketplace-live-data` | **Date**: 2026-04-03

## Overview

This feature does not add new backend entities. It maps existing intake and sector data into the Marketplace page view model and simplifies the visible filter state.

## Existing Domain Data Reused

### Intake List Item

Represents one live marketplace record candidate returned by the intake list source.

| Field | Type | Purpose in this feature |
|-------|------|-------------------------|
| `id` | `string` | Stable identity for card click and tab placement |
| `title` | `string` | Primary marketplace card title |
| `type` | `'ip' \| 'challenge'` | Determines whether the item belongs to the IP or Challenge tab |
| `profilePicUrl` | `string \| null \| undefined` | Card image when available |
| `createdAt` | `string` | Available fallback metadata for challenge/detail displays if needed |
| `status` | `'draft' \| 'published'` | Optional visibility guard if the implementation decides to exclude non-published entries from the marketplace view |

### Intake Sector

Represents a live relation between an intake and one or more sectors.

| Field | Type | Purpose in this feature |
|-------|------|-------------------------|
| `sectorId` | `string` | Matches filter selections |
| `sector.name` | `string` | Human-readable label for cards or filter mapping |

### Sector

Represents one live sector option returned by the sector catalog source.

| Field | Type | Purpose in this feature |
|-------|------|-------------------------|
| `id` | `string` | Stable filter key |
| `name` | `string` | Filter label shown to users |

## New Frontend View State

### Marketplace Dataset State

Tracks live results loaded into the page.

| Field | Type | Description |
|-------|------|-------------|
| `records` | `MarketplaceRecord[]` | Normalized live records available to the page |
| `isLoadingRecords` | `boolean` | Page loading state for the intake dataset |
| `recordLoadError` | `string \| null` | Optional page-level failure state |

### Filter State

Tracks the supported live filters only.

| Field | Type | Description |
|-------|------|-------------|
| `searchQuery` | `string` | Keyword filter applied to the current live dataset |
| `selectedSectorIds` | `string[]` | Active live sector filters for the current tab |
| `availableSectors` | `Sector[]` | Filter options loaded from the sector catalog |
| `isLoadingSectors` | `boolean` | Loading state for sector options |

### Marketplace Card Media State

Tracks whether a card uses original media or the shared default placeholder.

| Field | Type | Description |
|-------|------|-------------|
| `imageUrl` | `string` | The resolved image URL used by the card |
| `usesDefaultImage` | `boolean` | Whether the card is falling back to the default image |

## Normalized Frontend Record

### MarketplaceRecord

Frontend-friendly representation used by the page and cards.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Card identity |
| `type` | `'ip' \| 'challenge'` | Tab placement |
| `title` | `string` | Card heading |
| `ownerLabel` | `string` | Secondary label such as owner or enterprise text |
| `sectorIds` | `string[]` | Used for sector filtering |
| `imageUrl` | `string` | Original or default image URL |

## State Transitions

### Page Load Flow

1. Marketplace page opens.
2. System requests live intake records and live sector options.
3. Intake records are normalized into marketplace records.
4. Records are split into IP and Challenge tabs based on type.
5. Filter options are rendered from the sector dataset.

### Filtering Flow

1. User enters a keyword and/or selects sectors.
2. The page applies search and sector filters to the active tab's live dataset.
3. The result count and visible cards update together.

### Fallback Image Flow

1. A normalized record is created from a live intake.
2. If the intake image exists, the card uses it.
3. If the intake image is absent, the card uses the shared default image instead.
