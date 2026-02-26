from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:vairavan@localhost:5432/Health"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 8
    allowed_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:3000,https://health-final-ashy.vercel.app"
    register_secret: str = "vitasage-bootstrap-secret"

    class Config:
        env_file = ".env"


settings = Settings()
