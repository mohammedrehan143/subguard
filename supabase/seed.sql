-- SubGuard Demo Seed Data
-- Aligned with README.md Section 13

-- Note: In a live Supabase environment, create an auth user first or use the demo UUID.
-- Demo user UUID: 00000000-0000-0000-0000-000000000001
DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Ensure profile exists
    INSERT INTO public.profiles (id, display_name, preferred_currency, timezone)
    VALUES (demo_user_id, 'Demo User', 'INR', 'Asia/Kolkata')
    ON CONFLICT (id) DO NOTHING;

    -- Subscriptions
    INSERT INTO public.subscriptions (
        id, user_id, name, merchant_key, category, amount_minor, currency,
        billing_interval, interval_days, next_renewal_at, status, source, notes, last_amount_minor
    ) VALUES
    (
        '11111111-0000-0000-0000-000000000001',
        demo_user_id,
        'StreamBox',
        'streambox',
        'entertainment',
        64900,
        'INR',
        'monthly',
        30,
        '2026-11-05T00:00:00Z',
        'active',
        'demo',
        'Premium 4K plan. Price increased from 49900 last month.',
        49900
    ),
    (
        '11111111-0000-0000-0000-000000000002',
        demo_user_id,
        'MusicPlus',
        'musicplus',
        'entertainment',
        11900,
        'INR',
        'monthly',
        30,
        '2026-11-08T00:00:00Z',
        'active',
        'demo',
        'Individual student plan',
        11900
    ),
    (
        '11111111-0000-0000-0000-000000000003',
        demo_user_id,
        'CloudDrive',
        'clouddrive',
        'productivity',
        19900,
        'INR',
        'monthly',
        30,
        '2026-11-12T00:00:00Z',
        'active',
        'demo',
        '200GB Cloud Storage',
        19900
    ),
    (
        '11111111-0000-0000-0000-000000000004',
        demo_user_id,
        'DesignSuite',
        'designsuite',
        'productivity',
        79900,
        'INR',
        'monthly',
        30,
        '2026-11-15T00:00:00Z',
        'active',
        'demo',
        'Pro creator design bundle',
        79900
    ),
    (
        '11111111-0000-0000-0000-000000000005',
        demo_user_id,
        'AIWriter',
        'aiwriter',
        'ai_tools',
        49900,
        'INR',
        'monthly',
        30,
        '2026-11-18T00:00:00Z',
        'active',
        'demo',
        'AI writing assistant standard tier',
        49900
    ),
    (
        '11111111-0000-0000-0000-000000000006',
        demo_user_id,
        'AIWriter Pro',
        'aiwriter',
        'ai_tools',
        99900,
        'INR',
        'monthly',
        30,
        '2026-11-20T00:00:00Z',
        'active',
        'demo',
        'Possible duplicate service for AIWriter',
        99900
    )
    ON CONFLICT (id) DO NOTHING;

    -- Historical Transactions
    INSERT INTO public.transactions (
        user_id, subscription_id, merchant_name, amount_minor, currency, occurred_at, source
    ) VALUES
    (demo_user_id, '11111111-0000-0000-0000-000000000001', 'StreamBox', 49900, 'INR', '2026-10-05T10:00:00Z', 'demo'),
    (demo_user_id, '11111111-0000-0000-0000-000000000001', 'StreamBox', 64900, 'INR', '2026-10-05T10:00:00Z', 'demo'),
    (demo_user_id, '11111111-0000-0000-0000-000000000002', 'MusicPlus', 11900, 'INR', '2026-10-08T11:00:00Z', 'demo'),
    (demo_user_id, '11111111-0000-0000-0000-000000000003', 'CloudDrive', 19900, 'INR', '2026-10-12T09:00:00Z', 'demo')
    ON CONFLICT DO NOTHING;

    -- Sample Initial Insights
    INSERT INTO public.insights (
        user_id, type, title, description, severity, evidence, status
    ) VALUES
    (
        demo_user_id,
        'price_increase',
        'StreamBox price increased by 30%',
        'StreamBox monthly renewal increased from ₹499 to ₹649.',
        'warning',
        '{"previous_amount_minor": 49900, "current_amount_minor": 64900, "difference_percent": 30.06}'::jsonb,
        'new'
    ),
    (
        demo_user_id,
        'possible_duplicate',
        'Potential duplicate AI subscription detected',
        'You have active subscriptions for both AIWriter and AIWriter Pro.',
        'warning',
        '{"merchant_key": "aiwriter", "subscriptions": ["StreamBox", "AIWriter Pro"]}'::jsonb,
        'new'
    )
    ON CONFLICT DO NOTHING;
END $$;
