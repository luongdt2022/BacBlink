# AI Features - Flow Documentation

Tài liệu mô tả toàn bộ luồng hoạt động của các tính năng AI trong hệ thống DMST Backend.

---

## Tổng quan kiến trúc

```mermaid
graph TB
    subgraph Client["Client (User / Admin)"]
        A1[POST /my/intakes\nPOST /admin/intakes]
        A2[POST /search]
        A3[GET /my/intakes/:id/find-challenges]
        A4[GET /intakes/:id/matches]
        A5[POST /my/intakes/:id/compute-matches\nPOST /admin/intakes/:id/compute-matches]
    end

    subgraph API["NestJS API Layer"]
        B1[IntakesService]
        B2[SearchService]
    end

    subgraph Queue["BullMQ Queue (Redis)"]
        C1[ai.completion]
        C2[ai.chunk-embed]
        C3[ai.embedding]
        C4[intakes.compute-matches]
    end

    subgraph AIProviders["AI Providers"]
        D1[OpenAI / OpenRouter\ngpt-4o-mini]
        D2[BGE-M3\nLocal :8003]
    end

    subgraph Storage["Storage"]
        E1[(PostgreSQL\nintakes\nintake_chunks\nintake_matches)]
        E2[(Elasticsearch\nintake_chunks index)]
    end

    A1 --> B1
    A2 --> B2
    A3 --> B1 --> B2
    A4 --> B1 --> E1
    A5 --> B1

    B1 --> C1 --> D1
    B1 --> C2 --> C3 --> D2
    B1 --> C4
    B2 --> C3

    B1 --> E1
    D2 --> E1
    B2 --> E2
    B1 --> E2
    C4 --> E1
```

---

## 1. Luồng tạo Intake (AI Processing Pipeline)

Khi user/admin tạo intake mới, hệ thống tự động chạy **4 bước AI** nối tiếp nhau dưới nền:

```mermaid
sequenceDiagram
    autonumber
    actor U as User/Admin
    participant C as Controller
    participant S as IntakesService
    participant Q as BullMQ Queue
    participant LLM as OpenAI/OpenRouter
    participant BGE as BGE-M3 :8003
    participant PG as PostgreSQL
    participant ES as Elasticsearch

    U->>C: POST /my/intakes {title, content, sectorIds, files}
    C->>S: create(dto, files, userId)
    S->>PG: INSERT intake (aiProcessingStatus=null)
    S->>PG: INSERT intake_sectors, attachments
    S-->>U: 201 { success, data: intake }

    Note over S,ES: Fire-and-forget async pipeline (4 bước)

    rect rgb(255, 243, 205)
        Note over S,LLM: Bước 1 — B2B Marketing LLM
        S->>S: aiProcessingStatus = PROCESSING
        S->>Q: job: ai.completion (B2B Marketing prompt)
        Q->>LLM: ChatCompletion (gpt-4o-mini)
        LLM-->>Q: { title: string, content: HTML }
        Q-->>S: aiProcessTitle, aiProcessedContent
        S->>PG: UPDATE aiProcessTitle, aiProcessedContent, status=COMPLETED
    end

    rect rgb(220, 237, 200)
        Note over S,BGE: Bước 2 — Chunk & Embed
        S->>S: aiChunkingStatus = PROCESSING
        S->>Q: job: ai.chunk-embed (aiProcessedContent)
        Q->>Q: stripHtml → plainText
        Q->>Q: RecursiveCharacterTextSplitter(1500, 150)
        Q->>BGE: POST /embed/text {text: chunks[]}
        BGE-->>Q: { embeddings: number[][] } (1024-dim)
        Q-->>S: [{index, text, embedding}, ...]
        S->>PG: DELETE old chunks
        S->>PG: INSERT intake_chunks (text + embedding[1024])
        S->>PG: UPDATE aiChunkingStatus = COMPLETED
    end

    rect rgb(207, 226, 255)
        Note over S,ES: Bước 3 — ES Index
        S->>ES: deleteByQuery intake_id
        S->>ES: bulk index IntakeChunkDoc[]
    end

    rect rgb(237, 212, 255)
        Note over S,PG: Bước 4 — Compute Matches
        S->>S: computeMatches(intakeId)
        S->>BGE: embed(aiProcessTitle + content[:1500])
        BGE-->>S: queryVector[1024]
        S->>ES: kNN + BM25\nfilter: opposite type + same sectors
        ES-->>S: top 10 ranked matches
        S->>PG: DELETE old intake_matches for this intake
        S->>PG: INSERT intake_matches (ip_intake_id, challenge_intake_id, score, chunk)
    end
```

