import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ONLY real NFL players - no fake names whatsoever
const realNFLPlayers = [
  // REAL QBs
  { player_id: 'mahomes_patrick_real', full_name: 'Patrick Mahomes', position: 'QB', team: 'KC', dynasty_adp: 15.5, is_active: true },
  { player_id: 'allen_josh_real', full_name: 'Josh Allen', position: 'QB', team: 'BUF', dynasty_adp: 18.2, is_active: true },
  { player_id: 'burrow_joe_real', full_name: 'Joe Burrow', position: 'QB', team: 'CIN', dynasty_adp: 23.7, is_active: true },
  { player_id: 'herbert_justin_real', full_name: 'Justin Herbert', position: 'QB', team: 'LAC', dynasty_adp: 29.3, is_active: true },
  { player_id: 'jackson_lamar_real', full_name: 'Lamar Jackson', position: 'QB', team: 'BAL', dynasty_adp: 31.2, is_active: true },
  { player_id: 'hurts_jalen_real', full_name: 'Jalen Hurts', position: 'QB', team: 'PHI', dynasty_adp: 33.8, is_active: true },
  { player_id: 'williams_caleb_real', full_name: 'Caleb Williams', position: 'QB', team: 'CHI', dynasty_adp: 45.3, is_active: true },
  { player_id: 'stroud_cj_real', full_name: 'C.J. Stroud', position: 'QB', team: 'HOU', dynasty_adp: 47.1, is_active: true },
  { player_id: 'daniels_jayden_real', full_name: 'Jayden Daniels', position: 'QB', team: 'WSH', dynasty_adp: 52.7, is_active: true },
  { player_id: 'love_jordan_real', full_name: 'Jordan Love', position: 'QB', team: 'GB', dynasty_adp: 58.9, is_active: true },
  { player_id: 'richardson_anthony_real', full_name: 'Anthony Richardson', position: 'QB', team: 'IND', dynasty_adp: 63.2, is_active: true },
  { player_id: 'prescott_dak_real', full_name: 'Dak Prescott', position: 'QB', team: 'DAL', dynasty_adp: 89.7, is_active: true },
  { player_id: 'rodgers_aaron_real', full_name: 'Aaron Rodgers', position: 'QB', team: 'NYJ', dynasty_adp: 95.2, is_active: true },
  { player_id: 'stafford_matthew_real', full_name: 'Matthew Stafford', position: 'QB', team: 'LAR', dynasty_adp: 102.8, is_active: true },
  { player_id: 'watson_deshaun_real', full_name: 'Deshaun Watson', position: 'QB', team: 'CLE', dynasty_adp: 108.3, is_active: true },

  // REAL RBs
  { player_id: 'mccaffrey_christian_real', full_name: 'Christian McCaffrey', position: 'RB', team: 'SF', dynasty_adp: 8.3, is_active: true },
  { player_id: 'taylor_jonathan_real', full_name: 'Jonathan Taylor', position: 'RB', team: 'IND', dynasty_adp: 12.7, is_active: true },
  { player_id: 'hall_breece_real', full_name: 'Breece Hall', position: 'RB', team: 'NYJ', dynasty_adp: 14.2, is_active: true },
  { player_id: 'barkley_saquon_real', full_name: 'Saquon Barkley', position: 'RB', team: 'PHI', dynasty_adp: 18.6, is_active: true },
  { player_id: 'gibbs_jahmyr_real', full_name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', dynasty_adp: 19.8, is_active: true },
  { player_id: 'walker_kenneth_real', full_name: 'Kenneth Walker III', position: 'RB', team: 'SEA', dynasty_adp: 21.4, is_active: true },
  { player_id: 'robinson_bijan_real', full_name: 'Bijan Robinson', position: 'RB', team: 'ATL', dynasty_adp: 23.1, is_active: true },
  { player_id: 'etienne_travis_real', full_name: 'Travis Etienne Jr.', position: 'RB', team: 'JAX', dynasty_adp: 25.7, is_active: true },
  { player_id: 'cook_james_real', full_name: 'James Cook', position: 'RB', team: 'BUF', dynasty_adp: 27.2, is_active: true },
  { player_id: 'chubb_nick_real', full_name: 'Nick Chubb', position: 'RB', team: 'CLE', dynasty_adp: 28.9, is_active: true },
  { player_id: 'henry_derrick_real', full_name: 'Derrick Henry', position: 'RB', team: 'BAL', dynasty_adp: 35.2, is_active: true },
  { player_id: 'ekeler_austin_real', full_name: 'Austin Ekeler', position: 'RB', team: 'WSH', dynasty_adp: 42.1, is_active: true },
  { player_id: 'mixon_joe_real', full_name: 'Joe Mixon', position: 'RB', team: 'HOU', dynasty_adp: 45.7, is_active: true },
  { player_id: 'swift_dandre_real', full_name: "D'Andre Swift", position: 'RB', team: 'CHI', dynasty_adp: 48.1, is_active: true },
  { player_id: 'jacobs_josh_real', full_name: 'Josh Jacobs', position: 'RB', team: 'GB', dynasty_adp: 52.3, is_active: true },
  { player_id: 'harris_najee_real', full_name: 'Najee Harris', position: 'RB', team: 'PIT', dynasty_adp: 55.7, is_active: true },
  { player_id: 'pollard_tony_real', full_name: 'Tony Pollard', position: 'RB', team: 'TEN', dynasty_adp: 48.3, is_active: true },
  { player_id: 'white_rachaad_real', full_name: 'Rachaad White', position: 'RB', team: 'TB', dynasty_adp: 67.2, is_active: true },
  { player_id: 'montgomery_david_real', full_name: 'David Montgomery', position: 'RB', team: 'DET', dynasty_adp: 73.5, is_active: true },
  { player_id: 'singletary_devin_real', full_name: 'Devin Singletary', position: 'RB', team: 'NYG', dynasty_adp: 89.4, is_active: true },

  // REAL WRs
  { player_id: 'jefferson_justin_real', full_name: 'Justin Jefferson', position: 'WR', team: 'MIN', dynasty_adp: 5.4, is_active: true },
  { player_id: 'chase_jamarr_real', full_name: "Ja'Marr Chase", position: 'WR', team: 'CIN', dynasty_adp: 7.9, is_active: true },
  { player_id: 'lamb_ceedee_real', full_name: 'CeeDee Lamb', position: 'WR', team: 'DAL', dynasty_adp: 11.2, is_active: true },
  { player_id: 'brown_aj_real', full_name: 'A.J. Brown', position: 'WR', team: 'PHI', dynasty_adp: 16.3, is_active: true },
  { player_id: 'hill_tyreek_real', full_name: 'Tyreek Hill', position: 'WR', team: 'MIA', dynasty_adp: 22.4, is_active: true },
  { player_id: 'adams_davante_real', full_name: 'Davante Adams', position: 'WR', team: 'LV', dynasty_adp: 24.8, is_active: true },
  { player_id: 'diggs_stefon_real', full_name: 'Stefon Diggs', position: 'WR', team: 'HOU', dynasty_adp: 26.9, is_active: true },
  { player_id: 'evans_mike_real', full_name: 'Mike Evans', position: 'WR', team: 'TB', dynasty_adp: 32.1, is_active: true },
  { player_id: 'kupp_cooper_real', full_name: 'Cooper Kupp', position: 'WR', team: 'LAR', dynasty_adp: 34.7, is_active: true },
  { player_id: 'samuel_deebo_real', full_name: 'Deebo Samuel', position: 'WR', team: 'SF', dynasty_adp: 38.3, is_active: true },
  { player_id: 'metcalf_dk_real', full_name: 'DK Metcalf', position: 'WR', team: 'SEA', dynasty_adp: 41.2, is_active: true },
  { player_id: 'london_drake_real', full_name: 'Drake London', position: 'WR', team: 'ATL', dynasty_adp: 43.8, is_active: true },
  { player_id: 'wilson_garrett_real', full_name: 'Garrett Wilson', position: 'WR', team: 'NYJ', dynasty_adp: 46.1, is_active: true },
  { player_id: 'olave_chris_real', full_name: 'Chris Olave', position: 'WR', team: 'NO', dynasty_adp: 49.7, is_active: true },
  { player_id: 'higgins_tee_real', full_name: 'Tee Higgins', position: 'WR', team: 'CIN', dynasty_adp: 51.3, is_active: true },
  { player_id: 'smith_devonta_real', full_name: 'DeVonta Smith', position: 'WR', team: 'PHI', dynasty_adp: 54.2, is_active: true },
  { player_id: 'waddle_jaylen_real', full_name: 'Jaylen Waddle', position: 'WR', team: 'MIA', dynasty_adp: 56.8, is_active: true },
  { player_id: 'williams_mike_real', full_name: 'Mike Williams', position: 'WR', team: 'NYJ', dynasty_adp: 62.3, is_active: true },
  { player_id: 'johnson_diontae_real', full_name: 'Diontae Johnson', position: 'WR', team: 'CAR', dynasty_adp: 64.7, is_active: true },
  { player_id: 'moore_dj_real', full_name: 'DJ Moore', position: 'WR', team: 'CHI', dynasty_adp: 67.1, is_active: true },
  { player_id: 'pittman_michael_real', full_name: 'Michael Pittman Jr.', position: 'WR', team: 'IND', dynasty_adp: 69.8, is_active: true },
  { player_id: 'mclaurin_terry_real', full_name: 'Terry McLaurin', position: 'WR', team: 'WSH', dynasty_adp: 72.4, is_active: true },
  { player_id: 'kirk_christian_real', full_name: 'Christian Kirk', position: 'WR', team: 'JAX', dynasty_adp: 74.9, is_active: true },
  { player_id: 'godwin_chris_real', full_name: 'Chris Godwin', position: 'WR', team: 'TB', dynasty_adp: 77.2, is_active: true },
  { player_id: 'lockett_tyler_real', full_name: 'Tyler Lockett', position: 'WR', team: 'SEA', dynasty_adp: 79.6, is_active: true },
  { player_id: 'hopkins_deandre_real', full_name: 'DeAndre Hopkins', position: 'WR', team: 'TEN', dynasty_adp: 81.3, is_active: true },
  { player_id: 'ridley_calvin_real', full_name: 'Calvin Ridley', position: 'WR', team: 'TEN', dynasty_adp: 83.7, is_active: true },
  { player_id: 'aiyuk_brandon_real', full_name: 'Brandon Aiyuk', position: 'WR', team: 'SF', dynasty_adp: 85.9, is_active: true },
  { player_id: 'sutton_courtland_real', full_name: 'Courtland Sutton', position: 'WR', team: 'DEN', dynasty_adp: 91.3, is_active: true },
  { player_id: 'allen_keenan_real', full_name: 'Keenan Allen', position: 'WR', team: 'CHI', dynasty_adp: 93.7, is_active: true },

  // REAL TEs
  { player_id: 'kelce_travis_real', full_name: 'Travis Kelce', position: 'TE', team: 'KC', dynasty_adp: 39.7, is_active: true },
  { player_id: 'andrews_mark_real', full_name: 'Mark Andrews', position: 'TE', team: 'BAL', dynasty_adp: 59.3, is_active: true },
  { player_id: 'pitts_kyle_real', full_name: 'Kyle Pitts', position: 'TE', team: 'ATL', dynasty_adp: 61.8, is_active: true },
  { player_id: 'hockenson_tj_real', full_name: 'T.J. Hockenson', position: 'TE', team: 'MIN', dynasty_adp: 78.2, is_active: true },
  { player_id: 'kittle_george_real', full_name: 'George Kittle', position: 'TE', team: 'SF', dynasty_adp: 82.7, is_active: true },
  { player_id: 'goedert_dallas_real', full_name: 'Dallas Goedert', position: 'TE', team: 'PHI', dynasty_adp: 94.1, is_active: true },
  { player_id: 'waller_darren_real', full_name: 'Darren Waller', position: 'TE', team: 'NYG', dynasty_adp: 97.3, is_active: true },
  { player_id: 'ertz_zach_real', full_name: 'Zach Ertz', position: 'TE', team: 'ARI', dynasty_adp: 112.5, is_active: true },
  { player_id: 'njoku_david_real', full_name: 'David Njoku', position: 'TE', team: 'CLE', dynasty_adp: 118.7, is_active: true },
  { player_id: 'schultz_dalton_real', full_name: 'Dalton Schultz', position: 'TE', team: 'HOU', dynasty_adp: 124.3, is_active: true },
  { player_id: 'henry_hunter_real', full_name: 'Hunter Henry', position: 'TE', team: 'NE', dynasty_adp: 135.8, is_active: true },
  { player_id: 'freiermuth_pat_real', full_name: 'Pat Freiermuth', position: 'TE', team: 'PIT', dynasty_adp: 142.3, is_active: true },

  // REAL Kickers
  { player_id: 'tucker_justin_real', full_name: 'Justin Tucker', position: 'K', team: 'BAL', dynasty_adp: 205.2, is_active: true },
  { player_id: 'bass_tyler_real', full_name: 'Tyler Bass', position: 'K', team: 'BUF', dynasty_adp: 215.7, is_active: true },
  { player_id: 'mcmanus_brandon_real', full_name: 'Brandon McManus', position: 'K', team: 'JAX', dynasty_adp: 223.1, is_active: true },
  { player_id: 'butker_harrison_real', full_name: 'Harrison Butker', position: 'K', team: 'KC', dynasty_adp: 234.8, is_active: true },
  { player_id: 'carlson_daniel_real', full_name: 'Daniel Carlson', position: 'K', team: 'LV', dynasty_adp: 245.3, is_active: true },

  // REAL Defenses
  { player_id: 'def_sf_real', full_name: 'San Francisco 49ers', position: 'DEF', team: 'SF', dynasty_adp: 187.2, is_active: true },
  { player_id: 'def_dal_real', full_name: 'Dallas Cowboys', position: 'DEF', team: 'DAL', dynasty_adp: 194.7, is_active: true },
  { player_id: 'def_buf_real', full_name: 'Buffalo Bills', position: 'DEF', team: 'BUF', dynasty_adp: 201.3, is_active: true },
  { player_id: 'def_pit_real', full_name: 'Pittsburgh Steelers', position: 'DEF', team: 'PIT', dynasty_adp: 208.9, is_active: true },
  { player_id: 'def_mia_real', full_name: 'Miami Dolphins', position: 'DEF', team: 'MIA', dynasty_adp: 216.4, is_active: true }
];

async function completelyReplaceWithRealPlayers() {
  console.log('🏈 COMPLETELY REPLACING ALL PLAYERS WITH REAL NFL PLAYERS ONLY...');
  
  try {
    // STEP 1: DELETE EVERYTHING - no fake players left
    console.log('🧹 DELETING ALL EXISTING PLAYERS (including fake ones)...');
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .gte('player_id', ''); // Delete all records
    
    if (deleteError) {
      console.log('❌ Error deleting players:', deleteError);
      return;
    }
    
    console.log('✅ ALL FAKE PLAYERS DELETED');
    
    // STEP 2: Insert ONLY real NFL players
    console.log('🏆 INSERTING ONLY REAL NFL PLAYERS...');
    
    const batchSize = 15;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < realNFLPlayers.length; i += batchSize) {
      const batch = realNFLPlayers.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(realNFLPlayers.length / batchSize);
      
      console.log(`Inserting REAL players batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
      
      const { data, error } = await supabase
        .from('players')
        .insert(batch)
        .select();
      
      if (error) {
        console.log(`❌ Failed to insert batch: ${error.code} - ${JSON.stringify(error)}`);
        failCount += batch.length;
      } else {
        console.log(`✅ Successfully inserted ${data.length} REAL players`);
        successCount += data.length;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 REAL NFL PLAYER REPLACEMENT COMPLETE!');
    console.log(`✅ Successfully inserted: ${successCount} REAL players`);
    console.log(`❌ Failed to insert: ${failCount} players`);
    
    // STEP 3: Verify ONLY real players exist
    console.log('\n🔍 VERIFYING ONLY REAL PLAYERS EXIST...');
    const { data: allPlayers, error: verifyError } = await supabase
      .from('players')
      .select('full_name, position, team, dynasty_adp')
      .order('dynasty_adp', { ascending: true })
      .limit(15);
    
    if (!verifyError && allPlayers) {
      console.log('\n🏆 TOP 15 REAL NFL PLAYERS BY DYNASTY ADP:');
      allPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
      });
    }
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📈 TOTAL REAL PLAYERS IN DATABASE: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

completelyReplaceWithRealPlayers();