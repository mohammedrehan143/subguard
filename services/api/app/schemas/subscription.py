from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


VALID_INTERVALS = {"weekly", "monthly", "quarterly", "yearly", "custom"}
VALID_STATUSES = {"active", "paused", "cancelled", "trial", "unknown"}
VALID_SOURCES = {"manual", "paypal", "imported", "demo"}
VALID_CATEGORIES = {
    "entertainment",
    "productivity",
    "utilities",
    "ai_tools",
    "cloud_services",
    "fitness",
    "education",
    "finance",
    "other",
}


class SubscriptionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the subscription service")
    merchant_key: Optional[str] = Field(None, max_length=100, description="Normalized merchant key")
    category: str = Field("other", description="Category of service")
    amount_minor: int = Field(..., ge=0, description="Subscription cost in integer minor units (e.g. 64900 = 649.00)")
    currency: str = Field("INR", min_length=3, max_length=3, description="ISO 4217 3-letter currency code")
    billing_interval: str = Field("monthly", description="Billing interval frequency")
    interval_days: Optional[int] = Field(None, ge=1, le=365, description="Number of days if billing_interval is custom")
    next_renewal_at: Optional[datetime] = Field(None, description="Next expected renewal date in UTC")
    status: str = Field("active", description="Subscription lifecycle status")
    source: str = Field("manual", description="Origin of subscription record")
    paypal_subscription_id: Optional[str] = Field(None, max_length=128, description="PayPal subscription identifier if linked")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes or details")

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper().strip()

    @field_validator("billing_interval")
    @classmethod
    def validate_interval(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in VALID_INTERVALS:
            raise ValueError(f"Invalid billing_interval '{v}'. Must be one of: {', '.join(sorted(VALID_INTERVALS))}")
        return v_clean

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return v_clean

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in VALID_SOURCES:
            raise ValueError(f"Invalid source '{v}'. Must be one of: {', '.join(sorted(VALID_SOURCES))}")
        return v_clean


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    merchant_key: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = None
    amount_minor: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    billing_interval: Optional[str] = None
    interval_days: Optional[int] = Field(None, ge=1, le=365)
    next_renewal_at: Optional[datetime] = None
    status: Optional[str] = None
    source: Optional[str] = None
    paypal_subscription_id: Optional[str] = Field(None, max_length=128)
    notes: Optional[str] = Field(None, max_length=1000)
    last_amount_minor: Optional[int] = Field(None, ge=0)

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        return v.upper().strip() if v else None

    @field_validator("billing_interval")
    @classmethod
    def validate_interval(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        v_clean = v.lower().strip()
        if v_clean not in VALID_INTERVALS:
            raise ValueError(f"Invalid billing_interval '{v}'. Must be one of: {', '.join(sorted(VALID_INTERVALS))}")
        return v_clean

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        v_clean = v.lower().strip()
        if v_clean not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return v_clean


class SubscriptionResponse(SubscriptionBase):
    id: str
    user_id: str
    last_amount_minor: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class SubscriptionListResponse(BaseModel):
    items: List[SubscriptionResponse]
    total: int

