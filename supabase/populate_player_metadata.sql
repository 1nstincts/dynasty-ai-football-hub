-- Populate player metadata with realistic values
-- This script uses random data generation and position-specific ranges

-- Team colors for all NFL teams
CREATE TEMP TABLE team_colors AS
SELECT *
FROM (
  VALUES
    ('ARI', '#97233F', '#000000'),
    ('ATL', '#A71930', '#000000'),
    ('BAL', '#241773', '#000000'),
    ('BUF', '#00338D', '#C60C30'),
    ('CAR', '#0085CA', '#101820'),
    ('CHI', '#0B162A', '#C83803'),
    ('CIN', '#FB4F14', '#000000'),
    ('CLE', '#311D00', '#FF3C00'),
    ('DAL', '#003594', '#869397'),
    ('DEN', '#FB4F14', '#002244'),
    ('DET', '#0076B6', '#B0B7BC'),
    ('GB', '#203731', '#FFB612'),
    ('HOU', '#03202F', '#A71930'),
    ('IND', '#002C5F', '#A2AAAD'),
    ('JAX', '#101820', '#D7A22A'),
    ('KC', '#E31837', '#FFB81C'),
    ('LAC', '#0080C6', '#FFC20E'),
    ('LAR', '#003594', '#FFA300'),
    ('LV', '#000000', '#A5ACAF'),
    ('MIA', '#008E97', '#FC4C02'),
    ('MIN', '#4F2683', '#FFC62F'),
    ('NE', '#002244', '#C60C30'),
    ('NO', '#D3BC8D', '#101820'),
    ('NYG', '#0B2265', '#A71930'),
    ('NYJ', '#125740', '#000000'),
    ('PHI', '#004C54', '#A5ACAF'),
    ('PIT', '#FFB612', '#101820'),
    ('SEA', '#002244', '#69BE28'),
    ('SF', '#AA0000', '#B3995D'),
    ('TB', '#D50A0A', '#34302B'),
    ('TEN', '#0C2340', '#4B92DB'),
    ('WSH', '#773141', '#FFB612'),
    ('FA', '#808080', '#404040')
  ) AS t(team_code, primary_color, secondary_color);

-- Common colleges for NFL players
CREATE TEMP TABLE colleges AS
SELECT *
FROM (
  VALUES
    ('Alabama'),
    ('Ohio State'),
    ('Georgia'),
    ('Clemson'),
    ('Oklahoma'),
    ('LSU'),
    ('Michigan'),
    ('Notre Dame'),
    ('Penn State'),
    ('Florida'),
    ('Texas'),
    ('USC'),
    ('Oregon'),
    ('Wisconsin'),
    ('Auburn'),
    ('Texas A&M'),
    ('Iowa'),
    ('Miami'),
    ('Nebraska'),
    ('Florida State'),
    ('Michigan State'),
    ('Stanford'),
    ('UCLA'),
    ('Washington'),
    ('TCU'),
    ('Ole Miss'),
    ('Baylor'),
    ('Mississippi State'),
    ('North Carolina'),
    ('Pittsburgh'),
    ('Tennessee'),
    ('Arkansas'),
    ('South Carolina'),
    ('Virginia Tech'),
    ('West Virginia'),
    ('Oklahoma State'),
    ('Louisville'),
    ('Arizona State'),
    ('California'),
    ('Purdue')
  ) AS t(college_name);

-- Update team colors for all players
UPDATE public.players p
SET 
  team_primary_color = tc.primary_color,
  team_secondary_color = tc.secondary_color
FROM team_colors tc
WHERE p.team = tc.team_code;

-- Update QB metadata with realistic values
UPDATE public.players
SET
  height = floor(random() * (78 - 73 + 1) + 73), -- 6'1" to 6'6"
  weight = floor(random() * (245 - 210 + 1) + 210),
  birth_date = (DATE '1990-01-01' + floor(random() * (365 * 12))::integer),
  college = (SELECT college_name FROM colleges ORDER BY random() LIMIT 1),
  jersey_number = floor(random() * (19 - 1 + 1) + 1),
  experience = floor(random() * 13), -- 0 to 12 years
  fantasy_position_rank = ceil(dynasty_adp / 12),
  last_season_points = round((300 - (dynasty_adp * (0.8 + random() * 0.4)))::numeric, 1),
  bye_week = floor(random() * (14 - 4 + 1) + 4)
WHERE position = 'QB' AND is_active = true;

