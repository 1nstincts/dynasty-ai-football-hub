-- Add RLS policies for players table to allow public access
CREATE POLICY "Allow all to read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow all to insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update players" ON public.players FOR UPDATE USING (true);

-- Insert comprehensive list of NFL players with realistic dynasty ADP
INSERT INTO public.players (player_id, full_name, position, team, dynasty_adp, is_active) VALUES
-- More QBs
('herbert_jus', 'Justin Herbert', 'QB', 'LAC', 28.3, true),
('lawrence_tre', 'Trevor Lawrence', 'QB', 'JAX', 32.7, true),
('murray_kyl', 'Kyler Murray', 'QB', 'ARI', 38.4, true),
('watson_des', 'Deshaun Watson', 'QB', 'CLE', 45.2, true),
('prescott_dak', 'Dak Prescott', 'QB', 'DAL', 52.1, true),
('tua_tago', 'Tua Tagovailoa', 'QB', 'MIA', 58.9, true),
('hurts_jal', 'Jalen Hurts', 'QB', 'PHI', 24.6, true),
('rodgers_aar', 'Aaron Rodgers', 'QB', 'NYJ', 85.4, true),

-- More RBs
('cook_dal', 'Dalvin Cook', 'RB', 'FA', 65.2, true),
('chubb_nic', 'Nick Chubb', 'RB', 'CLE', 28.9, true),
('mixon_joe', 'Joe Mixon', 'RB', 'HOU', 45.7, true),
('jacobs_jos', 'Josh Jacobs', 'RB', 'GB', 52.3, true),
('saquon_bar', 'Saquon Barkley', 'RB', 'PHI', 34.6, true),
('elliott_eze', 'Ezekiel Elliott', 'RB', 'DAL', 95.2, true),
('swift_dand', 'D''Andre Swift', 'RB', 'CHI', 48.1, true),
('najee_har', 'Najee Harris', 'RB', 'PIT', 55.7, true),
('breece_hal', 'Breece Hall', 'RB', 'NYJ', 18.9, true),
('walker_ken', 'Kenneth Walker III', 'RB', 'SEA', 38.2, true),

-- More WRs
('lamb_cee', 'CeeDee Lamb', 'WR', 'DAL', 11.2, true),
('brown_aj', 'A.J. Brown', 'WR', 'PHI', 21.3, true),
('waddle_jay', 'Jaylen Waddle', 'WR', 'MIA', 42.7, true),
('smith_dev', 'DeVonta Smith', 'WR', 'PHI', 38.9, true),
('higgins_tee', 'Tee Higgins', 'WR', 'CIN', 33.4, true),
('metcalf_dk', 'DK Metcalf', 'WR', 'SEA', 48.6, true),
('mclaurin_ter', 'Terry McLaurin', 'WR', 'WSH', 55.2, true),
('godwin_chr', 'Chris Godwin', 'WR', 'TB', 52.8, true),
('pittman_mic', 'Michael Pittman Jr.', 'WR', 'IND', 58.1, true),
('williams_gar', 'Garrett Wilson', 'WR', 'NYJ', 29.3, true),
('olave_chr', 'Chris Olave', 'WR', 'NO', 35.7, true),
('london_dra', 'Drake London', 'WR', 'ATL', 41.2, true),
('hopkins_dea', 'DeAndre Hopkins', 'WR', 'TEN', 65.8, true),
('evans_mik', 'Mike Evans', 'WR', 'TB', 45.9, true),
('allen_kee', 'Keenan Allen', 'WR', 'CHI', 58.3, true),
('brown_hol', 'Hollywood Brown', 'WR', 'ARI', 68.7, true),
('moore_dj', 'DJ Moore', 'WR', 'CHI', 51.4, true),
('thomas_mic', 'Michael Thomas', 'WR', 'NO', 85.1, true),

-- More TEs
('pitts_kyl', 'Kyle Pitts', 'TE', 'ATL', 38.7, true),
('goedert_dal', 'Dallas Goedert', 'TE', 'PHI', 85.3, true),
('hockenson_tj', 'T.J. Hockenson', 'TE', 'MIN', 78.9, true),
('ertz_zac', 'Zach Ertz', 'TE', 'ARI', 95.2, true),
('schultz_dal', 'Dalton Schultz', 'TE', 'HOU', 112.5, true),
('freiermuth_pat', 'Pat Freiermuth', 'TE', 'PIT', 125.8, true),

-- More Kickers
('bass_tyl', 'Tyler Bass', 'K', 'BUF', 192.1, true),
('butker_har', 'Harrison Butker', 'K', 'KC', 188.7, true),
('carlson_dan', 'Daniel Carlson', 'K', 'LV', 195.4, true),
('folk_nic', 'Nick Folk', 'K', 'TEN', 201.2, true),

-- More Defense/Special Teams
('def_buf', 'Buffalo Bills', 'DEF', 'BUF', 182.6, true),
('def_phi', 'Philadelphia Eagles', 'DEF', 'PHI', 185.9, true),
('def_ne', 'New England Patriots', 'DEF', 'NE', 195.3, true),
('def_pit', 'Pittsburgh Steelers', 'DEF', 'PIT', 188.7, true),
('def_mia', 'Miami Dolphins', 'DEF', 'MIA', 198.2, true)

ON CONFLICT (player_id) DO UPDATE SET
    dynasty_adp = EXCLUDED.dynasty_adp,
    is_active = EXCLUDED.is_active;