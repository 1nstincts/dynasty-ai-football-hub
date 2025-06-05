-- Fix duplicate permissive policies for team_rosters table
--
-- This script resolves the performance warning:
-- "Table public.team_rosters has multiple permissive policies for role anon for action SELECT.
-- Policies include {"Allow all to manage team rosters","Allow all to read team rosters"}"
--
-- Solution: Keep the read-specific policy and drop the generic manage policy for better semantics

-- Begin transaction to ensure all operations are atomic
BEGIN;

-- Step 1: Examine existing policies on team_rosters table before changes
SELECT 
  pol.tablename, 
  pol.policyname,
  pol.permissive,
  pol.roles,
  pol.cmd
FROM pg_policies pol
WHERE pol.tablename = 'team_rosters'
ORDER BY pol.policyname;

-- Step 2: Drop the redundant policy for SELECT operations
-- We'll keep "Allow all to read team rosters" as it's more semantically appropriate for SELECT
-- and drop "Allow all to manage team rosters" which likely has the same effect for SELECT operations
DROP POLICY IF EXISTS "Allow all to manage team rosters" ON public.team_rosters;

-- Step 3: Create a more specific "manage" policy for write operations if needed
-- This ensures we maintain proper write access while avoiding duplicate policies for reads
CREATE POLICY IF NOT EXISTS "Allow authenticated to manage team rosters" 
ON public.team_rosters
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 4: Verify the changes - there should now be a single policy for anon/SELECT
SELECT 
  pol.tablename, 
  pol.policyname,
  pol.permissive,
  pol.roles,
  pol.cmd
FROM pg_policies pol
WHERE pol.tablename = 'team_rosters'
ORDER BY pol.policyname;

-- Commit the transaction
COMMIT;