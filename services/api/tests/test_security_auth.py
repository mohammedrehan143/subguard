import pytest
import jwt
from fastapi import HTTPException
from app.core.security import decode_access_token, DEMO_USER_ID
from app.api.deps import get_current_user_id
from app.core.config import settings

def test_decode_demo_token():
    payload = decode_access_token("demo-token")
    assert payload is not None
    assert payload["sub"] == DEMO_USER_ID
    assert payload["is_demo"] is True

def test_decode_signed_jwt_with_secret(monkeypatch):
    secret = "test-jwt-secret-key-123456789012345"
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", secret)

    token = jwt.encode(
        {"sub": "user-uuid-123", "aud": "authenticated", "role": "authenticated"},
        secret,
        algorithm="HS256",
    )

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user-uuid-123"

def test_decode_invalid_jwt():
    payload = decode_access_token("gibberish-not-a-token")
    assert payload is None

@pytest.mark.anyio
async def test_get_current_user_id_demo():
    user_id = await get_current_user_id(None)
    assert user_id == DEMO_USER_ID

@pytest.mark.anyio
async def test_get_current_user_id_invalid_scheme():
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user_id("Basic someuser:somepass")
    assert exc_info.value.status_code == 401
