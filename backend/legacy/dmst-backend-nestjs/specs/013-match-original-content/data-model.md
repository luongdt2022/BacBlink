# Data Model: Match on Original Content Only

**Feature**: 013-match-original-content
**Date**: 2026-05-25

## No Schema Changes

This feature involves no database schema changes and no new entities. All existing tables remain unchanged.

## Affected Fields (logic change only)

### `intakes` table — fields used for matching

| Field | Type | Role after this change |
|-------|------|------------------------|
| `title` | `varchar` | Query vector source (PRIMARY) |
| `content` | `text` | Query vector source (PRIMARY, truncated to 1500 chars) |
| `ai_process_title` | `varchar` | Display only — NOT used in matching query |
| `ai_processed_content` | `text` | Display only — NOT used in matching query |
| `ai_chunking_status` | `enum` | Gate for backfill script (must be `completed`) |
| `status` | `enum` | Gate for compute-matches endpoint (must be `published`) |

### `intake_chunks` table — unchanged

Chunks are already derived from original `content`. No change.

### Elasticsearch `intake_chunks` index — no mapping change

| Field | Used in kNN | Used in BM25 | Used for display |
|-------|------------|--------------|------------------|
| `embedding` | ✓ | — | — |
| `text` | — | ✓ (boost 1.0) | ✓ |
| `intake_title` | — | ✓ (boost 2.0) | ✓ |
| `ai_process_title` | — | ✗ (removed) | ✓ (still returned) |
| `intake_type` | filter | filter | ✓ |
| `sector_ids` | filter | filter | ✓ |

## State Transitions — No Change

`aiProcessingStatus` and `aiChunkingStatus` state machines are unaffected.

## Guard Logic Change

| Endpoint | Old guard (removed) | New guard |
|----------|---------------------|-----------|
| `POST /my/intakes/:id/compute-matches` | `!aiProcessedContent` → 422 | `!content` → 422 |
| `POST /admin/intakes/:id/compute-matches` | `!aiProcessedContent` → 422 | `!content` → 422 |
| `backfill-matches` script | skip if no `aiProcessedContent` | skip if no `content` |
