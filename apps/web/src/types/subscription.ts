export type SubscriptionInterval =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "trial"
  | "unknown";

export type SubscriptionSource = "manual" | "paypal" | "imported" | "demo";

export type SubscriptionCategory =
  | "entertainment"
  | "productivity"
  | "utilities"
  | "ai_tools"
  | "cloud_services"
  | "fitness"
  | "education"
  | "finance"
  | "other";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  merchant_key: string;
  category: SubscriptionCategory | string;
  amount_minor: number;
  currency: string;
  billing_interval: SubscriptionInterval;
  interval_days?: number | null;
  next_renewal_at?: string | null;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  paypal_subscription_id?: string | null;
  notes?: string | null;
  last_amount_minor?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionCreateInput {
  name: string;
  merchant_key?: string;
  category?: string;
  amount_minor: number;
  currency?: string;
  billing_interval?: SubscriptionInterval;
  interval_days?: number;
  next_renewal_at?: string;
  status?: SubscriptionStatus;
  source?: SubscriptionSource;
  notes?: string;
}

export interface SubscriptionUpdateInput {
  name?: string;
  merchant_key?: string;
  category?: string;
  amount_minor?: number;
  currency?: string;
  billing_interval?: SubscriptionInterval;
  interval_days?: number;
  next_renewal_at?: string;
  status?: SubscriptionStatus;
  notes?: string;
}

export interface SubscriptionListResponse {
  items: Subscription[];
  total: number;
}

