# Implementation Plan: Tách Hoàn Toàn 2 Namespace IP và Challenge

**Branch**: `012-split-ip-challenge-routes` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-split-ip-challenge-routes/spec.md` + user clarification "bỏ route intake hoàn toàn"

## Summary

Refactor frontend routing để loại bỏ namespace `/intakes` khỏi các luồng nghiệp vụ và tách hoàn toàn thành hai phần độc lập:
- IP namespace: `/ips`, `/ips/create`, `/ips/:id`, `/ips/:id/edit`
- Challenge namespace: `/challenges`, `/challenges/create`, `/challenges/:id`, `/challenges/:id/edit`

Toàn bộ create/detail/edit/list navigation phải nằm trong một trong hai namespace trên.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 18  
**Primary Dependencies**: React Router, Tailwind CSS, shadcn/ui, lucide-react, sonner, existing intake API client  
**Storage**: N/A - frontend routing/navigation only  
**Testing**: `npm test && npm run lint`, manual route validation cho `/ips/*` và `/challenges/*`  
**Target Platform**: Web SPA cho authenticated users  
**Project Type**: Frontend web application  
**Performance Goals**: Không tăng độ trễ điều hướng đáng kể sau khi tách namespace  
**Constraints**: Không đổi backend contract; không giữ compatibility cho route nghiệp vụ `/intakes/*`  
**Scale/Scope**: Router, intake pages wrappers, list navigation, submit/back behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution hiện là template placeholder, không có gate enforce được. Không phát sinh vi phạm trước/sau thiết kế.

## Project Structure

### Documentation (this feature)

```text
specs/012-split-ip-challenge-routes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── intake-routing-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── config/
│   │   └── routes.ts
│   └── router/
│       └── routes.tsx
└── features/
    └── intakes/
        └── pages/
            ├── IntakesPage.tsx
            ├── IntakeFormPage.tsx
            ├── IntakeDetailPage.tsx
            ├── CreateIpPage.tsx
            ├── CreateChallengePage.tsx
            ├── IpDetailPage.tsx
            ├── ChallengeDetailPage.tsx
            ├── IpEditPage.tsx
            └── ChallengeEditPage.tsx
```

**Structure Decision**: Giữ 1 bộ component dùng chung cho intake data model, nhưng tách route layer thành 2 namespace độc lập IP/Challenge.

## Routing Transition Decisions

1. Route nghiệp vụ legacy bị loại bỏ:
   - `/intakes`
   - `/intakes/create`
   - `/intakes/edit`
   - `/intakes/detail`
2. Tạo namespace IP độc lập:
   - `/ips`, `/ips/create`, `/ips/:id`, `/ips/:id/edit`
3. Tạo namespace Challenge độc lập:
   - `/challenges`, `/challenges/create`, `/challenges/:id`, `/challenges/:id/edit`
4. Submit success/back action phải quay về namespace tương ứng (`/ips` hoặc `/challenges`).

## Complexity Tracking

Không có vi phạm constitution cần biện minh.
