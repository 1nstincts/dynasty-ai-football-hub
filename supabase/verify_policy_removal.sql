-- SQL script to verify policy removal
-- Run this after applying the fix to confirm the duplicate policies have been removed

-- PLAYERS TABLE VERIFICATION
-- -------------------------

-- Step 1: Check all RLS policies on the players table
SELECT 
  pol.tablename, 
  pol.policyname,
  pol.permissive,
  pol.roles,
  pol.cmd,
  pol.qual,
  pol.with_check
FROM pg_policies pol
WHERE pol.tablename = 'players'
ORDER BY pol.policyname;

-- Step 2: Verify there are no duplicate policy names for players
WITH policy_counts AS (
  SELECT 
    policyname, 
    COUNT(*) as count
  FROM pg_policies 
  WHERE tablename = 'players'
  GROUP BY policyname
)
SELECT policyname, count 
FROM policy_counts 
WHERE count > 1;

-- Step 3: Confirm specific problematic policy is gone for players
-- If the fix was for a specific policy with a known name, check if it exists
SELECT COUNT(*) as players_policy_count
FROM pg_policies 
WHERE tablename = 'players' AND policyname = 'Enable read access for all users';

-- TEAM_ROSTERS TABLE VERIFICATION
-- ------------------------------

-- Step 4: Check all RLS policies on the team_rosters table
SELECT 
  pol.tablename, 
  pol.policyname,
  pol.permissive,
  pol.roles,
  pol.cmd,
  pol.qual,
  pol.with_check
FROM pg_policies pol
WHERE pol.tablename = 'team_rosters'
ORDER BY pol.policyname;

-- Step 5: Check for duplicate policies for team_rosters by role and action
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

-- Step 6: Confirm specific problematic policy is gone for team_rosters
SELECT COUNT(*) as team_rosters_policy_count
FROM pg_policies 
WHERE tablename = 'team_rosters' AND policyname = 'Allow all to manage team rosters';

-- If the count returns 1, the policy still exists (but that's normal if it's the correct one)
-- If the count returns 0, the policy doesn't exist at all (which is what we want after the fix)
-- If the count returns > 1, there's still a duplicate policy problem