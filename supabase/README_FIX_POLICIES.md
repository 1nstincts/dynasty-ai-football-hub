# Fix for Multiple Permissive Policies

## Issues

### 1. Players Table
Table `public.players` has multiple permissive policies for role `anon` for action `SELECT`. Policies include:
- "Allow all to read players"
- "Allow public read access to players"

### 2. Team Rosters Table
Table `public.team_rosters` has multiple permissive policies for role `anon` for action `SELECT`. Policies include:
- "Allow all to manage team rosters"
- "Allow all to read team rosters"

These duplicate policies cause performance issues because Supabase must execute both policies for every query.

## Fix Instructions

### Option 1: Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Paste and execute the following SQL:

```sql
-- Fix Players Table
-- List all policies for the players table
SELECT * FROM pg_policies WHERE tablename = 'players';

-- Drop the duplicate policy
DROP POLICY IF EXISTS "Allow public read access to players" ON public.players;

-- Verify the fix - should only show one policy for SELECT
SELECT * FROM pg_policies WHERE tablename = 'players' AND cmd = 'SELECT';

-- Fix Team Rosters Table
-- List all policies for the team_rosters table
SELECT * FROM pg_policies WHERE tablename = 'team_rosters';

-- Drop the duplicate policy
DROP POLICY IF EXISTS "Allow all to manage team rosters" ON public.team_rosters;

-- Create a more specific policy for authenticated users if needed
CREATE POLICY IF NOT EXISTS "Allow authenticated to manage team rosters" 
ON public.team_rosters
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the fix
SELECT * FROM pg_policies WHERE tablename = 'team_rosters';
```

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Fix players table
supabase sql -f supabase/fix_duplicate_policy.sql

# Fix team_rosters table
supabase sql -f supabase/fix_team_rosters_policy.sql
```

### Option 3: Add to Migration

Add the following to your next migration script:

```sql
-- Fix duplicate policies for players table
DROP POLICY IF EXISTS "Allow public read access to players" ON public.players;

-- Fix duplicate policies for team_rosters table
DROP POLICY IF EXISTS "Allow all to manage team rosters" ON public.team_rosters;

-- Create a more specific policy for authenticated users
CREATE POLICY IF NOT EXISTS "Allow authenticated to manage team rosters" 
ON public.team_rosters
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);
```

## Verification

### 1. Verify Players Table Fix

After applying the fix, verify that only one policy exists for SELECT operations on the players table:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'players' 
AND cmd = 'SELECT';
```

You should see only one policy: "Allow all to read players"

### 2. Verify Team Rosters Table Fix

Also verify that the team_rosters table has the correct policies:

```sql
-- Check for duplicate policies by role and action
WITH role_action_counts AS (
  SELECT 
    roles,
    cmd,
    COUNT(*) as count
  FROM pg_policies 
  WHERE tablename = 'team_rosters'
  GROUP BY roles, cmd
)
SELECT roles, cmd, count 
FROM role_action_counts 
WHERE count > 1;
```

This query should return no rows, indicating there are no duplicate policies for any role/action combination.

For a complete verification, see the `verify_policy_removal.sql` script in the supabase directory.

## Preventing Future Duplicate Policies

To prevent duplicate policies in the future:

1. Use migration scripts that first check if a policy exists before creating it
2. Always use DROP POLICY IF EXISTS before CREATE POLICY in migration scripts
3. Add comments in your SQL files noting which policies already exist

Example pattern for future migrations:
```sql
-- First remove any existing policy with this name
DROP POLICY IF EXISTS "Policy Name" ON table_name;
-- Then create the policy
CREATE POLICY "Policy Name" ON table_name FOR action USING (condition);
```

Additionally, consider reviewing all RLS policies periodically to ensure no duplicates have been accidentally created.