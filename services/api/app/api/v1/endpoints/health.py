from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel
from app.integrations.supabase.client import is_supabase_configured

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    supabase_connected: bool
    database_mode: str
    timestamp: str

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    supabase_ready = is_supabase_configured()
    return HealthResponse(
        status="healthy",
        service="subguard-api",
        version="0.1.0",
        environment="development",
        supabase_connected=supabase_ready,
        database_mode="live" if supabase_ready else "demo",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
