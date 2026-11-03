from pathlib import Path

def test_migration_files_exist():
    # Resolve supabase migrations directory from repo root
    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    migrations_dir = repo_root / "supabase" / "migrations"
    seed_file = repo_root / "supabase" / "seed.sql"

    assert migrations_dir.exists(), f"Migrations dir not found at {migrations_dir}"
    assert (migrations_dir / "0001_initial_schema.sql").exists()
    assert (migrations_dir / "0002_indexes.sql").exists()
    assert (migrations_dir / "0003_rls_policies.sql").exists()
    assert seed_file.exists()

def test_schema_contains_required_tables():
    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    schema_sql = (repo_root / "supabase" / "migrations" / "0001_initial_schema.sql").read_text(encoding="utf-8").lower()

    required_tables = [
        "profiles",
        "subscriptions",
        "transactions",
        "paypal_webhook_events",
        "insights",
        "notifications",
        "agent_runs",
        "audit_logs",
    ]

    for table in required_tables:
        assert f"create table if not exists public.{table}" in schema_sql, f"Missing table {table}"

def test_rls_policies_defined_for_all_user_tables():
    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    rls_sql = (repo_root / "supabase" / "migrations" / "0003_rls_policies.sql").read_text(encoding="utf-8").lower()

    tables_with_rls = [
        "profiles",
        "subscriptions",
        "transactions",
        "paypal_webhook_events",
        "insights",
        "notifications",
        "agent_runs",
        "audit_logs",
    ]

    for table in tables_with_rls:
        assert f"alter table public.{table} enable row level security" in rls_sql, f"Missing RLS for {table}"
