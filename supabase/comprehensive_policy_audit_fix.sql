-- Comprehensive Supabase Policy Audit and Fix
-- This script identifies and resolves duplicate RLS policies across all tables in the database
-- It provides a systematic approach to ensure optimal policy configuration

BEGIN;

-- Step 1: Identify all tables with duplicate policies
-- This query finds tables where multiple permissive policies exist for the same role and command
DROP TABLE IF EXISTS duplicate_policy_report;
CREATE TEMP TABLE duplicate_policy_report AS
WITH role_cmd_counts AS (
  SELECT 
    schemaname,
    tablename,
    roles::text,
    cmd,
    COUNT(*) as policy_count
  FROM pg_policies 
  GROUP BY schemaname, tablename, roles, cmd
  HAVING COUNT(*) > 1
  ORDER BY schemaname, tablename, roles, cmd
)
SELECT * FROM role_cmd_counts;

-- Display tables with duplicate policies
SELECT * FROM duplicate_policy_report;

-- Step 2: Get detailed information about the duplicate policies
DROP TABLE IF EXISTS duplicate_policies_detail;
CREATE TEMP TABLE duplicate_policies_detail AS
SELECT 
  pol.schemaname,
  pol.tablename, 
  pol.policyname,
  pol.permissive,
  pol.roles::text,
  pol.cmd,
  pol.qual,
  pol.with_check
FROM pg_policies pol
JOIN duplicate_policy_report dpr 
  ON pol.tablename = dpr.tablename 
  AND pol.roles::text = dpr.roles 
  AND pol.cmd = dpr.cmd
ORDER BY pol.schemaname, pol.tablename, pol.roles, pol.cmd, pol.policyname;

-- Display the detailed policy information
SELECT * FROM duplicate_policies_detail;

-- Step 3: Generate SQL to fix each table with duplicate policies
-- We'll drop all duplicate policies and recreate a consolidated policy

-- Generate SQL for players table if it has duplicate policies
DO $$
DECLARE
  has_duplicate BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM duplicate_policy_report WHERE tablename = 'players'
  ) INTO has_duplicate;
  
  IF has_duplicate THEN
    RAISE NOTICE 'Fixing duplicate policies for players table';
    
    -- Drop all existing policies on players table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'players'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.players', r.policyname);
    END LOOP;
    
    -- Create consolidated policies
    EXECUTE 'CREATE POLICY "Allow all to read players" ON public.players FOR SELECT TO anon USING (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated to manage players" ON public.players FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Generate SQL for team_rosters table if it has duplicate policies
DO $$
DECLARE
  has_duplicate BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM duplicate_policy_report WHERE tablename = 'team_rosters'
  ) INTO has_duplicate;
  
  IF has_duplicate THEN
    RAISE NOTICE 'Fixing duplicate policies for team_rosters table';
    
    -- Drop all existing policies on team_rosters table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'team_rosters'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_rosters', r.policyname);
    END LOOP;
    
    -- Create consolidated policies
    EXECUTE 'CREATE POLICY "Allow all to read team_rosters" ON public.team_rosters FOR SELECT TO anon USING (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated to manage team_rosters" ON public.team_rosters FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Step 4: Handle any other tables with duplicate policies
-- This section will automatically fix any other tables found with duplicate policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT DISTINCT schemaname, tablename 
    FROM duplicate_policy_report 
    WHERE tablename NOT IN ('players', 'team_rosters')
  LOOP
    RAISE NOTICE 'Auto-fixing duplicate policies for table %.%', r.schemaname, r.tablename;
    
    -- Get the first policy for each role/command combination to preserve
    CREATE TEMP TABLE policies_to_preserve AS
    WITH ranked_policies AS (
      SELECT 
        schemaname,
        tablename,
        policyname,
        roles,
        cmd,
        ROW_NUMBER() OVER(PARTITION BY schemaname, tablename, roles, cmd ORDER BY policyname) as rn
      FROM pg_policies
      WHERE schemaname = r.schemaname AND tablename = r.tablename
    )
    SELECT * FROM ranked_policies WHERE rn = 1;
    
    -- Drop all policies for this table
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = r.schemaname AND tablename = r.tablename
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    -- Recreate the preserved policies
    FOR pol IN 
      SELECT p.*, 
        pg_get_expr(p.qual, p.tableoid) as qual_expr,
        pg_get_expr(p.with_check, p.tableoid) as with_check_expr
      FROM pg_policies p
      JOIN policies_to_preserve ptp 
        ON p.schemaname = ptp.schemaname 
        AND p.tablename = ptp.tablename
        AND p.policyname = ptp.policyname
    LOOP
      -- Construct and execute the CREATE POLICY statement
      EXECUTE format(
        'CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s) WITH CHECK (%s)',
        pol.policyname,
        pol.schemaname,
        pol.tablename,
        pol.cmd,
        array_to_string(pol.roles, ', '),
        pol.qual_expr,
        COALESCE(pol.with_check_expr, 'true')
      );
    END LOOP;
    
    DROP TABLE policies_to_preserve;
  END LOOP;
END $$;

-- Step 5: Verify all duplicate policies have been fixed
WITH role_cmd_counts AS (
  SELECT 
    schemaname,
    tablename,
    roles::text,
    cmd,
    COUNT(*) as policy_count
  FROM pg_policies 
  GROUP BY schemaname, tablename, roles, cmd
  HAVING COUNT(*) > 1
  ORDER BY schemaname, tablename, roles, cmd
)
SELECT * FROM role_cmd_counts;

-- This should return no rows if all duplicate policies have been fixed

COMMIT;