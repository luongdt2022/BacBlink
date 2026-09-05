# DMST User Frontend

React + Vite SPA for the DMST marketplace — the user-facing interface for submitting IP solutions, browsing buyer challenges, and viewing AI-powered match results.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18, TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Icons | lucide-react |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |

## Quick Start

### Prerequisites

- Node.js 22+
- Backend API running (see [dmst-backend](../dmst-backend))

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Set VITE_API_BASE_URL to your backend URL

# Start dev server
npm run dev
```

App available at `http://localhost:5173`

## Commands

<!-- AUTO-GENERATED from package.json scripts -->
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type check + production build to `dist/` |
| `npm run lint` | ESLint check on `src/` |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier format all `.ts`, `.tsx`, `.css` |
<!-- END AUTO-GENERATED -->

## Environment Variables

<!-- AUTO-GENERATED from .env.example -->
| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Backend API base URL (e.g. `http://localhost:3000`) |
| `VITE_API_PREFIX` | No | API path prefix (default `api`) |
| `VITE_API_VERSION` | No | API version segment (default `v1`) |
<!-- END AUTO-GENERATED -->

> Note: `VITE_API_BASE_URL` is baked into the production bundle at build time. Pass it as a Docker build arg when building the container.

## Docker Deployment

```bash
# Build image (pass API URL at build time)
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t dmst-user:latest .

# Run container
docker run -p 3011:8080 dmst-user:latest

# Or with docker compose (reads from .env)
docker compose up -d
```

Container port: `8080` (mapped to `3011` by default in compose).

## Project Structure

```
src/
├── features/
│   ├── intakes/
│   │   ├── api/intake.ts           API client functions + TypeScript types
│   │   ├── components/
│   │   │   ├── MatchCard.tsx       Single match result card (rank, score, sectors)
│   │   │   └── MatchesSection.tsx  Top-5 matches section with empty state
│   │   └── pages/
│   │       ├── IntakeDetailPage.tsx  Detail view + AI matches section
│   │       ├── IntakeListPage.tsx
│   │       └── IntakeFormPage.tsx
│   ├── marketplace/                Browse public IP/Challenge listings
│   ├── valuation/                  Valuation request forms
│   └── services/                   Service request pages
├── services/api/
│   ├── client.ts                   Base fetch wrapper, auth headers
│   └── auth.ts                     Login / token management
└── shared/
    └── components/
        ├── ui/                     shadcn/ui component library
        └── modals/                 Reusable modal components
```

## Key Features

### Intake Management
- Create and edit IP (seller solution) or Challenge (buyer problem) intakes
- Multi-level confidential content (public / level 2 / level 3)
- File attachments with image preview
- Sector tagging

### AI Match Display
The intake detail page (`/intakes/detail?id=...`) automatically shows pre-computed AI matches:
- **IP intake** → shows top 5 matching buyer challenges
- **Challenge intake** → shows top 5 matching IP solutions
- Each match card displays: rank, score, sectors, matched content snippet
- Clicking a card navigates to the matched intake detail

### Path Aliases
`@/` maps to `src/` — use for all internal imports:
```typescript
import { Badge } from '@/shared/components/ui/badge';
import { getIntakeById } from '@/features/intakes/api/intake';
```
