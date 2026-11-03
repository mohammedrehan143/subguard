from fastapi import APIRouter
from app.api.v1.endpoints import health, subscriptions

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