-- Update RB metadata
UPDATE public.players
SET
  height = floor(random() * (74 - 68 + 1) + 68), -- 5'8" to 6'2"
  weight = floor(random() * (235 - 195 + 1) + 195),
  birth_date = (DATE '1990-01-01' + floor(random() * (365 * 12))::integer),
  college = (SELECT college_name FROM colleges ORDER BY random() LIMIT 1),
  jersey_number = floor(random() * (49 - 20 + 1) + 20),
  experience = floor(random() * 13),
  fantasy_position_rank = ceil(dynasty_adp / 12),
  last_season_points = round((300 - (dynasty_adp * (0.8 + random() * 0.4)))::numeric, 1),
  bye_week = floor(random() * (14 - 4 + 1) + 4)
WHERE position = 'RB' AND is_active = true;

-- Update WR metadata
UPDATE public.players
SET
  height = floor(random() * (77 - 70 + 1) + 70), -- 5'10" to 6'5"
  weight = floor(random() * (225 - 185 + 1) + 185),
  birth_date = (DATE '1990-01-01' + floor(random() * (365 * 12))::integer),
  college = (SELECT college_name FROM colleges ORDER BY random() LIMIT 1),
  jersey_number = CASE 
    WHEN random() > 0.5 THEN floor(random() * (19 - 10 + 1) + 10)
    ELSE floor(random() * (89 - 80 + 1) + 80)
  END,
  experience = floor(random() * 13),
  fantasy_position_rank = ceil(dynasty_adp / 12),
  last_season_points = round((300 - (dynasty_adp * (0.8 + random() * 0.4)))::numeric, 1),
  bye_week = floor(random() * (14 - 4 + 1) + 4)
WHERE position = 'WR' AND is_active = true;

-- Update TE metadata
UPDATE public.players
SET
  height = floor(random() * (80 - 74 + 1) + 74), -- 6'2" to 6'8"
  weight = floor(random() * (270 - 240 + 1) + 240),
  birth_date = (DATE '1990-01-01' + floor(random() * (365 * 12))::integer),
  college = (SELECT college_name FROM colleges ORDER BY random() LIMIT 1),
  jersey_number = floor(random() * (89 - 80 + 1) + 80),
  experience = floor(random() * 13),
  fantasy_position_rank = ceil(dynasty_adp / 12),
  last_season_points = round((300 - (dynasty_adp * (0.8 + random() * 0.4)))::numeric, 1),
  bye_week = floor(random() * (14 - 4 + 1) + 4)
WHERE position = 'TE' AND is_active = true;

-- Update K metadata
UPDATE public.players
SET
  height = floor(random() * (76 - 70 + 1) + 70), -- 5'10" to 6'4"
  weight = floor(random() * (210 - 180 + 1) + 180),
  birth_date = (DATE '1990-01-01' + floor(random() * (365 * 12))::integer),
  college = (SELECT college_name FROM colleges ORDER BY random() LIMIT 1),
  jersey_number = floor(random() * (9 - 1 + 1) + 1),
  experience = floor(random() * 13),
  fantasy_position_rank = ceil(dynasty_adp / 12),
  last_season_points = round((300 - (dynasty_adp * (0.8 + random() * 0.4)))::numeric, 1),
  bye_week = floor(random() * (14 - 4 + 1) + 4)
WHERE position = 'K' AND is_active = true;

-- Update DEF metadata (only team colors and bye week)
UPDATE public.players
SET
  image_url = 'https://static.www.nfl.com/league/apps/clubs/logos/' || team || '.svg',
  bye_week = floor(random() * (14 - 4 + 1) + 4)
WHERE position = 'DEF' AND is_active = true;

-- Set player image URLs (using a realistic pattern)
UPDATE public.players
SET
  image_url = 'https://static.www.nfl.com/players/headshots/' || player_id || '_250x250.png'
WHERE position != 'DEF' AND is_active = true;

-- Clean up temporary tables
DROP TABLE team_colors;
DROP TABLE colleges;

-- Output a sample of players to verify the update
SELECT 
  player_id, 
  full_name, 
  position, 
  team,
  height, 
  weight, 
  birth_date, 
  college,
  jersey_number, 
  experience,
  team_primary_color,
  team_secondary_color,
  bye_week,
  fantasy_position_rank,
  last_season_points
FROM public.players
WHERE is_active = true
ORDER BY random()
LIMIT 5;