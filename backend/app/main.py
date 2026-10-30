import time
import uuid
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.routers import (
    auth_router,
    patients_router,
    staff_router,
    resources_router,
    ai_router,
    analytics_router
)
from app.seed_data import seed_database

# Configure Structured Logging
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("aegishealth")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and auto-seed initial clinical dataset
    logger.info(json.dumps({"event": "STARTUP", "message": "Initializing Database schema and verifying seed data..."}))
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    logger.info(json.dumps({"event": "SHUTDOWN", "message": "AegisHealth AI backend cleanly terminated."}))

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-grade Clinical Decision Support Platform for B.Tech CSE at NIET Greater Noida "
        "under Dr. Mohd. Nazim's Artificial Intelligence course, mapped to UN SDG 3: Good Health and Well-Being."
    ),
    version="2.4.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"]
)

# Structured Logging & Request-ID Middleware
@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    # Extract or generate Request ID
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id

    start_time = time.time()
    response: Response = await call_next(request)
    process_time_ms = round((time.time() - start_time) * 1000, 2)

    # Attach Request ID to response header
    response.headers["X-Request-ID"] = request_id

    # Emit structured JSON log
    log_entry = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "client_ip": request.client.host if request.client else "unknown",
        "duration_ms": process_time_ms
    }
    logger.info(json.dumps(log_entry))
    return response

# Mount Routers under API v1 prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(patients_router, prefix=settings.API_V1_STR)
app.include_router(staff_router, prefix=settings.API_V1_STR)
app.include_router(resources_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

# Dedicated Health Check Route
@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    """System health check endpoint verifying database connectivity and operational status."""
    db_connected = False
    try:
        db = SessionLocal()
        db.execute(Base.metadata.tables['users'].select().limit(1))
        db.close()
        db_connected = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")

    return {
        "status": "healthy" if db_connected else "degraded",
        "database": "connected" if db_connected else "disconnected",
        "platform": settings.PROJECT_NAME,
        "version": "2.4.0",
        "academic_affiliation": {
            "institution": "NIET Greater Noida",
            "department": "B.Tech CSE",
            "course": "Artificial Intelligence (Dr. Mohd. Nazim)",
            "sdg_target": "SDG 3: Good Health and Well-Being"
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "academic_affiliation": {
            "institution": "Noida Institute of Engineering & Technology (NIET), Greater Noida",
            "department": "Department of Computer Science & Engineering (B.Tech CSE)",
            "course": "Artificial Intelligence (Dr. Mohd. Nazim)",
            "sdg_mapping": "SDG 3: Good Health and Well-Being"
        },
        "status": "OPERATIONAL",
        "version": "2.4.0",
        "documentation": "/docs",
        "health_check": "/health",
        "api_v1_base": settings.API_V1_STR,
        "ethical_mandate": "Human-in-the-Loop Decision Support System. Final authority with attending medical practitioner."
    }
