from typing import Optional
from supabase import create_client, Client
from app.core.config import settings
from app.core.logging import logger

_supabase_client: Optional[Client] = None

def is_supabase_configured() -> bool:
    """Checks whether valid Supabase configuration is present."""
    return bool(
        settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_ROLE_KEY
        and not settings.SUPABASE_URL.startswith("https://placeholder")
    )

def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase client using server-side service-role key.
    Returns None if credentials are not configured, permitting safe demo/offline operation.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not is_supabase_configured():
        logger.warning(
            "Supabase credentials (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) not configured. "
            "Running in safe demo/mock database mode."
        )
        return None

    try:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        logger.info("Supabase client initialized successfully with service role.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None
