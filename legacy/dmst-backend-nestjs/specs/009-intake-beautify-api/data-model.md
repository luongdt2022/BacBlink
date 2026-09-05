# Data Model: Intake AI Beautification Endpoint

**Branch**: `009-intake-beautify-api` | **Date**: 2026-03-30

## No schema changes

No new tables, columns, or migrations. The `intakes` table already has all required fields.

## Fields written by this feature

| Field | Type | Before call | After successful call |
|-------|------|-------------|-----------------------|
| `ai_process_title` | varchar nullable | null or prior value | AI-generated title (≤65 chars) |
| `ai_processed_content` | text nullable | null or prior value | AI-generated HTML content |
| `ai_processing_status` | enum | any | `completed` |

On failure: all three fields remain unchanged.

## Response shape (returned by the endpoint)

```
{
  id: string,
  title: string,           // original title (unchanged)
  aiProcessTitle: string,  // newly generated
  aiProcessedContent: string, // newly generated HTML
  aiProcessingStatus: "completed"
}
```

The response returns only the relevant updated fields to keep the payload minimal.
Full intake detail is available via the existing `GET /my/intakes/:id` endpoint.
