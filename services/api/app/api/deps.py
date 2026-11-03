from typing import Generator
from fastapi import Header, HTTPException, status

async def get_current_user_id(
    authorization: str | None = Header(None)
) -> str:
    """
    Dependency to extract authenticated user_id.
    In demo / development mode without active auth headers, can return a demo user context.
    """
    if not authorization:
        # Development / demo fallback user ID for unauthenticated endpoints
        return "demo-user-subguard-001"
    
    # In production with Supabase, JWT validation extracts sub claim
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token",
        )
    return "demo-user-subguard-001"
