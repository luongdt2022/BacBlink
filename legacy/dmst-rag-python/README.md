# DMST Embedding Service

A lightweight FastAPI service that serves [BGE-M3](https://huggingface.co/BAAI/bge-m3) dense vector embeddings. Built to power the semantic search and intake-matching features of the DMST backend.

## Features

- **Dense embeddings** (1024-dim) via BGE-M3 — used for kNN vector search in Elasticsearch
- **Sparse & ColBERT** embeddings available via the advanced endpoint
- Batch inference — encode multiple texts in a single request
- Model loaded once at startup, served in-memory for low latency
- CPU and GPU (`cuda` / `mps`) support via `MODEL_DEVICE`
- Swagger UI at `/docs` (disabled in production)
- Health check at `/health`

## API Endpoints

### `POST /embed/text` — Simple (used by DMST backend)

Returns dense vectors only. Accepts a single string or an array of strings.

```http
POST /embed/text
Content-Type: application/json

{
  "text": ["sentence one", "sentence two"]
}
```

**Response:**
```json
{
  "embeddings": [[0.021, -0.034, ...], [0.018, 0.052, ...]],
  "model": "BAAI/bge-m3",
  "count": 2
}
```

---

### `POST /rerank` — Cross-encoder rerank (BAAI/bge-reranker-v2-m3)

Used by the .NET backend when `Matching:UseRerank` is on. The reranker loads lazily on the first call
(~2.2 GB of weights, cached under `MODEL_CACHE_DIR`), so `/health` is not gated by it.

```http
POST /rerank
{ "query": "màng lọc sinh học", "passages": ["...", "..."], "normalize": true }
```

**Response:** `{ "scores": [0.91, 0.07], "model": "BAAI/bge-reranker-v2-m3", "count": 2 }` — sigmoid scores in [0, 1] when `normalize` is true.

---

### `POST /embed` — Advanced (dense + sparse + ColBERT)

```http
POST /embed
Content-Type: application/json

{
  "input": ["sentence one", "sentence two"],
  "batch_size": 12,
  "return_dense": true,
  "return_sparse": false,
  "return_colbert": false
}
```

**Response:**
```json
{
  "dense": [[0.021, -0.034, ...], ...],
  "sparse": null,
  "colbert": null,
  "model": "BAAI/bge-m3",
  "count": 2
}
```

---

### `GET /health`

```json
{ "status": "ok", "model": "BAAI/bge-m3" }
```

## Requirements

- Python 3.11+
- ~2 GB disk space for the model weights (downloaded on first startup)
- RAM: ~1.5 GB (CPU) / ~1 GB VRAM (GPU with fp16)

## Local Development

**1. Clone and set up environment**

```bash
git clone <repo-url>
cd dmst-embedding

python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

pip install -r requirements-dev.txt
```

**2. Configure environment**

```bash
cp .env.example .env
```

Edit `.env` as needed:

```env
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8003

MODEL_NAME=BAAI/bge-m3
MODEL_DEVICE=cpu          # cpu | cuda | mps
MODEL_MAX_LENGTH=8192
MODEL_CACHE_DIR=./model_cache
```

**3. Run the service**

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

The model will be downloaded from Hugging Face on first startup (~2 GB). Subsequent starts load from `./model_cache`.

**4. Test**

```bash
curl -X POST http://localhost:8003/embed/text \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world"}'
```

## Docker

**Build and run:**

```bash
docker build -t dmst-embedding .

docker run -p 8003:8000 \
  -v $(pwd)/model_cache:/app/model_cache \
  -e MODEL_DEVICE=cpu \
  dmst-embedding
```

> Mount `model_cache` as a volume to avoid re-downloading the model on each container restart.

**With GPU (NVIDIA):**

```bash
docker run --gpus all -p 8003:8000 \
  -v $(pwd)/model_cache:/app/model_cache \
  -e MODEL_DEVICE=cuda \
  dmst-embedding
```

## Project Structure

```
dmst-embedding/
├── app/
│   ├── main.py          # FastAPI app, lifespan (model load/unload)
│   ├── config.py        # Settings via pydantic-settings + .env
│   ├── embedder.py      # BGE-M3 model wrapper (singleton)
│   └── routes/
│       └── embed.py     # /embed/text and /embed endpoints
├── model_cache/         # Downloaded model weights (gitignored)
├── requirements.txt     # Production dependencies
├── requirements-dev.txt # Dev dependencies (ruff, pytest, httpx)
├── pyproject.toml       # Poetry config + ruff settings
├── Dockerfile
└── .env.example
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_ENV` | `development` | `development` or `production` (disables `/docs` in prod) |
| `APP_HOST` | `0.0.0.0` | Host to bind |
| `APP_PORT` | `8000` | Port to bind (override to `8003` in `.env`) |
| `MODEL_NAME` | `BAAI/bge-m3` | Hugging Face model ID |
| `MODEL_DEVICE` | `cpu` | `cpu`, `cuda`, or `mps` |
| `MODEL_MAX_LENGTH` | `8192` | Max token length per input |
| `MODEL_CACHE_DIR` | `./model_cache` | Local path for cached model weights |

## Development Tools

```bash
# Lint & format
ruff check .
ruff format .

# Run tests
pytest
```

## Deployment

### Automatic CD (GitHub Actions — self-hosted runner)

Every push or merge to `master` triggers the CD workflow automatically via a GitHub Actions self-hosted runner installed on the server. No manual action required.

**Monitor a deploy**: GitHub repo → Actions tab → latest "CD — Deploy to Server" run.

**Check the running container after a deploy:**

```bash
docker ps -f name=dmst-rag
docker logs dmst-rag --tail 50
```

The workflow performs in order:
1. Stashes any local server changes (restored afterward)
2. `git checkout master` → `git pull origin master`
3. `docker build -t dmst-rag:latest .`
4. Stops and removes the old `dmst-rag` container (only after a successful build)
5. Starts a new container (`--restart unless-stopped`, port `8000`)

If a `.env` file exists at the server repo path, it is passed to the container automatically.

See [`specs/002-github-runner-cd/quickstart.md`](specs/002-github-runner-cd/quickstart.md) for runner setup instructions and acceptance tests.

### Manual Deploy (fallback)

If the self-hosted runner is unavailable, deploy manually on the server:

```bash
cd /home/sotatek/projects/dmst/dmst-rag
bash deploy.sh
```

See [`specs/001-cd-deploy-docker/quickstart.md`](specs/001-cd-deploy-docker/quickstart.md) for the manual deploy runbook.

---

## Integration with DMST Backend

The DMST NestJS backend connects to this service via the `BGE_M3_URL` environment variable (default: `http://localhost:8003`). It calls `POST /embed/text` to:

1. **Index intakes** — embed text chunks after AI processing, store 1024-dim vectors in PostgreSQL and Elasticsearch
2. **Search** — embed the query string before running hybrid kNN + BM25 search in Elasticsearch
