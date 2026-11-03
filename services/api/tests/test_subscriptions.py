import pytest
import jwt
from app.models.subscription import memory_store
from app.core.security import DEMO_USER_ID
from app.core.config import settings


@pytest.fixture(autouse=True)
def reset_store():
    """Reset in-memory store before each test to guarantee test isolation."""
    memory_store.reset()


def make_auth_header(user_id: str) -> dict:
    # Use unverified JWT token decoding supported by development/test environment
    token = jwt.encode(
        {"sub": user_id, "role": "authenticated"},
        "test-secret-key-for-testing-only-32bytes",
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def test_list_demo_subscriptions(client):
    """Demo user can list seed subscriptions."""
    response = client.get("/api/v1/subscriptions")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 6
    names = [s["name"] for s in data["items"]]
    assert "StreamBox" in names
    assert "MusicPlus" in names
    assert "AIWriter" in names


def test_filter_subscriptions_by_status(client):
    response = client.get("/api/v1/subscriptions?status=active")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["status"] == "active"


def test_filter_subscriptions_by_category(client):
    response = client.get("/api/v1/subscriptions?category=entertainment")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) >= 2
    for item in data["items"]:
        assert item["category"] == "entertainment"


def test_search_subscriptions(client):
    response = client.get("/api/v1/subscriptions?search=streambox")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "StreamBox"


def test_get_single_subscription(client):
    sub_id = "11111111-0000-0000-0000-000000000001"
    response = client.get(f"/api/v1/subscriptions/{sub_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sub_id
    assert data["name"] == "StreamBox"
    assert data["amount_minor"] == 64900
    assert data["currency"] == "INR"
    assert data["last_amount_minor"] == 49900


def test_get_nonexistent_subscription_returns_404(client):
    response = client.get("/api/v1/subscriptions/00000000-9999-9999-9999-000000000000")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_subscription(client):
    payload = {
        "name": "Cloud Storage Pro",
        "category": "productivity",
        "amount_minor": 29900,
        "currency": "inr",  # Should be normalized to INR
        "billing_interval": "monthly",
        "status": "active",
        "source": "manual",
        "notes": "Added during integration testing",
    }
    response = client.post("/api/v1/subscriptions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Cloud Storage Pro"
    assert data["merchant_key"] == "cloudstoragepro"
    assert data["currency"] == "INR"
    assert data["amount_minor"] == 29900
    assert data["user_id"] == DEMO_USER_ID
    assert "next_renewal_at" in data
    assert data["next_renewal_at"] is not None


def test_create_subscription_validation_errors(client):
    # Test negative amount
    neg_payload = {
        "name": "Invalid Sub",
        "amount_minor": -100,
        "currency": "INR",
        "billing_interval": "monthly",
    }
    res1 = client.post("/api/v1/subscriptions", json=neg_payload)
    assert res1.status_code == 422

    # Test invalid interval
    bad_interval = {
        "name": "Invalid Interval",
        "amount_minor": 1000,
        "currency": "INR",
        "billing_interval": "biweekly_not_supported",
    }
    res2 = client.post("/api/v1/subscriptions", json=bad_interval)
    assert res2.status_code == 422

    # Test empty name
    empty_name = {
        "name": "",
        "amount_minor": 1000,
        "currency": "INR",
        "billing_interval": "monthly",
    }
    res3 = client.post("/api/v1/subscriptions", json=empty_name)
    assert res3.status_code == 422


def test_update_subscription_and_track_price_change(client):
    sub_id = "11111111-0000-0000-0000-000000000002"  # MusicPlus, currently 11900
    update_payload = {
        "amount_minor": 14900,  # Price increased
        "notes": "Student plan expired, upgraded to standard",
    }
    response = client.patch(f"/api/v1/subscriptions/{sub_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["amount_minor"] == 14900
    assert data["last_amount_minor"] == 11900  # Automatically preserved historical amount!
    assert data["notes"] == "Student plan expired, upgraded to standard"


def test_delete_subscription(client):
    sub_id = "11111111-0000-0000-0000-000000000003"
    del_res = client.delete(f"/api/v1/subscriptions/{sub_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Verify it is no longer retrieved
    get_res = client.get(f"/api/v1/subscriptions/{sub_id}")
    assert get_res.status_code == 404


def test_user_data_isolation(client):
    """Ensure User B cannot access or modify User A's subscription."""
    user_a = "00000000-0000-0000-0000-aaaaaaaaaaaa"
    user_b = "00000000-0000-0000-0000-bbbbbbbbbbbb"

    headers_a = make_auth_header(user_a)
    headers_b = make_auth_header(user_b)

    # User A creates a subscription
    create_payload = {
        "name": "Secret User A Subscription",
        "amount_minor": 50000,
        "currency": "INR",
        "billing_interval": "monthly",
    }
    created_res = client.post("/api/v1/subscriptions", json=create_payload, headers=headers_a)
    assert created_res.status_code == 201
    sub_a_id = created_res.json()["id"]

    # User B lists subscriptions - must NOT contain User A's subscription
    list_b_res = client.get("/api/v1/subscriptions", headers=headers_b)
    assert list_b_res.status_code == 200
    b_ids = [s["id"] for s in list_b_res.json()["items"]]
    assert sub_a_id not in b_ids

    # User B tries to directly fetch User A's subscription - must 404
    get_b_res = client.get(f"/api/v1/subscriptions/{sub_a_id}", headers=headers_b)
    assert get_b_res.status_code == 404

    # User B tries to update User A's subscription - must 404
    update_b_res = client.patch(
        f"/api/v1/subscriptions/{sub_a_id}",
        json={"name": "Hacked Subscription"},
        headers=headers_b,
    )
    assert update_b_res.status_code == 404

    # User B tries to delete User A's subscription - must 404
    del_b_res = client.delete(f"/api/v1/subscriptions/{sub_a_id}", headers=headers_b)
    assert del_b_res.status_code == 404
