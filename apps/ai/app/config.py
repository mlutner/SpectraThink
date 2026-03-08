"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    database_url: str = ""
    node_service_url: str = "http://localhost:3001"
    debug: bool = False

    model_config = {"env_file": "../../.env", "extra": "ignore"}


settings = Settings()
