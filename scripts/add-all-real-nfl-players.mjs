import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Comprehensive real NFL players - all positions except individual defensive players
const allRealNFLPlayers = [
  // AFC EAST - Buffalo Bills
  { player_id: 'allen_josh_buf', full_name: 'Josh Allen', position: 'QB', team: 'BUF', dynasty_adp: 18.2, is_active: true },
  { player_id: 'cook_james_buf', full_name: 'James Cook', position: 'RB', team: 'BUF', dynasty_adp: 27.2, is_active: true },
  { player_id: 'diggs_stefon_buf', full_name: 'Stefon Diggs', position: 'WR', team: 'BUF', dynasty_adp: 26.9, is_active: true },
  { player_id: 'davis_gabe_buf', full_name: 'Gabe Davis', position: 'WR', team: 'BUF', dynasty_adp: 89.3, is_active: true },
  { player_id: 'kincaid_dalton_buf', full_name: 'Dalton Kincaid', position: 'TE', team: 'BUF', dynasty_adp: 87.1, is_active: true },
  { player_id: 'bass_tyler_buf', full_name: 'Tyler Bass', position: 'K', team: 'BUF', dynasty_adp: 215.7, is_active: true },
  
  // Miami Dolphins
  { player_id: 'tagovailoa_tua_mia', full_name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', dynasty_adp: 98.9, is_active: true },
  { player_id: 'mostert_raheem_mia', full_name: 'Raheem Mostert', position: 'RB', team: 'MIA', dynasty_adp: 76.4, is_active: true },
  { player_id: 'hill_tyreek_mia', full_name: 'Tyreek Hill', position: 'WR', team: 'MIA', dynasty_adp: 22.4, is_active: true },
  { player_id: 'waddle_jaylen_mia', full_name: 'Jaylen Waddle', position: 'WR', team: 'MIA', dynasty_adp: 56.8, is_active: true },
  { player_id: 'hill_devon_mia', full_name: 'Devon Achane', position: 'RB', team: 'MIA', dynasty_adp: 45.3, is_active: true },
  
  // New England Patriots
  { player_id: 'maye_drake_ne', full_name: 'Drake Maye', position: 'QB', team: 'NE', dynasty_adp: 67.8, is_active: true },
  { player_id: 'stevenson_rhamondre_ne', full_name: 'Rhamondre Stevenson', position: 'RB', team: 'NE', dynasty_adp: 54.7, is_active: true },
  { player_id: 'boutte_kayshon_ne', full_name: 'Kayshon Boutte', position: 'WR', team: 'NE', dynasty_adp: 123.4, is_active: true },
  { player_id: 'henry_hunter_ne', full_name: 'Hunter Henry', position: 'TE', team: 'NE', dynasty_adp: 135.8, is_active: true },
  
  // New York Jets
  { player_id: 'rodgers_aaron_nyj', full_name: 'Aaron Rodgers', position: 'QB', team: 'NYJ', dynasty_adp: 95.2, is_active: true },
  { player_id: 'hall_breece_nyj', full_name: 'Breece Hall', position: 'RB', team: 'NYJ', dynasty_adp: 14.2, is_active: true },
  { player_id: 'wilson_garrett_nyj', full_name: 'Garrett Wilson', position: 'WR', team: 'NYJ', dynasty_adp: 46.1, is_active: true },
  { player_id: 'adams_davante_nyj', full_name: 'Davante Adams', position: 'WR', team: 'NYJ', dynasty_adp: 24.8, is_active: true },
  { player_id: 'williams_mike_nyj', full_name: 'Mike Williams', position: 'WR', team: 'NYJ', dynasty_adp: 62.3, is_active: true },
  
  // AFC NORTH - Baltimore Ravens
  { player_id: 'jackson_lamar_bal', full_name: 'Lamar Jackson', position: 'QB', team: 'BAL', dynasty_adp: 31.2, is_active: true },
  { player_id: 'henry_derrick_bal', full_name: 'Derrick Henry', position: 'RB', team: 'BAL', dynasty_adp: 35.2, is_active: true },
  { player_id: 'flowers_zay_bal', full_name: 'Zay Flowers', position: 'WR', team: 'BAL', dynasty_adp: 58.7, is_active: true },
  { player_id: 'andrews_mark_bal', full_name: 'Mark Andrews', position: 'TE', team: 'BAL', dynasty_adp: 59.3, is_active: true },
  { player_id: 'tucker_justin_bal', full_name: 'Justin Tucker', position: 'K', team: 'BAL', dynasty_adp: 205.2, is_active: true },
  
  // Cincinnati Bengals
  { player_id: 'burrow_joe_cin', full_name: 'Joe Burrow', position: 'QB', team: 'CIN', dynasty_adp: 23.7, is_active: true },
  { player_id: 'chase_jamarr_cin', full_name: "Ja'Marr Chase", position: 'WR', team: 'CIN', dynasty_adp: 7.9, is_active: true },
  { player_id: 'higgins_tee_cin', full_name: 'Tee Higgins', position: 'WR', team: 'CIN', dynasty_adp: 51.3, is_active: true },
  { player_id: 'brown_chase_cin', full_name: 'Chase Brown', position: 'RB', team: 'CIN', dynasty_adp: 89.1, is_active: true },
  { player_id: 'mcpherson_evan_cin', full_name: 'Evan McPherson', position: 'K', team: 'CIN', dynasty_adp: 215.2, is_active: true },
  
  // Cleveland Browns
  { player_id: 'watson_deshaun_cle', full_name: 'Deshaun Watson', position: 'QB', team: 'CLE', dynasty_adp: 108.2, is_active: true },
  { player_id: 'chubb_nick_cle', full_name: 'Nick Chubb', position: 'RB', team: 'CLE', dynasty_adp: 28.9, is_active: true },
  { player_id: 'cooper_amari_cle', full_name: 'Amari Cooper', position: 'WR', team: 'CLE', dynasty_adp: 78.4, is_active: true },
  { player_id: 'njoku_david_cle', full_name: 'David Njoku', position: 'TE', team: 'CLE', dynasty_adp: 118.7, is_active: true },
  
  // Pittsburgh Steelers
  { player_id: 'wilson_russell_pit', full_name: 'Russell Wilson', position: 'QB', team: 'PIT', dynasty_adp: 124.3, is_active: true },
  { player_id: 'harris_najee_pit', full_name: 'Najee Harris', position: 'RB', team: 'PIT', dynasty_adp: 55.7, is_active: true },
  { player_id: 'pickens_george_pit', full_name: 'George Pickens', position: 'WR', team: 'PIT', dynasty_adp: 67.2, is_active: true },
  { player_id: 'freiermuth_pat_pit', full_name: 'Pat Freiermuth', position: 'TE', team: 'PIT', dynasty_adp: 142.3, is_active: true },
  
  // AFC SOUTH - Houston Texans
  { player_id: 'stroud_cj_hou', full_name: 'C.J. Stroud', position: 'QB', team: 'HOU', dynasty_adp: 47.1, is_active: true },
  { player_id: 'mixon_joe_hou', full_name: 'Joe Mixon', position: 'RB', team: 'HOU', dynasty_adp: 45.7, is_active: true },
  { player_id: 'diggs_stefon_hou', full_name: 'Stefon Diggs', position: 'WR', team: 'HOU', dynasty_adp: 26.9, is_active: true },
  { player_id: 'collins_nico_hou', full_name: 'Nico Collins', position: 'WR', team: 'HOU', dynasty_adp: 73.2, is_active: true },
  { player_id: 'schultz_dalton_hou', full_name: 'Dalton Schultz', position: 'TE', team: 'HOU', dynasty_adp: 124.3, is_active: true },
  
  // Indianapolis Colts
  { player_id: 'richardson_anthony_ind', full_name: 'Anthony Richardson', position: 'QB', team: 'IND', dynasty_adp: 63.2, is_active: true },
  { player_id: 'taylor_jonathan_ind', full_name: 'Jonathan Taylor', position: 'RB', team: 'IND', dynasty_adp: 12.7, is_active: true },
  { player_id: 'pittman_michael_ind', full_name: 'Michael Pittman Jr.', position: 'WR', team: 'IND', dynasty_adp: 69.8, is_active: true },
  { player_id: 'downs_adonai_ind', full_name: 'Adonai Mitchell', position: 'WR', team: 'IND', dynasty_adp: 156.7, is_active: true },
  
  // Jacksonville Jaguars
  { player_id: 'lawrence_trevor_jax', full_name: 'Trevor Lawrence', position: 'QB', team: 'JAX', dynasty_adp: 62.8, is_active: true },
  { player_id: 'etienne_travis_jax', full_name: 'Travis Etienne Jr.', position: 'RB', team: 'JAX', dynasty_adp: 25.7, is_active: true },
  { player_id: 'kirk_christian_jax', full_name: 'Christian Kirk', position: 'WR', team: 'JAX', dynasty_adp: 74.9, is_active: true },
  { player_id: 'thomas_brian_jax', full_name: 'Brian Thomas Jr.', position: 'WR', team: 'JAX', dynasty_adp: 89.4, is_active: true },
  
  // Tennessee Titans
  { player_id: 'levis_will_ten', full_name: 'Will Levis', position: 'QB', team: 'TEN', dynasty_adp: 187.3, is_active: true },
  { player_id: 'pollard_tony_ten', full_name: 'Tony Pollard', position: 'RB', team: 'TEN', dynasty_adp: 48.3, is_active: true },
  { player_id: 'hopkins_deandre_ten', full_name: 'DeAndre Hopkins', position: 'WR', team: 'TEN', dynasty_adp: 81.3, is_active: true },
  { player_id: 'ridley_calvin_ten', full_name: 'Calvin Ridley', position: 'WR', team: 'TEN', dynasty_adp: 83.7, is_active: true },
  
  // AFC WEST - Kansas City Chiefs
  { player_id: 'mahomes_patrick_kc', full_name: 'Patrick Mahomes', position: 'QB', team: 'KC', dynasty_adp: 15.5, is_active: true },
  { player_id: 'hunt_kareem_kc', full_name: 'Kareem Hunt', position: 'RB', team: 'KC', dynasty_adp: 156.8, is_active: true },
  { player_id: 'kelce_travis_kc', full_name: 'Travis Kelce', position: 'TE', team: 'KC', dynasty_adp: 39.7, is_active: true },
  { player_id: 'worthy_xavier_kc', full_name: 'Xavier Worthy', position: 'WR', team: 'KC', dynasty_adp: 112.4, is_active: true },
  { player_id: 'butker_harrison_kc', full_name: 'Harrison Butker', position: 'K', team: 'KC', dynasty_adp: 234.8, is_active: true },
  
  // Las Vegas Raiders
  { player_id: 'minshew_gardner_lv', full_name: 'Gardner Minshew', position: 'QB', team: 'LV', dynasty_adp: 198.7, is_active: true },
  { player_id: 'adams_davante_lv', full_name: 'Davante Adams', position: 'WR', team: 'LV', dynasty_adp: 24.8, is_active: true },
  { player_id: 'white_zamir_lv', full_name: 'Zamir White', position: 'RB', team: 'LV', dynasty_adp: 134.2, is_active: true },
  { player_id: 'bowers_brock_lv', full_name: 'Brock Bowers', position: 'TE', team: 'LV', dynasty_adp: 87.3, is_active: true },
  
  // Los Angeles Chargers
  { player_id: 'herbert_justin_lac', full_name: 'Justin Herbert', position: 'QB', team: 'LAC', dynasty_adp: 29.3, is_active: true },
  { player_id: 'dobbins_jk_lac', full_name: 'J.K. Dobbins', position: 'RB', team: 'LAC', dynasty_adp: 98.7, is_active: true },
  { player_id: 'allen_keenan_lac', full_name: 'Keenan Allen', position: 'WR', team: 'LAC', dynasty_adp: 93.7, is_active: true },
  { player_id: 'mcconkey_ladd_lac', full_name: 'Ladd McConkey', position: 'WR', team: 'LAC', dynasty_adp: 124.8, is_active: true },
  
  // Denver Broncos
  { player_id: 'nix_bo_den', full_name: 'Bo Nix', position: 'QB', team: 'DEN', dynasty_adp: 142.7, is_active: true },
  { player_id: 'williams_javonte_den', full_name: 'Javonte Williams', position: 'RB', team: 'DEN', dynasty_adp: 134.9, is_active: true },
  { player_id: 'sutton_courtland_den', full_name: 'Courtland Sutton', position: 'WR', team: 'DEN', dynasty_adp: 91.3, is_active: true },
  { player_id: 'mims_marvin_den', full_name: 'Marvin Mims Jr.', position: 'WR', team: 'DEN', dynasty_adp: 167.2, is_active: true },
  
  // NFC EAST - Philadelphia Eagles
  { player_id: 'hurts_jalen_phi', full_name: 'Jalen Hurts', position: 'QB', team: 'PHI', dynasty_adp: 33.8, is_active: true },
  { player_id: 'barkley_saquon_phi', full_name: 'Saquon Barkley', position: 'RB', team: 'PHI', dynasty_adp: 18.6, is_active: true },
  { player_id: 'brown_aj_phi', full_name: 'A.J. Brown', position: 'WR', team: 'PHI', dynasty_adp: 16.3, is_active: true },
  { player_id: 'smith_devonta_phi', full_name: 'DeVonta Smith', position: 'WR', team: 'PHI', dynasty_adp: 54.2, is_active: true },
  { player_id: 'goedert_dallas_phi', full_name: 'Dallas Goedert', position: 'TE', team: 'PHI', dynasty_adp: 94.1, is_active: true },
  
  // Dallas Cowboys
  { player_id: 'prescott_dak_dal', full_name: 'Dak Prescott', position: 'QB', team: 'DAL', dynasty_adp: 89.7, is_active: true },
  { player_id: 'lamb_ceedee_dal', full_name: 'CeeDee Lamb', position: 'WR', team: 'DAL', dynasty_adp: 11.2, is_active: true },
  { player_id: 'elliott_ezekiel_dal', full_name: 'Ezekiel Elliott', position: 'RB', team: 'DAL', dynasty_adp: 125.2, is_active: true },
  { player_id: 'ferguson_jake_dal', full_name: 'Jake Ferguson', position: 'TE', team: 'DAL', dynasty_adp: 187.4, is_active: true },
  
  // New York Giants
  { player_id: 'jones_daniel_nyg', full_name: 'Daniel Jones', position: 'QB', team: 'NYG', dynasty_adp: 198.3, is_active: true },
  { player_id: 'nabers_malik_nyg', full_name: 'Malik Nabers', position: 'WR', team: 'NYG', dynasty_adp: 56.4, is_active: true },
  { player_id: 'singletary_devin_nyg', full_name: 'Devin Singletary', position: 'RB', team: 'NYG', dynasty_adp: 89.4, is_active: true },
  { player_id: 'waller_darren_nyg', full_name: 'Darren Waller', position: 'TE', team: 'NYG', dynasty_adp: 97.3, is_active: true },
  
  // Washington Commanders
  { player_id: 'daniels_jayden_was', full_name: 'Jayden Daniels', position: 'QB', team: 'WSH', dynasty_adp: 52.7, is_active: true },
  { player_id: 'ekeler_austin_was', full_name: 'Austin Ekeler', position: 'RB', team: 'WSH', dynasty_adp: 42.1, is_active: true },
  { player_id: 'mclaurin_terry_was', full_name: 'Terry McLaurin', position: 'WR', team: 'WSH', dynasty_adp: 72.4, is_active: true },
  { player_id: 'daniels_rome_was', full_name: 'Rome Odunze', position: 'WR', team: 'WSH', dynasty_adp: 98.7, is_active: true },
  
  // NFC NORTH - Green Bay Packers
  { player_id: 'love_jordan_gb', full_name: 'Jordan Love', position: 'QB', team: 'GB', dynasty_adp: 58.9, is_active: true },
  { player_id: 'jacobs_josh_gb', full_name: 'Josh Jacobs', position: 'RB', team: 'GB', dynasty_adp: 52.3, is_active: true },
  { player_id: 'reed_jayden_gb', full_name: 'Jayden Reed', position: 'WR', team: 'GB', dynasty_adp: 78.9, is_active: true },
  { player_id: 'watson_christian_gb', full_name: 'Christian Watson', position: 'WR', team: 'GB', dynasty_adp: 134.7, is_active: true },
  
  // Chicago Bears
  { player_id: 'williams_caleb_chi', full_name: 'Caleb Williams', position: 'QB', team: 'CHI', dynasty_adp: 45.3, is_active: true },
  { player_id: 'swift_dandre_chi', full_name: "D'Andre Swift", position: 'RB', team: 'CHI', dynasty_adp: 48.1, is_active: true },
  { player_id: 'moore_dj_chi', full_name: 'DJ Moore', position: 'WR', team: 'CHI', dynasty_adp: 67.1, is_active: true },
  { player_id: 'odunze_rome_chi', full_name: 'Rome Odunze', position: 'WR', team: 'CHI', dynasty_adp: 89.2, is_active: true },
  { player_id: 'allen_keenan_chi', full_name: 'Keenan Allen', position: 'WR', team: 'CHI', dynasty_adp: 93.7, is_active: true },
  
  // Detroit Lions
  { player_id: 'goff_jared_det', full_name: 'Jared Goff', position: 'QB', team: 'DET', dynasty_adp: 112.8, is_active: true },
  { player_id: 'gibbs_jahmyr_det', full_name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', dynasty_adp: 19.8, is_active: true },
  { player_id: 'montgomery_david_det', full_name: 'David Montgomery', position: 'RB', team: 'DET', dynasty_adp: 73.5, is_active: true },
  { player_id: 'st_brown_amon_det', full_name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', dynasty_adp: 34.2, is_active: true },
  { player_id: 'williams_jameson_det', full_name: 'Jameson Williams', position: 'WR', team: 'DET', dynasty_adp: 89.7, is_active: true },
  
  // Minnesota Vikings
  { player_id: 'darnold_sam_min', full_name: 'Sam Darnold', position: 'QB', team: 'MIN', dynasty_adp: 198.7, is_active: true },
  { player_id: 'jefferson_justin_min', full_name: 'Justin Jefferson', position: 'WR', team: 'MIN', dynasty_adp: 5.4, is_active: true },
  { player_id: 'addison_jordan_min', full_name: 'Jordan Addison', position: 'WR', team: 'MIN', dynasty_adp: 87.3, is_active: true },
  { player_id: 'hockenson_tj_min', full_name: 'T.J. Hockenson', position: 'TE', team: 'MIN', dynasty_adp: 78.2, is_active: true },
  
  // NFC SOUTH - Atlanta Falcons
  { player_id: 'cousins_kirk_atl', full_name: 'Kirk Cousins', position: 'QB', team: 'ATL', dynasty_adp: 134.7, is_active: true },
  { player_id: 'robinson_bijan_atl', full_name: 'Bijan Robinson', position: 'RB', team: 'ATL', dynasty_adp: 23.1, is_active: true },
  { player_id: 'london_drake_atl', full_name: 'Drake London', position: 'WR', team: 'ATL', dynasty_adp: 43.8, is_active: true },
  { player_id: 'pitts_kyle_atl', full_name: 'Kyle Pitts', position: 'TE', team: 'ATL', dynasty_adp: 61.8, is_active: true },
  
  // Carolina Panthers
  { player_id: 'young_bryce_car', full_name: 'Bryce Young', position: 'QB', team: 'CAR', dynasty_adp: 134.8, is_active: true },
  { player_id: 'hubbard_chuba_car', full_name: 'Chuba Hubbard', position: 'RB', team: 'CAR', dynasty_adp: 156.7, is_active: true },
  { player_id: 'johnson_diontae_car', full_name: 'Diontae Johnson', position: 'WR', team: 'CAR', dynasty_adp: 64.7, is_active: true },
  { player_id: 'legette_xavier_car', full_name: 'Xavier Legette', position: 'WR', team: 'CAR', dynasty_adp: 178.9, is_active: true },
  
  // New Orleans Saints
  { player_id: 'carr_derek_no', full_name: 'Derek Carr', position: 'QB', team: 'NO', dynasty_adp: 167.8, is_active: true },
  { player_id: 'kamara_alvin_no', full_name: 'Alvin Kamara', position: 'RB', team: 'NO', dynasty_adp: 87.4, is_active: true },
  { player_id: 'olave_chris_no', full_name: 'Chris Olave', position: 'WR', team: 'NO', dynasty_adp: 49.7, is_active: true },
  { player_id: 'shaheed_rashid_no', full_name: 'Rashid Shaheed', position: 'WR', team: 'NO', dynasty_adp: 134.9, is_active: true },
  
  // Tampa Bay Buccaneers
  { player_id: 'mayfield_baker_tb', full_name: 'Baker Mayfield', position: 'QB', team: 'TB', dynasty_adp: 123.7, is_active: true },
  { player_id: 'white_rachaad_tb', full_name: 'Rachaad White', position: 'RB', team: 'TB', dynasty_adp: 67.2, is_active: true },
  { player_id: 'evans_mike_tb', full_name: 'Mike Evans', position: 'WR', team: 'TB', dynasty_adp: 32.1, is_active: true },
  { player_id: 'godwin_chris_tb', full_name: 'Chris Godwin', position: 'WR', team: 'TB', dynasty_adp: 77.2, is_active: true },
  
  // NFC WEST - San Francisco 49ers
  { player_id: 'purdy_brock_sf', full_name: 'Brock Purdy', position: 'QB', team: 'SF', dynasty_adp: 87.3, is_active: true },
  { player_id: 'mccaffrey_christian_sf', full_name: 'Christian McCaffrey', position: 'RB', team: 'SF', dynasty_adp: 8.3, is_active: true },
  { player_id: 'samuel_deebo_sf', full_name: 'Deebo Samuel', position: 'WR', team: 'SF', dynasty_adp: 38.3, is_active: true },
  { player_id: 'aiyuk_brandon_sf', full_name: 'Brandon Aiyuk', position: 'WR', team: 'SF', dynasty_adp: 85.9, is_active: true },
  { player_id: 'kittle_george_sf', full_name: 'George Kittle', position: 'TE', team: 'SF', dynasty_adp: 82.7, is_active: true },
  
  // Los Angeles Rams
  { player_id: 'stafford_matthew_lar', full_name: 'Matthew Stafford', position: 'QB', team: 'LAR', dynasty_adp: 102.8, is_active: true },
  { player_id: 'kupp_cooper_lar', full_name: 'Cooper Kupp', position: 'WR', team: 'LAR', dynasty_adp: 34.7, is_active: true },
  { player_id: 'nacua_puka_lar', full_name: 'Puka Nacua', position: 'WR', team: 'LAR', dynasty_adp: 67.8, is_active: true },
  { player_id: 'kyren_williams_lar', full_name: 'Kyren Williams', position: 'RB', team: 'LAR', dynasty_adp: 78.4, is_active: true },
  
  // Seattle Seahawks
  { player_id: 'smith_geno_sea', full_name: 'Geno Smith', position: 'QB', team: 'SEA', dynasty_adp: 167.9, is_active: true },
  { player_id: 'walker_kenneth_sea', full_name: 'Kenneth Walker III', position: 'RB', team: 'SEA', dynasty_adp: 21.4, is_active: true },
  { player_id: 'metcalf_dk_sea', full_name: 'DK Metcalf', position: 'WR', team: 'SEA', dynasty_adp: 41.2, is_active: true },
  { player_id: 'lockett_tyler_sea', full_name: 'Tyler Lockett', position: 'WR', team: 'SEA', dynasty_adp: 79.6, is_active: true },
  { player_id: 'jsr_jaxon_sea', full_name: 'Jaxon Smith-Njigba', position: 'WR', team: 'SEA', dynasty_adp: 98.3, is_active: true },
  
  // Arizona Cardinals
  { player_id: 'murray_kyler_ari', full_name: 'Kyler Murray', position: 'QB', team: 'ARI', dynasty_adp: 88.4, is_active: true },
  { player_id: 'conner_james_ari', full_name: 'James Conner', position: 'RB', team: 'ARI', dynasty_adp: 98.7, is_active: true },
  { player_id: 'harrison_marvin_ari', full_name: 'Marvin Harrison Jr.', position: 'WR', team: 'ARI', dynasty_adp: 67.3, is_active: true },
  { player_id: 'ertz_zach_ari', full_name: 'Zach Ertz', position: 'TE', team: 'ARI', dynasty_adp: 112.5, is_active: true },
  
  // TEAM DEFENSES (32 teams)
  { player_id: 'def_ari', full_name: 'Arizona Cardinals', position: 'DEF', team: 'ARI', dynasty_adp: 250.1, is_active: true },
  { player_id: 'def_atl', full_name: 'Atlanta Falcons', position: 'DEF', team: 'ATL', dynasty_adp: 250.2, is_active: true },
  { player_id: 'def_bal', full_name: 'Baltimore Ravens', position: 'DEF', team: 'BAL', dynasty_adp: 250.3, is_active: true },
  { player_id: 'def_buf', full_name: 'Buffalo Bills', position: 'DEF', team: 'BUF', dynasty_adp: 201.3, is_active: true },
  { player_id: 'def_car', full_name: 'Carolina Panthers', position: 'DEF', team: 'CAR', dynasty_adp: 250.4, is_active: true },
  { player_id: 'def_chi', full_name: 'Chicago Bears', position: 'DEF', team: 'CHI', dynasty_adp: 250.5, is_active: true },
  { player_id: 'def_cin', full_name: 'Cincinnati Bengals', position: 'DEF', team: 'CIN', dynasty_adp: 250.6, is_active: true },
  { player_id: 'def_cle', full_name: 'Cleveland Browns', position: 'DEF', team: 'CLE', dynasty_adp: 250.7, is_active: true },
  { player_id: 'def_dal', full_name: 'Dallas Cowboys', position: 'DEF', team: 'DAL', dynasty_adp: 194.7, is_active: true },
  { player_id: 'def_den', full_name: 'Denver Broncos', position: 'DEF', team: 'DEN', dynasty_adp: 250.8, is_active: true },
  { player_id: 'def_det', full_name: 'Detroit Lions', position: 'DEF', team: 'DET', dynasty_adp: 250.9, is_active: true },
  { player_id: 'def_gb', full_name: 'Green Bay Packers', position: 'DEF', team: 'GB', dynasty_adp: 250.10, is_active: true },
  { player_id: 'def_hou', full_name: 'Houston Texans', position: 'DEF', team: 'HOU', dynasty_adp: 250.11, is_active: true },
  { player_id: 'def_ind', full_name: 'Indianapolis Colts', position: 'DEF', team: 'IND', dynasty_adp: 250.12, is_active: true },
  { player_id: 'def_jax', full_name: 'Jacksonville Jaguars', position: 'DEF', team: 'JAX', dynasty_adp: 250.13, is_active: true },
  { player_id: 'def_kc', full_name: 'Kansas City Chiefs', position: 'DEF', team: 'KC', dynasty_adp: 250.14, is_active: true },
  { player_id: 'def_lv', full_name: 'Las Vegas Raiders', position: 'DEF', team: 'LV', dynasty_adp: 250.15, is_active: true },
  { player_id: 'def_lac', full_name: 'Los Angeles Chargers', position: 'DEF', team: 'LAC', dynasty_adp: 250.16, is_active: true },
  { player_id: 'def_lar', full_name: 'Los Angeles Rams', position: 'DEF', team: 'LAR', dynasty_adp: 250.17, is_active: true },
  { player_id: 'def_mia', full_name: 'Miami Dolphins', position: 'DEF', team: 'MIA', dynasty_adp: 250.18, is_active: true },
  { player_id: 'def_min', full_name: 'Minnesota Vikings', position: 'DEF', team: 'MIN', dynasty_adp: 250.19, is_active: true },
  { player_id: 'def_ne', full_name: 'New England Patriots', position: 'DEF', team: 'NE', dynasty_adp: 250.20, is_active: true },
  { player_id: 'def_no', full_name: 'New Orleans Saints', position: 'DEF', team: 'NO', dynasty_adp: 250.21, is_active: true },
  { player_id: 'def_nyg', full_name: 'New York Giants', position: 'DEF', team: 'NYG', dynasty_adp: 250.22, is_active: true },
  { player_id: 'def_nyj', full_name: 'New York Jets', position: 'DEF', team: 'NYJ', dynasty_adp: 250.23, is_active: true },
  { player_id: 'def_phi', full_name: 'Philadelphia Eagles', position: 'DEF', team: 'PHI', dynasty_adp: 250.24, is_active: true },
  { player_id: 'def_pit', full_name: 'Pittsburgh Steelers', position: 'DEF', team: 'PIT', dynasty_adp: 208.9, is_active: true },
  { player_id: 'def_sf', full_name: 'San Francisco 49ers', position: 'DEF', team: 'SF', dynasty_adp: 187.2, is_active: true },
  { player_id: 'def_sea', full_name: 'Seattle Seahawks', position: 'DEF', team: 'SEA', dynasty_adp: 250.25, is_active: true },
  { player_id: 'def_tb', full_name: 'Tampa Bay Buccaneers', position: 'DEF', team: 'TB', dynasty_adp: 250.26, is_active: true },
  { player_id: 'def_ten', full_name: 'Tennessee Titans', position: 'DEF', team: 'TEN', dynasty_adp: 250.27, is_active: true },
  { player_id: 'def_was', full_name: 'Washington Commanders', position: 'DEF', team: 'WSH', dynasty_adp: 250.28, is_active: true }
];

async function addAllRealNFLPlayers() {
  console.log('🏈 ADDING ALL REAL NFL PLAYERS TO DATABASE...');
  console.log(`📊 Total players to add: ${allRealNFLPlayers.length}`);
  
  try {
    // Insert players in batches
    const batchSize = 25;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < allRealNFLPlayers.length; i += batchSize) {
      const batch = allRealNFLPlayers.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allRealNFLPlayers.length / batchSize);
      
      console.log(`📦 Inserting batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
      
      const { data, error } = await supabase
        .from('players')
        .insert(batch)
        .select();
      
      if (error) {
        console.log(`❌ Failed to insert batch: ${error.code} - ${error.message}`);
        failCount += batch.length;
      } else {
        console.log(`✅ Successfully inserted ${data.length} players`);
        successCount += data.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 NFL PLAYER ADDITION COMPLETE!');
    console.log(`✅ Successfully added: ${successCount} players`);
    console.log(`❌ Failed to add: ${failCount} players`);
    
    // Get final count and verify
    const { count: totalCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 TOTAL PLAYERS IN DATABASE: ${totalCount}`);
    
    // Position breakdown
    const positionCounts = allRealNFLPlayers.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📈 POSITION BREAKDOWN:`);
    Object.entries(positionCounts).forEach(([pos, count]) => {
      console.log(`${pos}: ${count} players`);
    });
    
    // Show top 15 by ADP
    const { data: topPlayers, error: topError } = await supabase
      .from('players')
      .select('full_name, position, team, dynasty_adp')
      .order('dynasty_adp', { ascending: true })
      .limit(15);
    
    if (!topError && topPlayers) {
      console.log('\n🏆 TOP 15 PLAYERS BY DYNASTY ADP:');
      topPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAllRealNFLPlayers();