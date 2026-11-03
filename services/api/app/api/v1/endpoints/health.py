from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    timestamp: str

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service="subguard-api",
        version="0.1.0",
        environment="development",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
