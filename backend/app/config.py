import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Intelligent Healthcare Decision Support Platform"
    PROJECT_SUBTITLE: str = "B.Tech CSE - NIET Greater Noida | Dr. Mohd. Nazim | SDG 3: Good Health & Well-Being"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "niet_cse_ai_healthcare_secret_key_2026_sdg3_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database: Use DATABASE_URL if set (e.g. postgresql://user:pass@db:5432/healthcare),
    # else fall back to local sqlite file for instant zero-dependency running.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aegis_health.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()

