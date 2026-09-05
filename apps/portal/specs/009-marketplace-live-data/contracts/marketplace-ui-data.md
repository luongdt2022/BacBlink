# UI Data Contract: Marketplace Live Data

**Feature**: `009-marketplace-live-data`

## Purpose

Define how the Marketplace page consumes live intake records and sector options to produce the two marketplace tabs, supported filters, and image fallbacks.

## Input Sources

### Live Intake List

The Marketplace page consumes the first page of the authenticated intake list.

Required UI-facing fields:

| Field | Meaning |
|-------|---------|
| `id` | Card identity and detail navigation target |
| `type` | Decides IP tab vs Challenge tab |
| `title` | Primary card title |
| `profilePicUrl` | Card image when available |
| `intakeSectors` or equivalent sector relation | Used for sector filtering |

### Live Sector List

The Marketplace page consumes the sector catalog to render filter choices.

Required UI-facing fields:

| Field | Meaning |
|-------|---------|
| `id` | Stable filter key |
| `name` | User-facing filter label |

## Derived UI Rules

### Tab Placement

| Intake Type | Marketplace Tab |
|-------------|-----------------|
| `ip` | `Kho Công nghệ/IP` |
| `challenge` | `Thị trường Bài toán` |

### Supported Filters

| Filter Dimension | Status in This Feature |
|------------------|------------------------|
| Keyword search | Supported |
| Sector | Supported from live sector list |
| TRL | Hidden |
| Đơn vị | Hidden |
| Nguồn cung | Hidden |
| Ngân sách | Hidden |

### Image Resolution

| Condition | Expected Card Image |
|-----------|---------------------|
| Intake has image | Use intake image |
| Intake has no image | Use shared default placeholder image |

## Result States

### Loaded State

- Result count matches the visible live cards after filters
- IP and Challenge tabs each show only records matching their type

### Empty State

- If a tab has no visible records, show the tab's empty state
- Empty state must not show mock data

### Sector Failure State

- If sector options fail to load, live records can still render
- Unsupported hard-coded sector choices must not reappear as fallback options
