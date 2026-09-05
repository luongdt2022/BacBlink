# Dashboard IP And Challenge Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split intake-related dashboard metrics into separate `IP` and `Challenge` views across cards and charts, backed by an expanded admin stats API.

**Architecture:** Extend the existing `GET /admin/stats/intakes` response to expose type-specific monthly and status breakdowns while preserving current aggregate fields. Then update the frontend dashboard service types and chart components to read the richer shape and render separate IP and Challenge series without changing routes or general page structure.

**Tech Stack:** NestJS, TypeORM, TypeScript, React, Recharts, Tailwind CSS

---

### Task 1: Baseline And Contract Review

**Files:**
- Verify: `../dmst-backend/src/stats/stats.service.ts`
- Verify: `../dmst-backend/src/stats/dto/stats.dto.ts`
- Verify: `src/services/statsService.ts`

- [ ] **Step 1: Inspect current stats contract**

Run: `sed -n '1,260p' ../dmst-backend/src/stats/dto/stats.dto.ts`
Expected: confirm intake stats currently return aggregate `byMonth` and `byStatus`.

- [ ] **Step 2: Inspect current frontend consumer**

Run: `sed -n '1,260p' src/services/statsService.ts`
Expected: confirm frontend `IntakeStats` type matches the aggregate response.

### Task 2: Extend Backend Intake Stats Shape

**Files:**
- Modify: `../dmst-backend/src/stats/dto/stats.dto.ts`
- Modify: `../dmst-backend/src/stats/stats.service.ts`

- [ ] **Step 1: Extend DTOs for type-specific monthly and status breakdowns**

Add DTO fields for:
- `byMonth[]` with `ipCount` and `challengeCount`
- `byStatus.draft` with `ipCount` and `challengeCount`
- `byStatus.published` with `ipCount` and `challengeCount`

- [ ] **Step 2: Update stats service aggregation queries**

Adjust the monthly query to group by month and intake type, then map into one row per month with separate counts for `IP` and `Challenge`.

- [ ] **Step 3: Update status aggregation mapping**

Adjust the status query to group by status and intake type, then map into grouped values for `draft` and `published`.

- [ ] **Step 4: Verify backend compiles**

Run: `npm run build`
Workdir: `../dmst-backend`
Expected: PASS

### Task 3: Update Frontend Stats Contract

**Files:**
- Modify: `src/services/statsService.ts`
- Modify: `src/features/dashboard/hooks/useStats.ts`

- [ ] **Step 1: Update frontend intake stats types**

Match the new backend response shape in `src/services/statsService.ts`.

- [ ] **Step 2: Confirm hook compatibility**

Update `useStats` imports/types only as needed so the hook continues to return the unified dashboard payload.

### Task 4: Split Dashboard Cards And Charts

**Files:**
- Modify: `src/features/dashboard/components/StatsGrid.tsx`
- Modify: `src/features/dashboard/components/IntakeLineChart.tsx`
- Modify: `src/features/dashboard/components/IntakeStatusChart.tsx`
- Modify: `src/features/dashboard/components/IntakeSectorChart.tsx`
- Modify: `src/features/dashboard/DashboardPage.tsx`

- [ ] **Step 1: Split the intake summary card**

Replace the single intake total card with separate `Tổng IP` and `Tổng Challenge` cards driven from `byType`.

- [ ] **Step 2: Convert monthly intake chart to dual-series**

Render separate `IP` and `Challenge` lines using the new `byMonth` structure.

- [ ] **Step 3: Convert status chart to grouped comparison**

Render per-status bars for `IP` and `Challenge` using the new grouped `byStatus` structure.

- [ ] **Step 4: Keep sector chart aggregate but update copy if needed**

Preserve sector ranking as a shared aggregate view without changing its business meaning.

- [ ] **Step 5: Verify frontend static quality**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 6: Verify frontend production build**

Run: `npm run build`
Expected: PASS

### Task 5: Final Verification

**Files:**
- Verify: `../dmst-backend/src/stats/stats.service.ts`
- Verify: `src/features/dashboard/DashboardPage.tsx`

- [ ] **Step 1: Re-run backend build**

Run: `npm run build`
Workdir: `../dmst-backend`
Expected: PASS

- [ ] **Step 2: Re-run frontend lint and build**

Run: `npm run lint && npm run build`
Expected: frontend commands both PASS
