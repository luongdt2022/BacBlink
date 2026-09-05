import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.embedder import embedder
from app.routes.embed import router as embed_router
from app.routes.rerank import router as rerank_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    embedder.load()
    yield
    # Cleanup on shutdown (nothing needed for torch)
    logger.info("Shutting down embedding service")


app = FastAPI(
    title="DMST Embedding Service",
    description="BGE-M3 vector embedding service",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.app_env != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(embed_router)
app.include_router(rerank_router)


@app.get("/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok", "model": settings.model_name}
