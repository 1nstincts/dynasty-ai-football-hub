# Complete Fix for Team Rosters Table Policies

This document provides a comprehensive solution for fixing the duplicate permissive policy issues in the `team_rosters` table. 

## Issue Description

The Supabase warning indicates:

> **Multiple Permissive Policies**  
> Table `public.team_rosters` has multiple permissive policies for role `anon` for action `SELECT`.  
> Policies include {"Allow all to manage team rosters", "Allow all to read team rosters"}

This causes performance issues because Supabase must execute both policies for every query to the table.

## Root Cause Analysis

The issue appears to be that there are multiple overlapping policies that have redundant access patterns:

1. `"Allow all to manage team rosters"` - A general policy that likely allows all operations
2. `"Allow all to read team rosters"` - A specific read-only policy

When both exist for the same role (anon) and the same action (SELECT), this creates duplicative policy execution.

## Complete Solution

Our complete solution takes a more thorough approach:

1. Identify all existing policies on the table
2. Drop ALL existing policies to start with a clean slate
3. Create properly separated policies with clear responsibility boundaries:
   - A read-only policy for anonymous users
   - A management policy for authenticated users

This approach ensures:
- No overlapping policies
- Clear separation of responsibilities
- Proper access control based on user role

## Implementing the Fix

### Option 1: Using the Supabase Dashboard

1. Log in to the Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `fix_team_rosters_policy_complete.sql`
4. Execute the script
5. Verify that no duplicate policies exist

### Option 2: Using the Supabase CLI

```bash
supabase sql -f supabase/fix_team_rosters_policy_complete.sql
```

## Verification

After applying the fix, run this SQL to verify there are no duplicate policies:

```sql
WITH role_action_counts AS (
  SELECT 
    roles::text,
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

This query should return no rows, confirming there are no duplicate policies.

## Expected Result

After applying this fix:

1. Anonymous users will have read-only access via a single policy
2. Authenticated users will have full access via a separate policy
3. There will be no duplicate policies for any role/action combination
4. The Supabase warning should disappear

## What If the Warning Persists?

If the warning persists after applying this fix:

1. Verify that the script executed successfully without errors
2. Check if any automated processes might be recreating the policies
3. Ensure there are no triggers or other mechanisms recreating policies
4. Try restarting the Supabase instance to refresh the policy cache
5. Contact Supabase support if the issue cannot be resolved