# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS 11 backend API for DMST — a marketplace platform matching IP solution sellers with technology buyers. Uses PostgreSQL (TypeORM) for data **and** hybrid search (pgvector + pg_trgm + FTS), Redis (BullMQ queues), and BGE-M3 (local embedding server). Elasticsearch was removed — see `MigrateSearchToPgvector`.

## Common Commands

```bash
# Development
npm run start:dev          # Watch mode with hot reload
npm run start:debug        # Debug mode
npm run lint               # ESLint --fix

# Testing
npm test                   # Unit tests (no infrastructure needed)
npm run test:integration   # Retrieval SQL against a real migrated PostgreSQL.
                           # FAILS (never skips) when no database is reachable.
npm run verify:single-embed  # Asserts one intake costs exactly one BGE-M3 pass
npm run test:cov           # Unit tests with coverage
npm run test:e2e           # End-to-end tests

# Database migrations
npm run migration:generate -- --name=MigrationName   # Generate from entity diff
npm run migration:run
npm run migration:revert

# Seed data
npm run seed:all                  # All base seeds (users, sectors)
npm run seed:intakes              # All intake sectors + challenges
npm run seed:intakes:cntt         # Công nghệ thông tin only
npm run seed:intakes:yte          # Y tế only
npm run seed:intakes:duoc         # Dược phẩm only
npm run seed:intakes:challenges   # Buyer challenge intakes

# Maintenance
npm run reindex:pg         # Re-embed chunks and write dense + sparse vectors
npm run reindex:pg -- --all   # ...including chunks that already have vectors
npm run backfill:matches   # (Re)compute intake_matches for all existing intakes
```

## Architecture

### Module Structure

```
src/[module]/
  ├── [module].entity.ts
  ├── [module].module.ts
  ├── [module].service.ts
  ├── [module].controller.ts      # public-facing routes
  ├── admin-[module].controller.ts  # admin routes (where applicable)
  ├── user-[module].controller.ts   # /my/* authenticated routes (where applicable)
  ├── dto/
  └── index.ts
```

### Core Modules

- **Auth** (`src/auth/`) — JWT auth, login/register, `JwtAuthGuard`, `AdminGuard`
- **Users** (`src/users/`) — User entity and management
- **Intakes** (`src/intakes/`) — Central module. Handles IP (seller) and Challenge (buyer) intakes with file attachments, sectors, AI pipeline, and pre-computed matching. Three controllers: public, `/my/*` (user), `/admin/*`
- **AI** (`src/ai/`) — BullMQ job producers (`aiService.completion`, `.chunkEmbed`, `.embedding`), processor (`AiProcessor`), OpenAI/OpenRouter/BGE-M3 adapters
- **Search** (`src/search/`) — PostgreSQL hybrid search, `SearchService.search()`. `PgVectorService` holds all raw SQL
- **Queue** (`src/queue/`) — BullMQ configuration, `ai-queue`
- **Mail** (`src/mail/`) — Nodemailer transactional email

### AI Pipeline (4-step, fire-and-forget after intake create/update)

1. **LLM** — B2B marketing rewrite via `ai.completion` job → `aiProcessTitle`, `aiProcessedContent`
2. **Chunk + Embed** — `ai.chunk-embed` job → strip HTML → split (1500/150) → BGE-M3 batch embed → `intake_chunks`
3. **Write vectors** — embed each chunk dense + sparse, write `emb` / `emb_sparse` onto the chunk row (no second store to sync)
4. **Compute Matches** — embed intake content → hybrid search opposite type same sector → upsert `intake_matches`

See `docs/ai-features-flow.md` for full Mermaid flow diagrams.

### Database

- TypeORM with PostgreSQL; migrations in `src/database/migrations/`
- Key tables: `intakes`, `intake_sectors`, `intake_chunks` (pgvector 1024-dim), `intake_matches`
- Seed scripts in `src/database/scripts/` and `src/database/scripts/seed-intakes/`

### Hybrid search (PostgreSQL)

All retrieval SQL lives in `src/search/pgvector.service.ts`. Four channels, each
taking its own top-K, merged with Reciprocal Rank Fusion (k=60):

| Channel | Column | Solves |
|---|---|---|
| dense | `emb vector(1024)` HNSW | semantic similarity |
| sparse | `emb_sparse sparsevec(250002)` HNSW | Vietnamese word segmentation — BGE-M3's tokenizer does not depend on whitespace |
| lexical | `tsv` / `tsv_ua` GIN | ordered-syllable phrases, accented and unaccented |
| trigram | `searchable_ua` gin_trgm_ops | patent numbers, product codes, misspellings |

