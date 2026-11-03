-- SubGuard Migration 0002: Indexes
-- Optimized for dashboard queries, renewal scanning, and idempotent webhook lookup

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant_key ON public.subscriptions(merchant_key);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_renewal_at ON public.subscriptions(next_renewal_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON public.transactions(occurred_at DESC);

-- PayPal Webhook Events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_paypal_event_id ON public.paypal_webhook_events(paypal_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON public.paypal_webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON public.paypal_webhook_events(received_at DESC);

-- Insights indexes
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_status ON public.insights(user_id, status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);

-- Agent runs indexes
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON public.agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON public.agent_runs(created_at DESC);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
