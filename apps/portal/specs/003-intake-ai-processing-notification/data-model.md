# Data Model: Intake AI Processing Notification

## Type Changes

### `IntakeListItem` (frontend type — `src/features/intakes/api/intake.ts`)

**Current state**: Missing `aiProcessingStatus` field.

**Required change**: Add `aiProcessingStatus` field.

```typescript
// BEFORE
export interface IntakeListItem {
  id: string;
  title: string;
  type: IntakeType;
  status: IntakeStatus;
  profilePicUrl?: string | null;
  createdAt: string;
  userId?: string;
}

// AFTER
export type AiProcessingStatus = 'processing' | 'completed' | 'failed' | null;

export interface IntakeListItem {
  id: string;
  title: string;
  type: IntakeType;
  status: IntakeStatus;
  profilePicUrl?: string | null;
  createdAt: string;
  userId?: string;
  aiProcessingStatus: AiProcessingStatus;  // NEW
}
```

## Existing Backend Entity (reference — no changes needed)

The `Intake` entity in `dmst-backend/src/intakes/intake.entity.ts` already has:

```typescript
export enum AiProcessingStatus {
  PROCESSING = 'processing',
  COMPLETED  = 'completed',
  FAILED     = 'failed',
}

export class Intake {
  @Column({
    name: 'ai_processing_status',
    type: 'enum',
    enum: AiProcessingStatus,
    nullable: true,
  })
  aiProcessingStatus: AiProcessingStatus | null;
}
```

## State Transitions

| `aiProcessingStatus` | Meaning | UI Badge Color |
|-----------------------|---------|----------------|
| `null` | No content — AI never triggered | Dim row (same as processing) |
| `'processing'` | AI is actively processing | Amber / yellow badge |
| `'completed'` | AI finished successfully | No badge (normal flow) |
| `'failed'` | AI processing failed | Red badge |

## Disabled Row Condition

A row is **disabled** when:
```
aiProcessingStatus === 'processing' OR aiProcessingStatus === null
```

Rationale: `null` means no content, so AI was never triggered. User should complete the intake first.