Two things that differ from the Elasticsearch path and must not regress:

1. **Hard filters run before top-K**, as a live join against `intakes` in the
   `allowed` CTE — not as metadata copied onto `intake_chunks`. Filtering after
   the cut silently discarded valid candidates.
2. **RRF consumes ranks, not scores.** Elasticsearch was adding a cosine score
   (bounded ~1.0) to a BM25 score (unbounded), so BM25 dominated and the
   embedding was close to noise.

**Score scale changed.** RRF scores run 0 – ~0.066 (4 channels × 1/61). The old
`minScore` defaults of 2.0 / 1.5 were BM25-scale and now reject everything;
defaults are 0. Scores stored in `intake_matches` before and after the migration
are not comparable.

Requires pgvector >= 0.7 for `sparsevec`, and `shm_size` raised on the Postgres
container — a parallel HNSW build allocates `maintenance_work_mem` in shared
memory and dies on Docker's 64MB default.

### Configuration

Environment variables (see `.env.example`):
- `DB_*` — PostgreSQL connection
- `REDIS_HOST/PORT` — Redis (BullMQ)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `AI_DEFAULT_PROVIDER` — `openai` or `openrouter`
- `OPENAI_API_KEY`, `OPENAI_DEFAULT_MODEL`
- `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_DEFAULT_MODEL`
- `BGE_M3_URL` — embedding server (default `http://localhost:8003`)
- `ENABLE_DOCUMENTATION=true` — Swagger UI at `/api/docs`

## Key Patterns

- Intake type `ip` = seller solution, `challenge` = buyer problem — bidirectional matching
- `IntakesService.applyAiProcessing()` triggers the full 4-step pipeline
- Guards: `JwtAuthGuard` for `/my/*`, `AdminGuard` (extends JWT) for `/admin/*`
- All paginated responses: `{ data[], total, page, limit, totalPages }`
- Seed scripts use idempotent upsert: skip if `title + userId` already exists

## Active Technologies
- YAML (GitHub Actions workflow syntax), Shell (Docker/git commands) + GitHub Actions (self-hosted runner), Docker Compose v2, Git (001-github-actions-cd)
- N/A (pipeline config only; database managed by existing TypeORM migrations) (001-github-actions-cd)
- YAML (Docker Compose v2 syntax, GitHub Actions workflow syntax) + Docker Compose v2, GitHub Actions self-hosted runner (002-compose-env-file)
- TypeScript / Node.js 22, NestJS 11 + TypeORM (PostgreSQL), class-validator, existing `JwtAuthGuard` (003-user-settings)
- PostgreSQL — new `user_settings` table (1 row per user, FK → users) (003-user-settings)
- TypeScript / Node.js 22, NestJS 11 + TypeORM (PostgreSQL) — `In` operator for batch ID lookup (006-fix-matching-filters)
- PostgreSQL — read-only filter on existing `intakes` table fields (`user_id`, `status`) (006-fix-matching-filters)
- TypeScript / Node.js 22, NestJS 11 + TypeORM (PostgreSQL), `AiService.completion()`, `buildB2bMarketingPrompt`, existing `JwtAuthGuard` / `AdminAuthGuard` (009-intake-beautify-api)
- PostgreSQL — update `ai_process_title`, `ai_processed_content`, `ai_processing_status` on existing `intakes` table (009-intake-beautify-api)
- TypeScript / Node.js 22 + NestJS 11, TypeORM (PostgreSQL), existing `JwtAuthGuard` / `AdminAuthGuard`, existing `IntakesService.computeMatches()` (010-manual-intake-match)
- PostgreSQL — read `intakes` (status check), write `intake_matches` (delete + insert) (010-manual-intake-match)
- TypeScript / Node.js 22 + NestJS 11, TypeORM (PostgreSQL), existing `JwtAuthGuard` / `AdminGuard` (011-notification-system)
- PostgreSQL — new `notifications` table (JSONB payload, enum type column) (011-notification-system)
- TypeScript / Node.js 22 + NestJS 11, TypeORM, BullMQ (013-match-original-content) — *historical: this feature predates the move off Elasticsearch*

## Recent Changes
- 001-github-actions-cd: Added YAML (GitHub Actions workflow syntax), Shell (Docker/git commands) + GitHub Actions (self-hosted runner), Docker Compose v2, Git