---

## 2. Luồng B2B Marketing (LLM Processing)

```mermaid
flowchart TD
    A[Intake mới được tạo] --> B[applyAiProcessing]
    B --> C{Có content?}
    C -- Không --> SKIP[Skip AI, không chunk]
    C -- Có --> E[Build B2B Marketing Prompt\nVietnamese, Enterprise tone]
    E --> F[BullMQ: ai.completion job]
    F --> G{AI Provider}
    G -- default --> H[OpenAI gpt-4o-mini]
    G -- alternative --> I[OpenRouter]
    H & I --> J["Parse JSON\n{ title: string, content: HTML }"]
    J --> K{Parse thành công?}
    K -- Có --> L[UPDATE aiProcessTitle\naiProcessedContent\nstatus=COMPLETED]
    K -- Không --> M[UPDATE status=FAILED\ngiữ nguyên content gốc]
    L --> N[Trigger applyChunkEmbedding]
    M --> O[Log error, skip chunking]
```

**Prompt output format:**
```json
{
  "title": "≤65 ký tự, B2B enterprise tone",
  "content": "<h1>Hero</h1><h2>Tổng quan</h2><h2>Tính năng</h2><h2>Giá trị cốt lõi</h2>"
}
```

---

## 3. Luồng Chunk & Embed (Vector Processing)

```mermaid
flowchart LR
    A[aiProcessedContent\nHTML text] --> B[stripHtml\n→ plainText]
    B --> C[RecursiveCharacterTextSplitter\nchunkSize=1500, overlap=150]
    C --> D["chunks[]\n~1-5 chunks/intake"]
    D --> E[BGE-M3 API\nPOST /embed/text\nbatch all chunks]
    E --> F["embeddings[][1024]\n1 vector per chunk"]
    F --> G[(PostgreSQL\nintake_chunks\ntext + float[1024])]
    G --> H[indexIntake\n→ Elasticsearch]
    H --> I[computeMatches\n→ intake_matches]

    style E fill:#f9a825,color:#000
    style H fill:#0277bd,color:#fff
    style I fill:#6a1b9a,color:#fff
```

---

## 4. Luồng Compute Matches (Queue-based Matching)

Matching chạy qua `intakes-queue` (BullMQ). Có hai nguồn trigger:

### 4a. Automatic (sau khi ES index xong)

```mermaid
flowchart TD
    A[indexIntake hoàn thành] --> B{matchingAuto = true?}
    B -- Không --> SKIP[Skip — user tắt auto-match]
    B -- Có --> C[intakesQueue.add\nintakes.compute-matches]
    C --> D[IntakesProcessor\nhandleComputeMatches]
    D --> E{aiProcessedContent\ntồn tại?}
    E -- Không --> SKIPPED[Skip silently\nlog warning]
    E -- Có --> F[computeMatches intakeId]
    F --> G[BGE-M3 embed + ES search]
    G --> H[DELETE + INSERT intake_matches]

    style H fill:#6a1b9a,color:#fff
    style SKIPPED fill:#999,color:#fff
```

### 4b. Manual (API endpoint)

```mermaid
flowchart TD
    A["POST /:id/compute-matches\n(User or Admin)"] --> B{published?}
    B -- Không --> ERR1[422: must be published]
    B -- Có --> C{aiProcessedContent\ntồn tại?}
    C -- Không --> ERR2[422: run /beautify first]
    C -- Có --> D[intakesQueue.add\nintakes.compute-matches]
    D --> E[200: Matching has been queued]
    D --> F[IntakesProcessor runs async]
    F --> G[computeMatches intakeId]
    G --> H[DELETE + INSERT intake_matches]

    style E fill:#2e7d32,color:#fff
    style H fill:#6a1b9a,color:#fff
```

