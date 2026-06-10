"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./reminders.db"
    
    # Vapi Configuration
    VAPI_API_KEY: str = ""
    VAPI_ASSISTANT_ID: str = ""
    VAPI_PHONE_NUMBER_ID: str = ""
    
    # Twilio Configuration
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Phone parsing (used when user enters local format like 03xxxxxxxxx)
    DEFAULT_PHONE_REGION: str = "PK"
    
    # Application
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
