from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.reranker import reranker

router = APIRouter(prefix="/rerank", tags=["Rerank"])


class RerankRequest(BaseModel):
    query: str = Field(..., min_length=1)
    passages: list[str] = Field(..., min_length=1, max_length=100)
    normalize: bool = Field(True, description="Apply sigmoid so scores are in [0, 1]")


class RerankResponse(BaseModel):
    scores: list[float]
    model: str
    count: int


@router.post("", response_model=RerankResponse, summary="Cross-encoder rerank of query/passage pairs")
async def rerank(body: RerankRequest) -> RerankResponse:
    try:
        scores = reranker.score(body.query, body.passages, normalize=body.normalize)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return RerankResponse(scores=scores, model=settings.reranker_model, count=len(body.passages))
