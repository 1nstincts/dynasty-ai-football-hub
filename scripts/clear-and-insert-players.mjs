import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const realNFLPlayers = [
  // Top QBs
  { player_id: 'mahomes_patrick', full_name: 'Patrick Mahomes', position: 'QB', team: 'KC', dynasty_adp: 15.5, is_active: true },
  { player_id: 'allen_josh', full_name: 'Josh Allen', position: 'QB', team: 'BUF', dynasty_adp: 18.2, is_active: true },
  { player_id: 'burrow_joe', full_name: 'Joe Burrow', position: 'QB', team: 'CIN', dynasty_adp: 23.7, is_active: true },
  { player_id: 'herbert_justin', full_name: 'Justin Herbert', position: 'QB', team: 'LAC', dynasty_adp: 29.3, is_active: true },
  { player_id: 'jackson_lamar', full_name: 'Lamar Jackson', position: 'QB', team: 'BAL', dynasty_adp: 31.2, is_active: true },
  { player_id: 'hurts_jalen', full_name: 'Jalen Hurts', position: 'QB', team: 'PHI', dynasty_adp: 33.8, is_active: true },
  { player_id: 'williams_caleb', full_name: 'Caleb Williams', position: 'QB', team: 'CHI', dynasty_adp: 45.3, is_active: true },
  { player_id: 'stroud_cj', full_name: 'C.J. Stroud', position: 'QB', team: 'HOU', dynasty_adp: 47.1, is_active: true },
  { player_id: 'daniels_jayden', full_name: 'Jayden Daniels', position: 'QB', team: 'WSH', dynasty_adp: 52.7, is_active: true },
  { player_id: 'love_jordan', full_name: 'Jordan Love', position: 'QB', team: 'GB', dynasty_adp: 58.9, is_active: true },
  { player_id: 'richardson_anthony', full_name: 'Anthony Richardson', position: 'QB', team: 'IND', dynasty_adp: 63.2, is_active: true },
  { player_id: 'prescott_dak', full_name: 'Dak Prescott', position: 'QB', team: 'DAL', dynasty_adp: 89.7, is_active: true },

  // Top RBs
  { player_id: 'mccaffrey_christian', full_name: 'Christian McCaffrey', position: 'RB', team: 'SF', dynasty_adp: 8.3, is_active: true },
  { player_id: 'taylor_jonathan', full_name: 'Jonathan Taylor', position: 'RB', team: 'IND', dynasty_adp: 12.7, is_active: true },
  { player_id: 'hall_breece', full_name: 'Breece Hall', position: 'RB', team: 'NYJ', dynasty_adp: 14.2, is_active: true },
  { player_id: 'barkley_saquon', full_name: 'Saquon Barkley', position: 'RB', team: 'PHI', dynasty_adp: 18.6, is_active: true },
  { player_id: 'gibbs_jahmyr', full_name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', dynasty_adp: 19.8, is_active: true },
  { player_id: 'walker_kenneth', full_name: 'Kenneth Walker III', position: 'RB', team: 'SEA', dynasty_adp: 21.4, is_active: true },
  { player_id: 'robinson_bijan', full_name: 'Bijan Robinson', position: 'RB', team: 'ATL', dynasty_adp: 23.1, is_active: true },
  { player_id: 'etienne_travis', full_name: 'Travis Etienne Jr.', position: 'RB', team: 'JAX', dynasty_adp: 25.7, is_active: true },
  { player_id: 'cook_james', full_name: 'James Cook', position: 'RB', team: 'BUF', dynasty_adp: 27.2, is_active: true },
  { player_id: 'chubb_nick', full_name: 'Nick Chubb', position: 'RB', team: 'CLE', dynasty_adp: 28.9, is_active: true },
  { player_id: 'henry_derrick', full_name: 'Derrick Henry', position: 'RB', team: 'BAL', dynasty_adp: 35.2, is_active: true },
  { player_id: 'ekeler_austin', full_name: 'Austin Ekeler', position: 'RB', team: 'WSH', dynasty_adp: 42.1, is_active: true },
  { player_id: 'mixon_joe', full_name: 'Joe Mixon', position: 'RB', team: 'HOU', dynasty_adp: 45.7, is_active: true },
  { player_id: 'swift_dandre', full_name: "D'Andre Swift", position: 'RB', team: 'CHI', dynasty_adp: 48.1, is_active: true },
  { player_id: 'jacobs_josh', full_name: 'Josh Jacobs', position: 'RB', team: 'GB', dynasty_adp: 52.3, is_active: true },
  { player_id: 'harris_najee', full_name: 'Najee Harris', position: 'RB', team: 'PIT', dynasty_adp: 55.7, is_active: true },
  { player_id: 'cook_dalvin', full_name: 'Dalvin Cook', position: 'RB', team: 'FA', dynasty_adp: 65.2, is_active: true },
  { player_id: 'elliott_ezekiel', full_name: 'Ezekiel Elliott', position: 'RB', team: 'DAL', dynasty_adp: 85.2, is_active: true },
  { player_id: 'pollard_tony', full_name: 'Tony Pollard', position: 'RB', team: 'TEN', dynasty_adp: 48.3, is_active: true },

  // Top WRs
  { player_id: 'jefferson_justin', full_name: 'Justin Jefferson', position: 'WR', team: 'MIN', dynasty_adp: 5.4, is_active: true },
  { player_id: 'chase_jamarr', full_name: "Ja'Marr Chase", position: 'WR', team: 'CIN', dynasty_adp: 7.9, is_active: true },
  { player_id: 'lamb_ceedee', full_name: 'CeeDee Lamb', position: 'WR', team: 'DAL', dynasty_adp: 11.2, is_active: true },
  { player_id: 'brown_aj', full_name: 'A.J. Brown', position: 'WR', team: 'PHI', dynasty_adp: 16.3, is_active: true },
  { player_id: 'hill_tyreek', full_name: 'Tyreek Hill', position: 'WR', team: 'MIA', dynasty_adp: 22.4, is_active: true },
  { player_id: 'adams_davante', full_name: 'Davante Adams', position: 'WR', team: 'LV', dynasty_adp: 24.8, is_active: true },
  { player_id: 'diggs_stefon', full_name: 'Stefon Diggs', position: 'WR', team: 'HOU', dynasty_adp: 26.9, is_active: true },
  { player_id: 'evans_mike', full_name: 'Mike Evans', position: 'WR', team: 'TB', dynasty_adp: 32.1, is_active: true },
  { player_id: 'kupp_cooper', full_name: 'Cooper Kupp', position: 'WR', team: 'LAR', dynasty_adp: 34.7, is_active: true },
  { player_id: 'samuel_deebo', full_name: 'Deebo Samuel', position: 'WR', team: 'SF', dynasty_adp: 38.3, is_active: true },
  { player_id: 'metcalf_dk', full_name: 'DK Metcalf', position: 'WR', team: 'SEA', dynasty_adp: 41.2, is_active: true },
  { player_id: 'london_drake', full_name: 'Drake London', position: 'WR', team: 'ATL', dynasty_adp: 43.8, is_active: true },
  { player_id: 'williams_garrett', full_name: 'Garrett Wilson', position: 'WR', team: 'NYJ', dynasty_adp: 46.1, is_active: true },
  { player_id: 'olave_chris', full_name: 'Chris Olave', position: 'WR', team: 'NO', dynasty_adp: 49.7, is_active: true },
  { player_id: 'higgins_tee', full_name: 'Tee Higgins', position: 'WR', team: 'CIN', dynasty_adp: 51.3, is_active: true },
  { player_id: 'smith_devonta', full_name: 'DeVonta Smith', position: 'WR', team: 'PHI', dynasty_adp: 54.2, is_active: true },
  { player_id: 'waddle_jaylen', full_name: 'Jaylen Waddle', position: 'WR', team: 'MIA', dynasty_adp: 56.8, is_active: true },
  { player_id: 'wilson_garrett', full_name: 'Garrett Wilson', position: 'WR', team: 'NYJ', dynasty_adp: 58.9, is_active: true },
  { player_id: 'williams_mike', full_name: 'Mike Williams', position: 'WR', team: 'NYJ', dynasty_adp: 62.3, is_active: true },
  { player_id: 'johnson_diontae', full_name: 'Diontae Johnson', position: 'WR', team: 'CAR', dynasty_adp: 64.7, is_active: true },
  { player_id: 'moore_dj', full_name: 'DJ Moore', position: 'WR', team: 'CHI', dynasty_adp: 67.1, is_active: true },
  { player_id: 'pittman_michael', full_name: 'Michael Pittman Jr.', position: 'WR', team: 'IND', dynasty_adp: 69.8, is_active: true },
  { player_id: 'mclaurin_terry', full_name: 'Terry McLaurin', position: 'WR', team: 'WSH', dynasty_adp: 72.4, is_active: true },
  { player_id: 'kirk_christian', full_name: 'Christian Kirk', position: 'WR', team: 'JAX', dynasty_adp: 74.9, is_active: true },
  { player_id: 'godwin_chris', full_name: 'Chris Godwin', position: 'WR', team: 'TB', dynasty_adp: 77.2, is_active: true },
  { player_id: 'lockett_tyler', full_name: 'Tyler Lockett', position: 'WR', team: 'SEA', dynasty_adp: 79.6, is_active: true },
  { player_id: 'hopkins_deandre', full_name: 'DeAndre Hopkins', position: 'WR', team: 'TEN', dynasty_adp: 81.3, is_active: true },
  { player_id: 'ridley_calvin', full_name: 'Calvin Ridley', position: 'WR', team: 'TEN', dynasty_adp: 83.7, is_active: true },

  // Top TEs
  { player_id: 'kelce_travis', full_name: 'Travis Kelce', position: 'TE', team: 'KC', dynasty_adp: 39.7, is_active: true },
  { player_id: 'andrews_mark', full_name: 'Mark Andrews', position: 'TE', team: 'BAL', dynasty_adp: 59.3, is_active: true },
  { player_id: 'pitts_kyle', full_name: 'Kyle Pitts', position: 'TE', team: 'ATL', dynasty_adp: 61.8, is_active: true },
  { player_id: 'hockenson_tj', full_name: 'T.J. Hockenson', position: 'TE', team: 'MIN', dynasty_adp: 78.2, is_active: true },
  { player_id: 'kittle_george', full_name: 'George Kittle', position: 'TE', team: 'SF', dynasty_adp: 82.7, is_active: true },
  { player_id: 'goedert_dallas', full_name: 'Dallas Goedert', position: 'TE', team: 'PHI', dynasty_adp: 94.1, is_active: true },
  { player_id: 'waller_darren', full_name: 'Darren Waller', position: 'TE', team: 'NYG', dynasty_adp: 97.3, is_active: true },
  { player_id: 'ertz_zach', full_name: 'Zach Ertz', position: 'TE', team: 'ARI', dynasty_adp: 112.5, is_active: true },
  { player_id: 'njoku_david', full_name: 'David Njoku', position: 'TE', team: 'CLE', dynasty_adp: 118.7, is_active: true },
  { player_id: 'schultz_dalton', full_name: 'Dalton Schultz', position: 'TE', team: 'HOU', dynasty_adp: 124.3, is_active: true },

  // Top Kickers
  { player_id: 'tucker_justin', full_name: 'Justin Tucker', position: 'K', team: 'BAL', dynasty_adp: 205.2, is_active: true },
  { player_id: 'bass_tyler', full_name: 'Tyler Bass', position: 'K', team: 'BUF', dynasty_adp: 215.7, is_active: true },
  { player_id: 'mcmanus_brandon', full_name: 'Brandon McManus', position: 'K', team: 'JAX', dynasty_adp: 223.1, is_active: true },
  { player_id: 'butker_harrison', full_name: 'Harrison Butker', position: 'K', team: 'KC', dynasty_adp: 234.8, is_active: true },
  { player_id: 'carlson_daniel', full_name: 'Daniel Carlson', position: 'K', team: 'LV', dynasty_adp: 245.3, is_active: true },

  // Top Defenses
  { player_id: 'def_sf', full_name: 'San Francisco 49ers', position: 'DEF', team: 'SF', dynasty_adp: 187.2, is_active: true },
  { player_id: 'def_dal', full_name: 'Dallas Cowboys', position: 'DEF', team: 'DAL', dynasty_adp: 194.7, is_active: true },
  { player_id: 'def_buf', full_name: 'Buffalo Bills', position: 'DEF', team: 'BUF', dynasty_adp: 201.3, is_active: true },
  { player_id: 'def_pit', full_name: 'Pittsburgh Steelers', position: 'DEF', team: 'PIT', dynasty_adp: 208.9, is_active: true },
  { player_id: 'def_mia', full_name: 'Miami Dolphins', position: 'DEF', team: 'MIA', dynasty_adp: 216.4, is_active: true }
];

async function clearAndInsertPlayers() {
  console.log('🏈 Clearing and inserting real NFL players...');
  
  try {
    // First clear all existing players
    console.log('🧹 Clearing existing players...');
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .neq('player_id', 'impossible_value'); // Delete all records
    
    if (deleteError) {
      console.log('❌ Error clearing players:', deleteError);
      return;
    }
    
    console.log('✅ Cleared existing players');
    
    // Insert new players in smaller batches
    const batchSize = 20;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < realNFLPlayers.length; i += batchSize) {
      const batch = realNFLPlayers.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(realNFLPlayers.length / batchSize);
      
      console.log(`Inserting batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
      
      const { data, error } = await supabase
        .from('players')
        .insert(batch)
        .select();
      
      if (error) {
        console.log(`❌ Failed to insert batch: ${error.code} - ${JSON.stringify(error)}`);
        failCount += batch.length;
      } else {
        console.log(`✅ Successfully inserted ${data.length} players`);
        successCount += data.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Real NFL player insertion complete!');
    console.log(`✅ Successfully inserted: ${successCount} players`);
    console.log(`❌ Failed to insert: ${failCount} players`);
    
    // Position breakdown
    const positionCounts = realNFLPlayers.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 Position breakdown:`, positionCounts);
    
    // Show top 10 by ADP
    const sortedByADP = realNFLPlayers
      .filter(p => p.position !== 'K' && p.position !== 'DEF')
      .sort((a, b) => a.dynasty_adp - b.dynasty_adp)
      .slice(0, 10);
    
    console.log('\n🏆 Top 10 by Dynasty ADP:');
    sortedByADP.forEach((player, index) => {
      console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearAndInsertPlayers();