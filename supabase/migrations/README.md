# Supabase Migrations

## How to apply (no CLI)

1. Open Supabase Dashboard → SQL Editor:
   `https://supabase.com/dashboard/project/ghxewawhfshktfuxzfsj/sql`

2. Paste contents of `001_v1_schema.sql`

3. Click **Run**

4. Verify in Table Editor — 5 tables should appear:
   - `listings`
   - `pipeline`
   - `applications`
   - `profiles`
   - `usage_counters`

## Tables

| Table | Purpose | PK |
|-------|---------|-----|
| `listings` | Raw job postings fetched from ATS | UUID |
| `pipeline` | Evaluated listings with scores | UUID |
| `applications` | Submitted job applications | UUID |
| `profiles` | User CV + preferences | user_id (1:1) |
| `usage_counters` | Free tier eval count | user_id (1:1) |

## RLS

All tables have Row Level Security enabled. Users can only access their own rows (`user_id = auth.uid()`).

## Auto-provisioning

On user signup, `handle_new_user()` trigger auto-creates a `profiles` and `usage_counters` row.
