from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.embedder import embedder

router = APIRouter(prefix="/embed", tags=["Embedding"])


# ─── Simple endpoint (for NestJS / external callers) ─────────────────────────

class TextEmbedRequest(BaseModel):
    text: str | list[str] = Field(..., description="Text or list of texts to embed")


class TextEmbedResponse(BaseModel):
    embeddings: list[list[float]]
    model: str
    count: int


@router.post("/text", response_model=TextEmbedResponse, summary="Embed text (dense vector only)")
async def embed_text(body: TextEmbedRequest) -> TextEmbedResponse:
    """Simple endpoint — returns dense vectors only. Intended for NestJS backend."""
    sentences = body.text if isinstance(body.text, list) else [body.text]

    try:
        result = embedder.embed(sentences, return_dense=True)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return TextEmbedResponse(
        embeddings=result["dense"],
        model=settings.model_name,
        count=len(sentences),
    )


# ─── Advanced endpoint (dense + sparse + colbert) ────────────────────────────

class EmbedRequest(BaseModel):
    input: str | list[str] = Field(..., description="Single string or list of strings to embed")
    batch_size: int = Field(12, ge=1, le=128)
    return_dense: bool = Field(True, description="Return dense vectors (1024-dim)")
    return_sparse: bool = Field(False, description="Return sparse lexical weights")
    return_colbert: bool = Field(False, description="Return ColBERT multi-vectors")


class EmbedResponse(BaseModel):
    dense: list[list[float]] | None = None
    sparse: list[dict] | None = None
    colbert: list[list[list[float]]] | None = None
    model: str
    count: int


@router.post("", response_model=EmbedResponse, summary="Embed with full options")
async def embed(body: EmbedRequest) -> EmbedResponse:
    sentences = body.input if isinstance(body.input, list) else [body.input]

    try:
        result = embedder.embed(
            sentences,
            batch_size=body.batch_size,
            return_dense=body.return_dense,
            return_sparse=body.return_sparse,
            return_colbert=body.return_colbert,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return EmbedResponse(
        dense=result.get("dense"),
        sparse=result.get("sparse"),
        colbert=result.get("colbert"),
        model=settings.model_name,
        count=len(sentences),
    )
