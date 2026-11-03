from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings
from app.core.security import decode_access_token, DEMO_USER_ID

async def get_current_user_id(
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Extracts and authenticates user_id from the Authorization header.
    In development/demo mode without headers, falls back to DEMO_USER_ID.
    """
    if not authorization:
        if settings.APP_ENV == "production":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header",
            )
        return DEMO_USER_ID

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Bearer required.",
        )

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    return str(payload["sub"])