### Điều kiện match hợp lệ

- Intake candidate phải `status = published`
- Intake candidate phải thuộc user khác (không match với chính mình)
- Intake candidate phải cùng ngành (sectorIds overlap)

**Bảng `intake_matches`:**
```
ip_intake_id        → UUID của IP intake
challenge_intake_id → UUID của Challenge intake
score               → float (hybrid search score)
matched_chunk       → text chunk khớp nhất
chunk_index         → vị trí chunk trong intake
computed_at         → thời điểm tính toán
```

---

## 5. Luồng Tìm kiếm Semantic (Hybrid Search)

Buyer tìm kiếm giải pháp IP theo nội dung mô tả nhu cầu (live search):

```mermaid
sequenceDiagram
    autonumber
    actor B as Buyer
    participant SC as SearchController
    participant SS as SearchService
    participant Q as BullMQ
    participant BGE as BGE-M3 :8003
    participant ES as Elasticsearch

    B->>SC: POST /search\n{ query, type, sectorIds, limit, minScore }
    SC->>SS: search(dto)

    SS->>Q: job: ai.embedding { input: query }
    Q->>BGE: POST /embed/text { text: [query] }
    BGE-->>Q: { embeddings: [[1024 floats]] }
    Q-->>SS: queryVector[1024]

    SS->>ES: Hybrid query
    Note over ES: kNN: embedding (k=limit×3)\n+ BM25: text×1.0, intake_title×2.0, ai_process_title×1.5\n+ filter: type, sector_ids

    ES-->>SS: raw hits (nhiều chunks/intake)
    SS->>SS: Deduplicate: giữ chunk score cao nhất per intake_id
    SS->>SS: Filter score >= minScore → Sort DESC → Slice limit

    SS-->>SC: SearchResultDto { hits[], total, took }
    SC-->>B: { success, data }
```

---

## 6. Luồng đọc Matches (Pre-computed)

Đọc kết quả đã tính sẵn từ DB — không cần gọi BGE-M3 hay ES:

```mermaid
sequenceDiagram
    autonumber
    actor U as User/Admin
    participant C as Controller
    participant S as IntakesService
    participant PG as PostgreSQL

    rect rgb(237, 212, 255)
        Note over U,PG: GET detail — preview 5 matches
        U->>C: GET /intakes/:id
        C->>S: findOne(id)
        S->>PG: SELECT intake + relations
        S->>PG: SELECT intake_matches LIMIT 5 ORDER BY score DESC
        PG-->>S: intake + matches[5]
        S-->>C: intake & { matches }
        C-->>U: { data: { ...intake, matches: [top 5] } }
    end

    rect rgb(207, 226, 255)
        Note over U,PG: GET paginated — full list
        U->>C: GET /intakes/:id/matches?page=2&limit=20
        C->>S: findMatches(id, page, limit)
        S->>PG: SELECT intake_matches\nWHERE ip/challenge_intake_id = id\nORDER BY score DESC\nOFFSET skip LIMIT limit
        PG-->>S: { data, total }
        S-->>C: PaginatedResult
        C-->>U: { data, total, page, limit, totalPages }
    end
```

---

## 7. Luồng Seller → Find Challenges (Live Search)

Seller dùng nội dung IP để tìm kiếm live qua ES (không dùng pre-computed):

