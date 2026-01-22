"""
FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import logging

from app.config import get_settings
from app.database import init_db
from app.routers import reminders
from app.services.scheduler import reminder_scheduler
from app.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()

# App version
APP_VERSION = "1.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting application...")
    
    # Initialize database
    init_db()
    logger.info("Database initialized")
    
    # Start the reminder scheduler
    reminder_scheduler.start()
    logger.info("Reminder scheduler started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    reminder_scheduler.stop()
    logger.info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Call Me Reminder API",
    description="A reminder app that calls you with voice messages using Vapi",
    version=APP_VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(reminders.router, prefix="/api")


@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Call Me Reminder API",
        "version": APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version=APP_VERSION
    )


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
async def api_health_check():
    """API health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version=APP_VERSION
    )
