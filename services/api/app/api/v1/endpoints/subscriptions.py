from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.deps import get_current_user_id
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    SubscriptionListResponse,
)
from app.services.subscription_service import subscription_service

router = APIRouter()


@router.get("", response_model=SubscriptionListResponse)
async def list_subscriptions(
    status: Optional[str] = Query(None, description="Filter by status (active, paused, cancelled, trial)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or merchant"),
    user_id: str = Depends(get_current_user_id),
) -> SubscriptionListResponse:
    """
    Retrieve all subscriptions for the authenticated user with optional filtering.
    """
    items = await subscription_service.list_user_subscriptions(
        user_id=user_id,
        status=status,
        category=category,
        search=search,
    )
    return SubscriptionListResponse(
        items=[SubscriptionResponse(**item) for item in items],
        total=len(items),
    )


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    payload: SubscriptionCreate,
    user_id: str = Depends(get_current_user_id),
) -> SubscriptionResponse:
    """
    Create a new subscription record scoped to the authenticated user.
    """
    created = await subscription_service.create_subscription(
        user_id=user_id,
        data=payload,
    )
    return SubscriptionResponse(**created)


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: str,
    user_id: str = Depends(get_current_user_id),
) -> SubscriptionResponse:
    """
    Retrieve details for a single subscription owned by the authenticated user.
    """
    subscription = await subscription_service.get_subscription(
        subscription_id=subscription_id,
        user_id=user_id,
    )
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID '{subscription_id}' not found.",
        )
    return SubscriptionResponse(**subscription)


@router.patch("/{subscription_id}", response_model=SubscriptionResponse)
@router.put("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: str,
    payload: SubscriptionUpdate,
    user_id: str = Depends(get_current_user_id),
) -> SubscriptionResponse:
    """
    Update a subscription. Tracks historical price changes when amount_minor is updated.
    """
    updated = await subscription_service.update_subscription(
        subscription_id=subscription_id,
        user_id=user_id,
        update_data=payload,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID '{subscription_id}' not found.",
        )
    return SubscriptionResponse(**updated)


@router.delete("/{subscription_id}", status_code=status.HTTP_200_OK)
async def delete_subscription(
    subscription_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Delete or archive local tracking of a subscription.
    """
    deleted = await subscription_service.delete_subscription(
        subscription_id=subscription_id,
        user_id=user_id,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID '{subscription_id}' not found.",
        )
    return {
        "status": "deleted",
        "id": subscription_id,
        "message": "Subscription tracking successfully removed.",
    }

