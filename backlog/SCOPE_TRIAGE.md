# Scope Triage — Change Request

| CR | Priority | Value | Scope verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| [CR-2026-005](../docs/change-requests/CR-2026-005-task05-directory-search.md) | P1 | Tìm chuyên gia theo taxonomy/địa bàn đúng nguồn, giao diện gọn và CTA trung thực | APPROVED — PO đã gõ `XÁC NHẬN SCOPE` | In progress; Gate 4/5 open |

## Cross-Surface summary

Basic Design/wireframe, TASK-05 spec/plan/tasks, `GET /api/v1/sectors`, public directory API, public province projection, existing consultation API, `/experts`, `/chuyen-gia`, public detail destination, DB taxonomy/Person scopes and regression tests are mapped in the CR. No schema migration or DB data mutation is in scope. Owner/Admin/Zalo behavior is unchanged.

Canonical Epic roadmap remains [`../specs/ROADMAP.md`](../specs/ROADMAP.md); no duplicate Epic roadmap is created here.

## PO scope expansion — all industry surfaces

PO instruction “sửa đồng bộ hết … thành các ngành động, k để fix tĩnh” expands CR-2026-005 to Home, public directory/detail, expert upgrade and CV parser, admin sector/category/matrix, RBAC sector scope, GOV, login, dashboard/navigation and API projections. Taxonomy DB is the single runtime source; no static UI/API fallback. Owner/Zalo are included where they consume or project sector fields; other unrelated behavior remains covered by regression. Upstream Basic Design, TASK-00/05/06/07 design/tasks, API behavior, DB seed role, frontend, backend and QC evidence are mapped in the CR.
