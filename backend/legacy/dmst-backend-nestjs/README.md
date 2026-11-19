# DMST Backend

NestJS 11 API for the DMST marketplace platform — matching IP solution sellers with technology buyers. Implements a full AI pipeline: LLM content rewriting, BGE-M3 vector embedding, Elasticsearch hybrid search, and pre-computed bidirectional matching.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11, TypeScript |
| Database | PostgreSQL 16 (TypeORM) |
| Cache / Queue | Redis 7 (BullMQ) |
| Search | Elasticsearch 8.17 (kNN + BM25) |
| Embedding | BGE-M3 local server (port 8003) |
| LLM | OpenAI gpt-4o-mini / OpenRouter |
| Auth | JWT (access token) |

## Quick Start

### Prerequisites

- Node.js 22+
- Docker (for PostgreSQL, Redis, Elasticsearch)
- BGE-M3 embedding server running at `http://localhost:8003`

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Start infrastructure
docker compose up postgres redis elasticsearch -d

# Run migrations
npm run migration:run

# Seed base data (users, sectors)
npm run seed:all

# Seed intake demo data
npm run seed:intakes

# Start in dev mode
npm run start:dev
```

API is available at `http://localhost:3000/api/v1`
Swagger UI at `http://localhost:3000/api/docs` (when `ENABLE_DOCUMENTATION=true`)

## Commands

<!-- AUTO-GENERATED from package.json scripts -->
| Command | Description |
|---|---|
| `npm run start:dev` | Watch mode with hot reload |
| `npm run start:debug` | Debug mode |
| `npm run start:prod` | Run compiled production build |
| `npm run build` | Compile with NestJS CLI |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier format |
| `npm test` | Run unit tests (Jest) |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | End-to-end tests |
| `npm run migration:generate -- --name=Name` | Generate migration from entity diff |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:show` | List applied migrations |
| `npm run seed:all` | Seed users and sectors |
| `npm run seed:intakes` | Seed all intake demo data (all sectors) |
| `npm run seed:intakes:cntt` | Seed CNTT sector intakes only |
| `npm run seed:intakes:yte` | Seed Y tế sector intakes only |
| `npm run seed:intakes:duoc` | Seed Dược phẩm sector intakes only |
| `npm run seed:intakes:challenges` | Seed buyer challenge intakes |
| `npm run reindex:es` | Reindex all intake chunks to Elasticsearch |
| `npm run backfill:matches` | Recompute intake_matches for all existing intakes |
<!-- END AUTO-GENERATED -->

## Environment Variables

<!-- AUTO-GENERATED from .env.example -->
| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development` / `production` |
| `PORT` | No | HTTP server port (default `3000`) |
| `API_PREFIX` | No | URL prefix (default `api`) |
| `API_VERSION` | No | API version segment (default `v1`) |
| `ENABLE_DOCUMENTATION` | No | Enable Swagger UI at `/api/docs` |
| `APP_URL` | No | Public base URL |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |
| `DB_HOST` | **Yes** | PostgreSQL host |
| `DB_PORT` | **Yes** | PostgreSQL port (default `5432`) |
| `DB_NAME` | **Yes** | Database name |
| `DB_USER` | **Yes** | Database user |
| `DB_PASSWORD` | **Yes** | Database password |
| `REDIS_HOST` | **Yes** | Redis host |
| `REDIS_PORT` | **Yes** | Redis port (default `6379`) |
| `JWT_SECRET` | **Yes** | JWT signing secret (use strong random value) |
| `JWT_EXPIRES_IN` | No | Token TTL (default `24h`) |
| `MAIL_HOST` | No | SMTP host |
| `MAIL_PORT` | No | SMTP port |
| `MAIL_USER` | No | SMTP username |
| `MAIL_PASS` | No | SMTP app password |
| `MAIL_FROM` | No | Sender address |
| `FRONTEND_URL` | No | Frontend origin (for email links) |
| `AI_DEFAULT_PROVIDER` | No | `openai` or `openrouter` (default `openai`) |
| `OPENAI_API_KEY` | No* | Required if `AI_DEFAULT_PROVIDER=openai` |
| `OPENAI_DEFAULT_MODEL` | No | Default `gpt-4o-mini` |
| `OPENROUTER_API_KEY` | No* | Required if `AI_DEFAULT_PROVIDER=openrouter` |
| `OPENROUTER_BASE_URL` | No | Default `https://openrouter.ai/api/v1` |
| `OPENROUTER_DEFAULT_MODEL` | No | Default `openai/gpt-4o-mini` |
| `BGE_M3_URL` | **Yes** | BGE-M3 embedding server URL (default `http://localhost:8003`) |
| `ES_URL` | **Yes** | Elasticsearch URL (default `http://localhost:9200`) |
<!-- END AUTO-GENERATED -->

## Docker Deployment

```bash
# Full stack (BE + PostgreSQL + Redis + Elasticsearch)
docker compose up -d

# Backend only (requires external infra)
docker build -t dmst-backend .
docker run -p 3013:3013 --env-file .env dmst-backend
```

Container port: `3013`

## Architecture

### Module Structure

```
src/
├── auth/           JWT authentication, guards
├── users/          User entity and management
├── intakes/        Core module — IP & Challenge intakes, AI pipeline, matching
│   ├── intakes.controller.ts       Public routes
│   ├── admin-intakes.controller.ts Admin routes (/admin/intakes)
│   └── user-intakes.controller.ts  Auth routes (/my/intakes)
├── ai/             BullMQ job producers, AiProcessor, LLM/BGE-M3 adapters
├── search/         Elasticsearch hybrid search (kNN + BM25)
├── queue/          BullMQ configuration
├── mail/           Transactional email
├── health/         Health check endpoint
└── database/
    ├── migrations/ TypeORM migrations
    └── scripts/    Seed scripts
```

### AI Pipeline

Each intake triggers a 4-step background pipeline after creation/update:

```
1. LLM (ai.completion)       → B2B marketing rewrite → aiProcessTitle, aiProcessedContent
2. Chunk+Embed (ai.chunk-embed) → RecursiveTextSplitter(1500/150) → BGE-M3 → intake_chunks
3. ES Index                  → Bulk index chunks into Elasticsearch
4. Compute Matches           → Embed intake content → search opposite type → intake_matches
```

See [docs/ai-features-flow.md](docs/ai-features-flow.md) for full Mermaid flow diagrams.

### Key Endpoints

| Endpoint | Auth | Description |
|---|---|---|
| `POST /my/intakes` | User | Create IP or Challenge intake → triggers AI pipeline |
| `GET /intakes` | Public | List intakes with pagination, type/sector filter, text search |
| `GET /intakes/:id` | Public | Detail + top 5 pre-computed matches |
| `GET /intakes/:id/matches` | Public | Paginated pre-computed matches |
| `GET /my/intakes/:id/find-challenges` | User | Live semantic search for matching challenges |
| `POST /search` | Public | Free-text hybrid semantic search |
| `GET /admin/intakes` | Admin | Admin intake list with full metadata |
