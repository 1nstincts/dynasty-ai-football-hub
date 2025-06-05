-- Fix duplicate permissive policies for players table
-- This script drops the duplicate "Allow public read access to players" policy
-- and keeps only the "Allow all to read players" policy

-- First, list all policies for the players table
SELECT * FROM pg_policies WHERE tablename = 'players';

-- Drop the duplicate policy (choose one to keep based on your preference)
DROP POLICY IF EXISTS "Allow public read access to players" ON public.players;

-- Verify policies after fix
SELECT * FROM pg_policies WHERE tablename = 'players';