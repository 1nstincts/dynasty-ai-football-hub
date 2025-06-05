-- Comprehensive fix for duplicate policies in team_rosters table
-- This script takes a more thorough approach to resolving the multiple permissive policies issue

BEGIN;

-- Step 1: First examine all current policies on team_rosters
SELECT 
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'team_rosters'
ORDER BY policyname;

-- Step 2: Drop ALL existing policies on team_rosters to ensure a clean slate
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN SELECT policyname FROM pg_policies WHERE tablename = 'team_rosters'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_rosters', policy_rec.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_rec.policyname;
  END LOOP;
END
$$;

-- Step 3: Create properly separated policies for different roles and operations
-- Policy for anonymous users to read team_rosters
CREATE POLICY "Allow all to read team_rosters" 
ON public.team_rosters
FOR SELECT
TO anon
USING (true);

-- Policy for authenticated users to manage team_rosters
CREATE POLICY "Allow authenticated to manage team_rosters" 
ON public.team_rosters
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 4: Verify the new policies are created correctly
SELECT 
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'team_rosters'
ORDER BY policyname;

-- Step 5: Check for duplicate policies by role and action
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

COMMIT;