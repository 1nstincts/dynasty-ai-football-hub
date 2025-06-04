-- Add metadata columns to the players table

-- First check if the columns already exist to avoid errors
DO $$ 
BEGIN
    -- Height (in inches)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'height') THEN
        ALTER TABLE public.players ADD COLUMN height integer;
    END IF;
    
    -- Weight (in pounds)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'weight') THEN
        ALTER TABLE public.players ADD COLUMN weight integer;
    END IF;
    
    -- Birth date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'birth_date') THEN
        ALTER TABLE public.players ADD COLUMN birth_date date;
    END IF;
    
    -- College
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'college') THEN
        ALTER TABLE public.players ADD COLUMN college text;
    END IF;
    
    -- Jersey number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'jersey_number') THEN
        ALTER TABLE public.players ADD COLUMN jersey_number integer;
    END IF;
    
    -- Years of experience
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'experience') THEN
        ALTER TABLE public.players ADD COLUMN experience integer;
    END IF;
    
    -- Team primary color (hex)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'team_primary_color') THEN
        ALTER TABLE public.players ADD COLUMN team_primary_color text;
    END IF;
    
    -- Team secondary color (hex)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'team_secondary_color') THEN
        ALTER TABLE public.players ADD COLUMN team_secondary_color text;
    END IF;
    
    -- Player image URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'image_url') THEN
        ALTER TABLE public.players ADD COLUMN image_url text;
    END IF;
    
    -- Fantasy position rank (within position)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'fantasy_position_rank') THEN
        ALTER TABLE public.players ADD COLUMN fantasy_position_rank integer;
    END IF;
    
    -- Points from last season
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'last_season_points') THEN
        ALTER TABLE public.players ADD COLUMN last_season_points numeric;
    END IF;
    
    -- Bye week
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'players'
                  AND column_name = 'bye_week') THEN
        ALTER TABLE public.players ADD COLUMN bye_week integer;
    END IF;
    
    -- Update RLS policies for the new columns
    DROP POLICY IF EXISTS "Allow all to read players" ON public.players;
    CREATE POLICY "Allow all to read players" ON public.players FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow all to update players" ON public.players;
    CREATE POLICY "Allow all to update players" ON public.players FOR UPDATE USING (true);
    
END $$;