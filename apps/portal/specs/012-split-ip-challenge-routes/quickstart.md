# Quickstart: Split Namespace IP/Challenge (No Intake Routes)

## Target Routes

| Route | Purpose |
|-------|---------|
| `GET /ips` | IP list |
| `GET /ips/create` | Create IP |
| `GET /ips/:id` | IP detail |
| `GET /ips/:id/edit` | IP edit |
| `GET /challenges` | Challenge list |
| `GET /challenges/create` | Create Challenge |
| `GET /challenges/:id` | Challenge detail |
| `GET /challenges/:id/edit` | Challenge edit |

## Smoke Test

### 1. IP namespace

1. Truy cập `http://localhost:5173/ips`
2. Click tạo mới -> `http://localhost:5173/ips/create`
3. Lưu thành công -> quay về `/ips`
4. Mở detail và edit theo `/:id`

### 2. Challenge namespace

1. Truy cập `http://localhost:5173/challenges`
2. Click tạo mới -> `http://localhost:5173/challenges/create`
3. Lưu thành công -> quay về `/challenges`
4. Mở detail và edit theo `/:id`

### 3. Legacy route removal

Truy cập trực tiếp:
- `http://localhost:5173/intakes`
- `http://localhost:5173/intakes/create`
- `http://localhost:5173/intakes/edit?id=<id>`
- `http://localhost:5173/intakes/detail?id=<id>`

Kỳ vọng:
- Không còn flow nghiệp vụ `/intakes/*`.

### 4. Validation command

```bash
npm test && npm run lint
```

## Planned Code Touchpoints

| File | Change |
|------|--------|
| `src/app/router/routes.tsx` | Remove `/intakes/*`, add `/ips/*` + `/challenges/*` |
| `src/app/config/routes.ts` | Update menu/path mappings for new namespaces |
| `src/features/intakes/pages/IntakeFormPage.tsx` | Lock type + route-driven submit/back |
| `src/features/intakes/pages/IntakeDetailPage.tsx` | Route-param detail/edit/back behavior |
| `src/features/intakes/pages/*` | Add/complete wrappers for IP/Challenge list/create/detail/edit |
