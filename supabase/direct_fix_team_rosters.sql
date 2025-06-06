-- Direct fix for team_rosters table policies
-- This script fixes the duplicate policies warning in a simple, direct way

-- First, check which policies exist
SELECT * FROM pg_policies WHERE tablename = 'team_rosters';

-- Drop both policies that are causing conflicts
DROP POLICY IF EXISTS "Allow all to manage team rosters" ON public.team_rosters;
DROP POLICY IF EXISTS "Allow all to read team rosters" ON public.team_rosters;

-- Create proper policies with clear role separation
-- Policy for anonymous users to read only
CREATE POLICY "Allow all to read team_rosters" 
ON public.team_rosters
FOR SELECT
TO anon
USING (true);

-- Policy for authenticated users to have full access
CREATE POLICY "Allow authenticated to manage team rosters" 
ON public.team_rosters
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the fixed policies
SELECT * FROM pg_policies WHERE tablename = 'team_rosters';