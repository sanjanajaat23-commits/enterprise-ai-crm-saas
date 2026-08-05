from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.0-flash"
    FRONTEND_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGINS.split(",") if o.strip()]


settings = Settings()
