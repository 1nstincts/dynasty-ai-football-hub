-- Add ADP and status columns to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS adp DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dynasty_adp DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create draft_picks table to track all draft selections
CREATE TABLE IF NOT EXISTS public.draft_picks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    draft_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    player_id TEXT NOT NULL REFERENCES public.players(player_id),
    round INTEGER NOT NULL,
    pick INTEGER NOT NULL,
    overall_pick INTEGER NOT NULL,
    pick_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_rosters table to track player ownership
CREATE TABLE IF NOT EXISTS public.team_rosters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    player_id TEXT NOT NULL REFERENCES public.players(player_id),
    position_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, team_id, player_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_draft_picks_draft_id ON public.draft_picks(draft_id);
CREATE INDEX IF NOT EXISTS idx_draft_picks_overall_pick ON public.draft_picks(overall_pick);
CREATE INDEX IF NOT EXISTS idx_team_rosters_league_team ON public.team_rosters(league_id, team_id);
CREATE INDEX IF NOT EXISTS idx_players_adp ON public.players(dynasty_adp) WHERE dynasty_adp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_active ON public.players(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_rosters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all to read draft picks" ON public.draft_picks FOR SELECT USING (true);
CREATE POLICY "Allow all to insert draft picks" ON public.draft_picks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to read team rosters" ON public.team_rosters FOR SELECT USING (true);
CREATE POLICY "Allow all to manage team rosters" ON public.team_rosters FOR ALL WITH CHECK (true);

-- Insert some sample NFL players with realistic ADP values if table is empty
INSERT INTO public.players (player_id, full_name, position, team, dynasty_adp, is_active) VALUES
('mahomes_pat', 'Patrick Mahomes', 'QB', 'KC', 15.5, true),
('allen_jos', 'Josh Allen', 'QB', 'BUF', 18.2, true),
('burrow_joe', 'Joe Burrow', 'QB', 'CIN', 22.1, true),
('jackson_lam', 'Lamar Jackson', 'QB', 'BAL', 25.8, true),
('mccaffrey_chr', 'Christian McCaffrey', 'RB', 'SF', 8.3, true),
('henry_der', 'Derrick Henry', 'RB', 'BAL', 35.2, true),
('taylor_jon', 'Jonathan Taylor', 'RB', 'IND', 28.7, true),
('ekeler_aus', 'Austin Ekeler', 'RB', 'WSH', 42.1, true),
('jefferson_jus', 'Justin Jefferson', 'WR', 'MIN', 12.4, true),
('chase_jama', 'Ja\'Marr Chase', 'WR', 'CIN', 16.9, true),
('kupp_coo', 'Cooper Kupp', 'WR', 'LAR', 28.3, true),
('adams_dav', 'Davante Adams', 'WR', 'LV', 32.1, true),
('hill_tyr', 'Tyreek Hill', 'WR', 'MIA', 19.7, true),
('diggs_ste', 'Stefon Diggs', 'WR', 'HOU', 38.5, true),
('kelce_tra', 'Travis Kelce', 'TE', 'KC', 45.2, true),
('andrews_mar', 'Mark Andrews', 'TE', 'BAL', 55.8, true),
('kittle_geo', 'George Kittle', 'TE', 'SF', 58.3, true),
('waller_dar', 'Darren Waller', 'TE', 'NYG', 75.6, true),
('tucker_jus', 'Justin Tucker', 'K', 'BAL', 180.5, true),
('mcpherson_eva', 'Evan McPherson', 'K', 'CIN', 185.2, true),
('49ers_def', 'San Francisco 49ers', 'DEF', 'SF', 175.8, true),
('cowboys_def', 'Dallas Cowboys', 'DEF', 'DAL', 178.3, true)
ON CONFLICT (player_id) DO UPDATE SET
    dynasty_adp = EXCLUDED.dynasty_adp,
    is_active = EXCLUDED.is_active;