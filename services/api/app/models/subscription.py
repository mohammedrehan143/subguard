from datetime import datetime, timezone
from typing import Dict, Any, List
import copy
from app.core.security import DEMO_USER_ID


def get_default_demo_subscriptions() -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "11111111-0000-0000-0000-000000000001",
            "user_id": DEMO_USER_ID,
            "name": "StreamBox",
            "merchant_key": "streambox",
            "category": "entertainment",
            "amount_minor": 64900,
            "currency": "INR",
            "billing_interval": "monthly",
            "interval_days": 30,
            "next_renewal_at": "2026-11-05T00:00:00Z",
            "status": "active",
            "source": "demo",
            "paypal_subscription_id": None,
            "notes": "Premium 4K plan. Price increased from 49900 last month.",
            "last_amount_minor": 49900,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        },
        {
            "id": "11111111-0000-0000-0000-000000000002",
            "user_id": DEMO_USER_ID,
            "name": "MusicPlus",
            "merchant_key": "musicplus",
            "category": "entertainment",
            "amount_minor": 11900,
            "currency": "INR",
            "billing_interval": "monthly",
            "interval_days": 30,
            "next_renewal_at": "2026-11-08T00:00:00Z",
            "status": "active",
            "source": "demo",
            "paypal_subscription_id": None,
            "notes": "Individual student plan",
            "last_amount_minor": 11900,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        },
        {
            "id": "11111111-0000-0000-0000-000000000003",
            "user_id": DEMO_USER_ID,
            "name": "CloudDrive",
            "merchant_key": "clouddrive",
            "category": "productivity",
            "amount_minor": 19900,
            "currency": "INR",
            "billing_interval": "monthly",
            "interval_days": 30,
            "next_renewal_at": "2026-11-12T00:00:00Z",
            "status": "active",
            "source": "demo",
            "paypal_subscription_id": None,
            "notes": "200GB Cloud Storage",
            "last_amount_minor": 19900,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        },
        {
            "id": "11111111-0000-0000-0000-000000000004",
            "user_id": DEMO_USER_ID,
            "name": "DesignSuite",
            "merchant_key": "designsuite",
            "category": "productivity",
            "amount_minor": 79900,
            "currency": "INR",
            "billing_interval": "monthly",
            "interval_days": 30,
            "next_renewal_at": "2026-11-15T00:00:00Z",
            "status": "active",
            "source": "demo",
            "paypal_subscription_id": None,
            "notes": "Pro creator design bundle",
            "last_amount_minor": 79900,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        },
        {
            "id": "11111111-0000-0000-0000-000000000005",
            "user_id": DEMO_USER_ID,
            "name": "AIWriter",
            "merchant_key": "aiwriter",
            "category": "ai_tools",
            "amount_minor": 49900,
            "currency": "INR",
            "billing_interval": "monthly",
            "interval_days": 30,
            "next_renewal_at": "2026-11-18T00:00:00Z",
            "status": "active",
            "source": "demo",
            "paypal_subscription_id": None,
            "notes": "AI writing assistant standard tier",
            "last_amount_minor": 49900,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        },
        {
            "id": "11111111-0000-0000-0000-000000000006",
            "user_id": DEMO_USER_ID,
            "name": "AIWriter Pro",
            "merchant_key": "aiwriter",
            "category": "ai_tools",
            "amount_minor": 99900,
            "currency": "INR",
            "billing_interval": "monthly",
            "interval_days": 30,
            "next_renewal_at": "2026-11-20T00:00:00Z",
            "status": "active",
            "source": "demo",
            "paypal_subscription_id": None,
            "notes": "Possible duplicate service for AIWriter",
            "last_amount_minor": 99900,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        },
    ]


class InMemorySubscriptionStore:
    """
    In-memory isolated storage for demo mode and offline testing.
    Keyed by user_id -> subscription_id -> subscription dict.
    """
    def __init__(self):
        self._store: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self.reset()

    def reset(self):
        self._store.clear()
        demo_subs = get_default_demo_subscriptions()
        self._store[DEMO_USER_ID] = {sub["id"]: copy.deepcopy(sub) for sub in demo_subs}

    def list_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        user_subs = self._store.get(user_id, {})
        return list(user_subs.values())

    def get_by_id(self, subscription_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        user_subs = self._store.get(user_id, {})
        return copy.deepcopy(user_subs.get(subscription_id))

    def create(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        if user_id not in self._store:
            self._store[user_id] = {}
        sub_id = data["id"]
        stored_item = copy.deepcopy(data)
        self._store[user_id][sub_id] = stored_item
        return copy.deepcopy(stored_item)

    def update(self, subscription_id: str, user_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        user_subs = self._store.get(user_id, {})
        if subscription_id not in user_subs:
            return None
        item = user_subs[subscription_id]
        item.update(data)
        return copy.deepcopy(item)

    def delete(self, subscription_id: str, user_id: str) -> bool:
        user_subs = self._store.get(user_id, {})
        if subscription_id in user_subs:
            del user_subs[subscription_id]
            return True
        return False


memory_store = InMemorySubscriptionStore()

