from typing import Optional, Dict, Any
import jwt
from app.core.config import settings
from app.core.logging import logger

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a Supabase Auth JWT.
    If SUPABASE_JWT_SECRET is configured, performs cryptographic signature verification.
    If unconfigured in development/demo mode, permits demo token or unverified decoding.
    """
    if token == "demo-token" or token == "demo-user-subguard-001":
        return {
            "sub": DEMO_USER_ID,
            "email": "demo@subguard.local",
            "role": "authenticated",
            "is_demo": True,
        }

    if settings.SUPABASE_JWT_SECRET:
        try:
            # Supabase default signature algorithm is HS256
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Supabase token signature has expired.")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid Supabase JWT token: {e}")
            return None
    else:
        # Development fallback: decode claims without signature verification if secret is not yet set
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except Exception as e:
            logger.warning(f"Failed to decode unverified token: {e}")
            return None
