import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from app.repositories.subscription_repository import (
    subscription_repository,
    SubscriptionRepository,
)
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
)


def normalize_merchant_key(name: str) -> str:
    """Normalize a display name to a clean alphanumeric merchant key."""
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "", name).lower()
    return cleaned if cleaned else "unknown"


def calculate_default_renewal(interval: str, interval_days: Optional[int] = None) -> datetime:
    """Computes default next renewal datetime based on billing interval."""
    now = datetime.now(timezone.utc)
    if interval == "weekly":
        return now + timedelta(days=7)
    elif interval == "monthly":
        return now + timedelta(days=30)
    elif interval == "quarterly":
        return now + timedelta(days=90)
    elif interval == "yearly":
        return now + timedelta(days=365)
    elif interval == "custom" and interval_days:
        return now + timedelta(days=interval_days)
    return now + timedelta(days=30)


class SubscriptionService:
    def __init__(self, repo: SubscriptionRepository = subscription_repository):
        self.repo = repo

    async def list_user_subscriptions(
        self,
        user_id: str,
        status: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        return await self.repo.list_subscriptions(
            user_id=user_id,
            status=status,
            category=category,
            search=search,
        )

    async def get_subscription(
        self,
        subscription_id: str,
        user_id: str,
    ) -> Optional[Dict[str, Any]]:
        return await self.repo.get_by_id(subscription_id, user_id)

    async def create_subscription(
        self,
        user_id: str,
        data: SubscriptionCreate,
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)

        # Merchant key normalization
        merchant_key = data.merchant_key
        if not merchant_key:
            merchant_key = normalize_merchant_key(data.name)

        # Renewal date calculation if not provided
        next_renewal = data.next_renewal_at
        if not next_renewal:
            next_renewal = calculate_default_renewal(data.billing_interval, data.interval_days)

        sub_id = str(uuid.uuid4())
        record: Dict[str, Any] = {
            "id": sub_id,
            "user_id": user_id,
            "name": data.name,
            "merchant_key": merchant_key,
            "category": data.category,
            "amount_minor": data.amount_minor,
            "currency": data.currency,
            "billing_interval": data.billing_interval,
            "interval_days": data.interval_days,
            "next_renewal_at": next_renewal.isoformat() if isinstance(next_renewal, datetime) else next_renewal,
            "status": data.status,
            "source": data.source,
            "paypal_subscription_id": data.paypal_subscription_id,
            "notes": data.notes,
            "last_amount_minor": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        return await self.repo.create(user_id, record)

    async def update_subscription(
        self,
        subscription_id: str,
        user_id: str,
        update_data: SubscriptionUpdate,
    ) -> Optional[Dict[str, Any]]:
        existing = await self.repo.get_by_id(subscription_id, user_id)
        if not existing:
            return None

        now = datetime.now(timezone.utc)
        payload = update_data.model_dump(exclude_unset=True)

        # Track historical amount changes
        if "amount_minor" in payload and payload["amount_minor"] is not None:
            current_amount = existing.get("amount_minor")
            if current_amount is not None and current_amount != payload["amount_minor"]:
                payload["last_amount_minor"] = current_amount

        # Merchant key normalization if name changed but merchant_key wasn't explicitly supplied
        if "name" in payload and "merchant_key" not in payload:
            payload["merchant_key"] = normalize_merchant_key(payload["name"])

        # Serialize datetimes
        if "next_renewal_at" in payload and isinstance(payload["next_renewal_at"], datetime):
            payload["next_renewal_at"] = payload["next_renewal_at"].isoformat()

        payload["updated_at"] = now.isoformat()

        return await self.repo.update(subscription_id, user_id, payload)

    async def delete_subscription(
        self,
        subscription_id: str,
        user_id: str,
    ) -> bool:
        return await self.repo.delete(subscription_id, user_id)


subscription_service = SubscriptionService()

