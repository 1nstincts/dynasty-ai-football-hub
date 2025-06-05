# Fix for Multiple Permissive Policies

## Issue
Table `public.players` has multiple permissive policies for role `anon` for action `SELECT`. Policies include:
- "Allow all to read players"
- "Allow public read access to players"

This causes performance issues because Supabase must execute both policies for every query.

## Fix Instructions

### Option 1: Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Paste and execute the following SQL:

```sql
-- List all policies for the players table
SELECT * FROM pg_policies WHERE tablename = 'players';

-- Drop the duplicate policy
DROP POLICY IF EXISTS "Allow public read access to players" ON public.players;

-- Verify the fix - should only show one policy for SELECT
SELECT * FROM pg_policies WHERE tablename = 'players' AND cmd = 'SELECT';
```

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase sql -f supabase/fix_duplicate_policy.sql
```

### Option 3: Add to Migration

Add the following to your next migration script:

```sql
-- Fix duplicate policies
DROP POLICY IF EXISTS "Allow public read access to players" ON public.players;
```

## Verification

After applying the fix, verify that only one policy exists for SELECT operations on the players table:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'players' 
AND cmd = 'SELECT';
```

You should see only one policy: "Allow all to read players"