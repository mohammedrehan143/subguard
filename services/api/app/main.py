from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.errors import register_error_handlers
from app.api.v1.router import api_router
from datetime import datetime, timezone

setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
register_error_handlers(app)

# Include v1 router with prefix /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Top-level health check endpoint for reverse proxy or container checks
@app.get("/health", tags=["Health"])
async def root_health():
    return {
        "status": "healthy",
        "service": "subguard-api",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
