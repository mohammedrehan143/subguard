from app.integrations.supabase.client import is_supabase_configured, get_supabase_client
from app.core.config import settings

def test_supabase_unconfigured_by_default():
    # Without environment variables, Supabase should be reported as unconfigured
    # and get_supabase_client() should return None rather than raising an unhandled exception
    assert is_supabase_configured() is False
    client = get_supabase_client()
    assert client is None

def test_supabase_configured_detection(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "dummy-service-key")
    assert is_supabase_configured() is True
