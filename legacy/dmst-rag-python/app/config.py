from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    model_name: str = "BAAI/bge-m3"
    model_device: str = "cpu"
    model_max_length: int = 8192
    model_cache_dir: str = "./model_cache"

    # Cross-encoder for /rerank. Loaded lazily on first call (weights ~2.2 GB), never at startup.
    reranker_model: str = "BAAI/bge-reranker-v2-m3"


settings = Settings()
