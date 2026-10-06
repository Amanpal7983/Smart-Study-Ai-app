from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://root:password@localhost:3306/studyai"
    jwt_secret: str | None = None
    jwt_secret_key: str | None = None
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 10080
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.6-flash"
    gemini_fallback_model: str = "gemini-3.1-flash-lite"
    ai_rate_limit_per_hour: int = 20
    client_origin: str = "http://localhost:5173"
    port: int = 4000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def effective_jwt_secret(self) -> str:
        if self.jwt_secret_key:
            return self.jwt_secret_key
        if self.jwt_secret:
            return self.jwt_secret
        raise RuntimeError("JWT_SECRET or JWT_SECRET_KEY must be configured")

@lru_cache
def get_settings() -> Settings:
    return Settings()