```mermaid
sequenceDiagram
    autonumber
    actor S as Seller
    participant C as MyIntakesController
    participant IS as IntakesService
    participant SS as SearchService
    participant BGE as BGE-M3 :8003
    participant ES as Elasticsearch

    S->>C: GET /my/intakes/:id/find-challenges\n?limit=10&minScore=1.5
    C->>IS: findMatchingChallenges(intakeId, userId, limit, minScore)
    IS->>IS: findOneForUserCheck → verify ownership
    IS->>IS: queryText = aiProcessTitle + content[:1500]
    IS->>IS: sectorIds = intake.sectorIds
    IS->>SS: search(queryText, type=CHALLENGE, sectorIds, limit, minScore)
    SS->>BGE: embed(queryText) → queryVector[1024]
    SS->>ES: kNN + BM25, filter: challenge + sectorIds
    ES-->>SS: ranked challenges
    SS-->>C: SearchResultDto { hits, total, took }
    C-->>S: { success, data }
```

> **Khác với `/matches`:** endpoint này gọi BGE-M3 + ES real-time, không đọc từ `intake_matches`. Phù hợp khi cần kết quả tươi nhất ngay sau khi có challenges mới được index.

---

## 8. Trạng thái AI của Intake

```mermaid
stateDiagram-v2
    direction LR

    state "Intake Created" as Created

    state "Step 1: LLM" as LLMState {
        [*] --> PROCESSING_LLM : trigger
        PROCESSING_LLM --> COMPLETED_LLM : success
        PROCESSING_LLM --> FAILED_LLM : error
    }

    state "Step 2: Chunk + Embed" as ChunkState {
        [*] --> PROCESSING_CHUNK : trigger
        PROCESSING_CHUNK --> COMPLETED_CHUNK : BGE-M3 success
        PROCESSING_CHUNK --> FAILED_CHUNK : error
    }

    state "Step 3: ES Index" as ESState {
        [*] --> INDEXED : bulk index
    }

    state "Step 4: Matches" as MatchState {
        [*] --> MATCHED : upsert intake_matches
    }

    Created --> LLMState : fire-and-forget
    COMPLETED_LLM --> ChunkState : fire-and-forget
    COMPLETED_CHUNK --> ESState : fire-and-forget
    ESState --> MatchState : .then()

    note right of FAILED_LLM : Skip chunk + match
    note right of FAILED_CHUNK : Skip ES + match
```

---

## 9. Kiến trúc Queue (BullMQ)

```mermaid
flowchart TB
    subgraph Producers["Producers (IntakesService / SearchService)"]
        P1[aiService.completion]
        P2[aiService.chunkEmbed]
        P3[aiService.embedding]
        P4[intakesQueue.add\nintakes.compute-matches]
    end

    subgraph AiRedis["Redis — ai-queue"]
        R1[ai.completion jobs]
        R2[ai.chunk-embed jobs]
        R3[ai.embedding jobs]
    end

    subgraph IntakesRedis["Redis — intakes-queue"]
        R4[intakes.compute-matches jobs]
    end

    subgraph AiProc["AiProcessor (@nestjs/bullmq)"]
        W1[handleCompletion\n→ B2B Marketing]
        W2[handleChunkEmbed\n→ strip + split + embed]
        W3[handleEmbedding\n→ vector encode]
    end

    subgraph IntakesProc["IntakesProcessor (@nestjs/bullmq)"]
        W4[handleComputeMatches\n→ BGE-M3 embed + ES search\n→ upsert intake_matches]
    end

    subgraph Providers["AI Providers"]
        V1[OpenAI gpt-4o-mini]
        V2[OpenRouter]
        V3[BGE-M3 :8003]
    end

    P1 --> R1 --> W1
    P2 --> R2 --> W2
    P3 --> R3 --> W3
    P4 --> R4 --> W4

    W1 --> V1 & V2
    W2 --> V3
    W3 --> V3
    W4 --> V3
```

---

## 10. Cấu trúc dữ liệu

### Elasticsearch Index: `intake_chunks`

```mermaid
erDiagram
    INTAKE_CHUNKS_ES {
        keyword intake_id "UUID của intake"
        integer chunk_index "Thứ tự chunk 0,1,2..."
        text text "Nội dung chunk (≤1500 chars)"
        dense_vector embedding "1024 floats (cosine sim)"
        text intake_title "Title gốc"
        text ai_process_title "Title sau LLM"
        keyword intake_type "ip hoặc challenge"
        keyword sector_ids "UUID[] sector"
        text sector_names "Tên sector"
    }
```

