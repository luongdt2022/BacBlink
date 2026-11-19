# Data Model: Public Intake Feed

**Feature**: 012-public-intake-feed  
**Date**: 2026-04-03

## Existing Entity Reused

### `Intake`

**Table**: `intakes`

The feature does not introduce a new persisted entity. It reuses the existing `Intake` domain object with these discovery-relevant attributes:

| Field | Source | Rules for Discovery |
|------|--------|---------------------|
| `id` | `intakes.id` | Included in each feed item |
| `title` | `intakes.title` | Searchable and displayed |
| `content` | `intakes.content` | Searchable summary source |
| `type` | `intakes.type` | Optional filterable dimension |
| `status` | `intakes.status` | Must equal `published` to be eligible |
| `userId` | `intakes.user_id` | Must not equal requesting user ID |
| `createdAt` | `intakes.created_at` | Sorting field, newest first |
| `attachments` | relation | Included using existing list behavior |
| `intakeSectors` | relation | Included for sector filtering and display |
| `user` | relation | Available when owner-identifying summary is needed |

## Derived Read Model

### `DiscoveryFeedItem`

`DiscoveryFeedItem` is not a new table. It is a filtered view of `Intake` records returned by the discovery endpoint.

| Property | Derived From | Validation / Rule |
|----------|--------------|-------------------|
| `id` | `Intake.id` | Required |
| `title` | `Intake.title` | Required |
| `type` | `Intake.type` | Required |
| `createdAt` | `Intake.createdAt` | Required; used for descending sort |
| `attachments` | `Intake.attachments` | Uses current list serialization |
| `intakeSectors` | `Intake.intakeSectors` | Uses current list serialization |
| `userId` or owner summary | existing joined owner data | Must identify that the record belongs to another user without exposing draft-only data |

### Eligibility Rules

A record is eligible for the discovery feed only when all of the following are true:

1. `status = published`
2. `userId != requestingUserId`
3. The record matches any optional `type`, `sectorId`, and `search` filters
4. The record is not deleted or otherwise unavailable through the normal repository query path

## Query Inputs

### `DiscoveryFilterSet`

The endpoint reuses the existing `QueryIntakeDto`.

| Input | Type | Rule |
|-------|------|------|
| `type` | enum (`ip` \| `challenge`) | Optional |
| `sectorId` | uuid | Optional |
| `search` | string | Optional; applies to title/content discovery query |
| `page` | integer | Optional; minimum 1 |
| `limit` | integer | Optional; minimum 1, maximum 100 |

## Response Model

### `PaginatedDiscoveryFeed`

| Field | Type | Rule |
|-------|------|------|
| `data` | `DiscoveryFeedItem[]` | Empty array allowed |
| `total` | integer | Total number of eligible rows across all pages |
| `page` | integer | Echoes normalized requested page |
| `limit` | integer | Echoes normalized requested limit |
| `totalPages` | integer | `ceil(total / limit)` |

## State and Transitions

The feature does not create a new lifecycle. Discovery visibility depends on existing `Intake.status` transitions:

- `draft` → `published`: intake becomes eligible for discovery if owned by another user and matches filters
- `published` → `draft`: intake becomes ineligible immediately
- active → deleted/unavailable: intake becomes ineligible immediately

## Schema Impact

No schema changes. No migration required.
