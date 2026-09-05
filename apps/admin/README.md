# Hệ thống ĐMST Quốc Gia — Admin Dashboard

**PoC** · Admin Role · React 18 + TypeScript 5 · Vite 6

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install & Run Dev](#install--run-dev)
  - [Production Build](#production-build)
  - [Docker](#docker)
- [Configuration](#configuration)
- [Features](#features)
- [Scripts](#scripts)
- [License](#license)

---

## Overview

**Hệ thống ĐMST Quốc Gia** (National Innovation System) is the **Admin Role** proof-of-concept dashboard for managing a national-level technology intake and implementation tracking system.

The system manages four core record types:

| Type | Description |
|---|---|
| **IP (Intellectual Property)** | IP submissions from citizens and organizations |
| **Challenges** | Technology challenge proposals |
| **Implementations** | Case studies tracking real-world deployments |
| **Users** | User and admin accounts |

> This is the **Admin Role** frontend SPA. The backend API is a separate service consumed over REST.

---

## Architecture

```
Browser (React SPA)
        │  REST /api/v1/*
        ▼
  Backend API Service          ← External service (JWT auth)
```

- **Frontend**: Single-page application, cookie-based JWT auth
- **Backend**: Separate service, accessed via Axios with Bearer token in cookie `admin_token`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Bundler | Vite 6.3.5 |
| Styling | Tailwind CSS v4 + CSS Variables |
| UI Components | Radix UI + MUI v7 (shadcn-style) |
| Routing | React Router DOM v7 |
| HTTP Client | Axios (with interceptors) |
| Charts | Recharts |
| Rich Text Editor | @mdxeditor/editor |
| Forms | React Hook Form |
| Notifications | Sonner (toast) |
| Animations | Framer Motion + tw-animate-css |
| Auth | JWT Bearer (cookie: `admin_token`) |
| Icons | Lucide React |
| Date utils | date-fns |
| Markdown | react-markdown |
| Linting | ESLint 9 + Prettier |

---

## Project Structure

```
.
├── src/
│   ├── main.tsx                  # React entry point
│   ├── app/
│   │   ├── App.tsx               # Root component
│   │   └── router-config.tsx     # Route definitions
│   ├── lib/
│   │   ├── api/client.ts         # Axios instance (base URL, interceptors)
│   │   ├── auth/
│   │   │   ├── constants.ts      # COOKIE_TOKEN_NAME = 'admin_token'
│   │   │   └── events.ts        # Custom 401 event
│   │   └── cookies.ts           # Cookie helpers
│   ├── services/                 # API service layer
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── intakeService.ts
│   │   └── statsService.ts
│   ├── types/                    # TypeScript types
│   ├── features/                 # Feature modules (route-level)
│   │   ├── auth/                # Login + AuthContext
│   │   ├── dashboard/           # Charts + summary cards
│   │   ├── intakes/            # IP & Challenge CRUD
│   │   ├── implementations/    # Implementation records
│   │   └── users/              # User management
│   ├── shared/
│   │   ├── layout/             # DashboardLayout (sidebar nav)
│   │   ├── components/         # Shared: Pagination, DataTable, ...
│   │   └── ui/                # Radix UI + Tailwind components
│   └── styles/
│       ├── index.css
│       ├── tailwind.css        # Tailwind v4 theme
│       └── theme.css           # CSS custom properties
├── scripts/
│   └── deploy.sh               # SSH + Docker deploy script
├── specs/                      # Feature specs (speckit)
├── docs/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── Dockerfile
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** (recommended) or npm
- Backend API service running and reachable

### Install & Run Dev

```bash
# 1. Navigate to the project
cd "/home/anhbui/projects/dmst/[Nacentech] PoC DMST - Admin Role.1"

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Configure environment (optional — defaults work for local dev)
cp .env.example .env

# 4. Start dev server
pnpm dev
# → http://localhost:5174
```

### Production Build

```bash
pnpm build          # Vite build → dist/
pnpm preview        # Preview production build
```

### Docker

```bash
docker compose build
docker compose up -d
```

---

## Configuration

Create `.env` from `.env.example` or set these variables directly:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Backend API base URL |
| `VITE_API_PREFIX` | — | Additional URL path prefix |
| `VITE_API_VERSION` | — | API version segment |

**Auth**: JWT token is stored in the `admin_token` cookie. Axios interceptors automatically attach the Bearer token and handle 401 responses by redirecting to login.

---

## Features

### Authentication (`/login`)

- Email + password login form
- JWT Bearer token stored in `admin_token` cookie
- `AuthContext` manages global auth state
- Auto-redirect to login on 401 response

### Dashboard (`/dashboard`)

- **5 summary cards**: Total IP, Total Challenges, Published (IP+Challenge), Total Users, Active Users
- **Monthly trend chart** (dual-series: IP vs Challenge)
- **Status breakdown chart** (IP + Challenge by draft/published)
- **Sector chart** (top 10 sectors by intake count)
- **User growth chart** (monthly active user trend)
- **Role distribution chart** (admin vs user)
- **Time range filter**: 7 / 30 / 90 days / All

### IP & Challenge Management (`/intakes`)

- **List page**: search, type filter (IP/Challenge), status filter (draft/published), pagination
- **Create page**: rich text MDX editor, file uploads (public + 2 confidentiality levels)
- **Detail page**: 3 tabs — Public Info / Confidential Level 2 / Confidential Level 3
  - AI processing badge (processing / completed / failed)
  - Attachments scoped to each confidentiality level
- **Edit page**: full form with all fields
- **Delete**: confirmation via AlertDialog

### Implementation Records (`/implementations`)

- **List page**: filter by challenge name, sector, status
- **Detail page**: 4 collapsible sections:
  1. **Challenge Info** — name, sector, company, budget, implementation period
  2. **Solution** — provider, TRL level, technical description, attachments
  3. **Timeline** — phases with duration, description, issues, status
  4. **Results** — KPI table (target vs achieved), success analysis, lessons, recommendations
- Actions: Edit, Export PDF, Delete

### User Management (`/users`)

- **List page**: search, active/inactive filter, pagination
- **Create user modal**: email, first name, last name, phone, organization
- **User profile** `/users/:id`: 4 tabs — Profile / Security / Activity / Settings
- Activate / Deactivate accounts

### Personal Profile (`/user-profile`)

- View and update own admin profile (separate from user management)

---

## Scripts

```bash
pnpm dev          # Dev server → http://localhost:5174
pnpm build        # Production build → dist/
pnpm preview      # Preview production build
pnpm lint         # ESLint
pnpm lint:fix     # ESLint --fix
pnpm format       # Prettier write
pnpm typecheck    # tsc --noEmit
```

---

## License

Internal PoC project — Nacentech.
