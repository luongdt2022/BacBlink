import logging
from typing import Literal

from FlagEmbedding import BGEM3FlagModel

from app.config import settings

logger = logging.getLogger(__name__)


class Embedder:
    """Wrapper around BGE-M3 model.

    BGE-M3 supports three embedding types simultaneously:
      - dense  : standard dense vector (1024-dim)
      - sparse : sparse lexical weights (for BM25-style retrieval)
      - colbert : multi-vector late interaction
    """

    def __init__(self) -> None:
        self._model: BGEM3FlagModel | None = None

    def load(self) -> None:
        logger.info("Loading BGE-M3 model: %s (device=%s)", settings.model_name, settings.model_device)
        self._model = BGEM3FlagModel(
            settings.model_name,
            use_fp16=settings.model_device != "cpu",
            device=settings.model_device,
            cache_dir=settings.model_cache_dir,
        )
        logger.info("BGE-M3 model loaded successfully")

    @property
    def model(self) -> BGEM3FlagModel:
        if self._model is None:
            raise RuntimeError("Embedder not initialised — call load() first")
        return self._model

    def embed(
        self,
        sentences: list[str],
        batch_size: int = 12,
        max_length: int | None = None,
        return_dense: bool = True,
        return_sparse: bool = False,
        return_colbert: bool = False,
    ) -> dict[Literal["dense", "sparse", "colbert"], list]:
        output = self.model.encode(
            sentences,
            batch_size=batch_size,
            max_length=max_length or settings.model_max_length,
            return_dense=return_dense,
            return_sparse=return_sparse,
            return_colbert_vecs=return_colbert,
        )

        result: dict = {}
        if return_dense:
            result["dense"] = output["dense_vecs"].tolist()
        if return_sparse:
            # BGE-M3 hands back defaultdicts whose values are numpy.float32, and
            # pydantic v2 refuses to serialize those — the endpoint 500s with
            # "Unable to serialize unknown type: <class 'numpy.float32'>".
            # Coerce to plain Python types before it reaches the response model.
            result["sparse"] = [
                {str(token): float(weight) for token, weight in weights.items()}
                for weights in output["lexical_weights"]
            ]
        if return_colbert:
            result["colbert"] = [v.tolist() for v in output["colbert_vecs"]]

        return result


# Module-level singleton — initialised on startup
embedder = Embedder()
