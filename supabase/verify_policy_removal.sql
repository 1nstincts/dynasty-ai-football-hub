-- SQL script to verify policy removal
-- Run this after applying the fix to confirm the duplicate policy has been removed

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

-- Step 2: Verify there are no duplicate policy names
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

-- Step 3: Confirm specific problematic policy is gone
-- If the fix was for a specific policy with a known name, check if it exists
-- Replace 'problematic_policy_name' with the actual name of the policy that was dropped
SELECT COUNT(*) 
FROM pg_policies 
WHERE tablename = 'players' AND policyname = 'Enable read access for all users';

-- If the count returns 1, the policy still exists (but that's normal if it's the correct one)
-- If the count returns 0, the policy doesn't exist at all (which might be correct if it was fully removed)
-- If the count returns > 1, there's still a duplicate policy problem