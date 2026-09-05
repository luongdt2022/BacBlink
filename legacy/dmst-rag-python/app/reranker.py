import logging

from FlagEmbedding import FlagReranker

from app.config import settings

logger = logging.getLogger(__name__)


class Reranker:
    """Cross-encoder rerank (BAAI/bge-reranker-v2-m3).

    Loaded lazily on first call, not at startup: the embedding model is the
    service's core and must be ready at /health; the reranker is optional
    (the .NET backend only calls /rerank when Matching:UseRerank is on) and
    its weights (~2.2 GB) should not gate startup.
    """

    def __init__(self) -> None:
        self._model: FlagReranker | None = None

    def load(self) -> None:
        if self._model is not None:
            return
        logger.info("Loading reranker: %s (device=%s)", settings.reranker_model, settings.model_device)
        self._model = FlagReranker(
            settings.reranker_model,
            use_fp16=settings.model_device != "cpu",
            device=settings.model_device,
            cache_dir=settings.model_cache_dir,
        )
        logger.info("Reranker loaded")

    def score(self, query: str, passages: list[str], normalize: bool = True) -> list[float]:
        self.load()
        assert self._model is not None
        pairs = [[query, p] for p in passages]
        result = self._model.compute_score(pairs, normalize=normalize)
        if isinstance(result, (int, float)):
            result = [result]
        # numpy scalars are not JSON-serialisable by pydantic v2 — same trap as lexical_weights.
        return [float(x) for x in result]


reranker = Reranker()
