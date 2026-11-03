from typing import Optional, List, Dict, Any
from app.integrations.supabase.client import get_supabase_client, is_supabase_configured
from app.models.subscription import memory_store
from app.core.security import DEMO_USER_ID
from app.core.logging import logger


class SubscriptionRepository:
    """
    Unified repository for subscriptions.
    Routes to live Supabase Postgres when configured (for authenticated users),
    or to the isolated in-memory store for demo user / offline mode.
    """

    def __init__(self):
        pass

    def _should_use_live_db(self, user_id: str) -> bool:
        return is_supabase_configured() and user_id != DEMO_USER_ID

    async def list_subscriptions(
        self,
        user_id: str,
        status: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        if self._should_use_live_db(user_id):
            client = get_supabase_client()
            if client:
                query = client.table("subscriptions").select("*").eq("user_id", user_id)
                if status:
                    query = query.eq("status", status)
                if category:
                    query = query.eq("category", category)
                if search:
                    query = query.ilike("name", f"%{search}%")
                query = query.order("next_renewal_at", desc=False)
                response = query.execute()
                return response.data or []

        # Fallback to in-memory store (Demo or offline mode)
        items = memory_store.list_by_user(user_id)
        if status:
            items = [item for item in items if item.get("status") == status]
        if category:
            items = [item for item in items if item.get("category") == category]
        if search:
            search_lower = search.lower()
            items = [
                item
                for item in items
                if search_lower in item.get("name", "").lower()
                or search_lower in item.get("merchant_key", "").lower()
            ]

        # Sort by next_renewal_at ascending
        def sort_key(item):
            renewal = item.get("next_renewal_at")
            return renewal or "9999-12-31T23:59:59Z"

        return sorted(items, key=sort_key)

    async def get_by_id(self, subscription_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        if self._should_use_live_db(user_id):
            client = get_supabase_client()
            if client:
                response = (
                    client.table("subscriptions")
                    .select("*")
                    .eq("id", subscription_id)
                    .eq("user_id", user_id)
                    .execute()
                )
                if response.data and len(response.data) > 0:
                    return response.data[0]
                return None

        return memory_store.get_by_id(subscription_id, user_id)

    async def create(self, user_id: str, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        if self._should_use_live_db(user_id):
            client = get_supabase_client()
            if client:
                data = {**subscription_data, "user_id": user_id}
                response = client.table("subscriptions").insert(data).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]
                raise RuntimeError("Failed to insert subscription into Supabase")

        return memory_store.create(user_id, subscription_data)

    async def update(
        self,
        subscription_id: str,
        user_id: str,
        update_data: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        if self._should_use_live_db(user_id):
            client = get_supabase_client()
            if client:
                response = (
                    client.table("subscriptions")
                    .update(update_data)
                    .eq("id", subscription_id)
                    .eq("user_id", user_id)
                    .execute()
                )
                if response.data and len(response.data) > 0:
                    return response.data[0]
                return None

        return memory_store.update(subscription_id, user_id, update_data)

    async def delete(self, subscription_id: str, user_id: str) -> bool:
        if self._should_use_live_db(user_id):
            client = get_supabase_client()
            if client:
                # Check first that the subscription exists and belongs to the user
                existing = await self.get_by_id(subscription_id, user_id)
                if not existing:
                    return False
                client.table("subscriptions").delete().eq("id", subscription_id).eq("user_id", user_id).execute()
                return True

        return memory_store.delete(subscription_id, user_id)


subscription_repository = SubscriptionRepository()