**Hybrid search score:**
```
_score = kNN_score(cosine_similarity) + BM25_score
       = vector_relevance + text_relevance(title×2.0, ai_title×1.5, content×1.0)
```

### PostgreSQL: `intake_matches`

```mermaid
erDiagram
    INTAKES ||--o{ INTAKE_MATCHES : "ip_intake_id"
    INTAKES ||--o{ INTAKE_MATCHES : "challenge_intake_id"

    INTAKE_MATCHES {
        uuid id PK
        uuid ip_intake_id FK "→ intakes (type=ip)"
        uuid challenge_intake_id FK "→ intakes (type=challenge)"
        float score "Hybrid search score"
        text matched_chunk "Best matching chunk text"
        int chunk_index "Chunk position"
        timestamp computed_at
        timestamp updated_at
    }

    INTAKES {
        uuid id PK
        varchar title
        varchar ai_process_title
        text ai_processed_content
        enum type "ip | challenge"
        text[] sector_ids
        enum ai_processing_status
        enum ai_chunking_status
    }
```

---

## 11. Tóm tắt tất cả Endpoints liên quan AI

| Endpoint | Auth | Mô tả |
|----------|------|-------|
| `POST /my/intakes` | User | Tạo IP/Challenge → trigger full AI pipeline |
| `POST /admin/intakes` | Admin | Như trên |
| `PATCH /my/intakes/:id` | User | Update content → re-trigger pipeline |
| `POST /my/intakes/:id/beautify` | User | LLM làm đẹp intake → lưu `aiProcessedContent` |
| `POST /admin/intakes/:id/beautify` | Admin | Như trên, không cần ownership |
| `POST /my/intakes/:id/compute-matches` | User | Trigger matching thủ công qua queue (phải published + có aiProcessedContent) |
| `POST /admin/intakes/:id/compute-matches` | Admin | Như trên, không cần ownership |
| `POST /search` | Public | Live hybrid search (BGE-M3 + ES) |
| `GET /my/intakes/:id/find-challenges` | User | Live search challenges theo IP intake |
| `GET /intakes/:id` | Public | Detail + top 5 pre-computed matches |
| `GET /my/intakes/:id` | User | Detail + top 5 pre-computed matches |
| `GET /admin/intakes/:id` | Admin | Detail + top 5 pre-computed matches |
| `GET /intakes/:id/matches` | Public | Paginated pre-computed matches |
| `GET /my/intakes/:id/matches` | User | Paginated matches (ownership check) |
| `GET /admin/intakes/:id/matches` | Admin | Paginated matches |
| `POST /ai/completion` | Admin | Test B2B marketing prompt |
| `POST /ai/embedding` | Admin | Test BGE-M3 embedding |
| `POST /ai/chat` | Admin | Test LLM chat |

---

## 12. Environment Configuration

```mermaid
flowchart LR
    subgraph EnvVars["Environment Variables"]
        E1[AI_DEFAULT_PROVIDER\ndefault: openai]
        E2[OPENAI_API_KEY\nOPENAI_DEFAULT_MODEL]
        E3[OPENROUTER_API_KEY\nOPENROUTER_BASE_URL\nOPENROUTER_DEFAULT_MODEL]
        E4[BGE_M3_URL\ndefault: localhost:8003]
        E5[ES_URL\ndefault: localhost:9200]
        E6[REDIS_URL\nfor BullMQ queue]
    end

    subgraph Services["Services"]
        S1[OpenAI gpt-4o-mini\nB2B Marketing LLM]
        S2[OpenRouter\nAlternative LLM]
        S3[BGE-M3 Local\nEmbedding 1024-dim]
        S4[Elasticsearch\nVector + Text Search]
        S5[Redis\nJob Queue]
    end

    E1 & E2 --> S1
    E1 & E3 --> S2
    E4 --> S3
    E5 --> S4
    E6 --> S5
```
