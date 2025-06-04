import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function overwriteFakeWithReal() {
  console.log('🔄 OVERWRITING FAKE PLAYERS WITH REAL NFL DATA...');
  
  try {
    // Step 1: Get all current players
    console.log('📋 Getting all current players...');
    const { data: allPlayers, error: fetchError } = await supabase
      .from('players')
      .select('player_id, full_name, position');
    
    if (fetchError) {
      console.log('❌ Error fetching players:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${allPlayers.length} players to update`);
    
    // Step 2: Define real NFL player data to overwrite with
    const realPlayerData = {
      // Real QBs
      'mahomes_pat': { full_name: 'Patrick Mahomes', position: 'QB', team: 'KC', dynasty_adp: 15.5, is_active: true },
      'allen_jos': { full_name: 'Josh Allen', position: 'QB', team: 'BUF', dynasty_adp: 18.2, is_active: true },
      'burrow_joe': { full_name: 'Joe Burrow', position: 'QB', team: 'CIN', dynasty_adp: 23.7, is_active: true },
      'jackson_lam': { full_name: 'Lamar Jackson', position: 'QB', team: 'BAL', dynasty_adp: 31.2, is_active: true },
      'herbert_jus': { full_name: 'Justin Herbert', position: 'QB', team: 'LAC', dynasty_adp: 29.3, is_active: true },
      'lawrence_tre': { full_name: 'Trevor Lawrence', position: 'QB', team: 'JAX', dynasty_adp: 62.8, is_active: true },
      'murray_kyl': { full_name: 'Kyler Murray', position: 'QB', team: 'ARI', dynasty_adp: 88.4, is_active: true },
      'watson_des': { full_name: 'Deshaun Watson', position: 'QB', team: 'CLE', dynasty_adp: 108.2, is_active: true },
      'prescott_dak': { full_name: 'Dak Prescott', position: 'QB', team: 'DAL', dynasty_adp: 89.7, is_active: true },
      'tua_tago': { full_name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', dynasty_adp: 98.9, is_active: true },
      
      // Real RBs
      'mccaffrey_chr': { full_name: 'Christian McCaffrey', position: 'RB', team: 'SF', dynasty_adp: 8.3, is_active: true },
      'taylor_jon': { full_name: 'Jonathan Taylor', position: 'RB', team: 'IND', dynasty_adp: 12.7, is_active: true },
      'cook_dal': { full_name: 'Dalvin Cook', position: 'RB', team: 'FA', dynasty_adp: 85.2, is_active: true },
      'henry_der': { full_name: 'Derrick Henry', position: 'RB', team: 'BAL', dynasty_adp: 35.2, is_active: true },
      'ekeler_aus': { full_name: 'Austin Ekeler', position: 'RB', team: 'WSH', dynasty_adp: 42.1, is_active: true },
      'chubb_nic': { full_name: 'Nick Chubb', position: 'RB', team: 'CLE', dynasty_adp: 28.9, is_active: true },
      'mixon_joe': { full_name: 'Joe Mixon', position: 'RB', team: 'HOU', dynasty_adp: 45.7, is_active: true },
      'jacobs_jos': { full_name: 'Josh Jacobs', position: 'RB', team: 'GB', dynasty_adp: 52.3, is_active: true },
      'saquon_bar': { full_name: 'Saquon Barkley', position: 'RB', team: 'PHI', dynasty_adp: 18.6, is_active: true },
      'elliott_eze': { full_name: 'Ezekiel Elliott', position: 'RB', team: 'DAL', dynasty_adp: 125.2, is_active: true },
      
      // Real WRs  
      'jefferson_jus': { full_name: 'Justin Jefferson', position: 'WR', team: 'MIN', dynasty_adp: 5.4, is_active: true },
      'chase_jama': { full_name: "Ja'Marr Chase", position: 'WR', team: 'CIN', dynasty_adp: 7.9, is_active: true },
      'lamb_cee': { full_name: 'CeeDee Lamb', position: 'WR', team: 'DAL', dynasty_adp: 11.2, is_active: true },
      'hill_tyr': { full_name: 'Tyreek Hill', position: 'WR', team: 'MIA', dynasty_adp: 22.4, is_active: true },
      'adams_dav': { full_name: 'Davante Adams', position: 'WR', team: 'LV', dynasty_adp: 24.8, is_active: true },
      'diggs_ste': { full_name: 'Stefon Diggs', position: 'WR', team: 'HOU', dynasty_adp: 26.9, is_active: true },
      'hopkins_dea': { full_name: 'DeAndre Hopkins', position: 'WR', team: 'TEN', dynasty_adp: 81.3, is_active: true },
      'brown_aj': { full_name: 'A.J. Brown', position: 'WR', team: 'PHI', dynasty_adp: 16.3, is_active: true },
      'evans_mik': { full_name: 'Mike Evans', position: 'WR', team: 'TB', dynasty_adp: 32.1, is_active: true },
      'kupp_coo': { full_name: 'Cooper Kupp', position: 'WR', team: 'LAR', dynasty_adp: 34.7, is_active: true },
      'waddle_jay': { full_name: 'Jaylen Waddle', position: 'WR', team: 'MIA', dynasty_adp: 56.8, is_active: true },
      'smith_dev': { full_name: 'DeVonta Smith', position: 'WR', team: 'PHI', dynasty_adp: 54.2, is_active: true },
      'higgins_tee': { full_name: 'Tee Higgins', position: 'WR', team: 'CIN', dynasty_adp: 51.3, is_active: true },
      'metcalf_dk': { full_name: 'DK Metcalf', position: 'WR', team: 'SEA', dynasty_adp: 41.2, is_active: true },
      'mclaurin_ter': { full_name: 'Terry McLaurin', position: 'WR', team: 'WSH', dynasty_adp: 72.4, is_active: true },
      'godwin_chr': { full_name: 'Chris Godwin', position: 'WR', team: 'TB', dynasty_adp: 77.2, is_active: true },
      'pittman_mic': { full_name: 'Michael Pittman Jr.', position: 'WR', team: 'IND', dynasty_adp: 69.8, is_active: true },
      'williams_gar': { full_name: 'Garrett Wilson', position: 'WR', team: 'NYJ', dynasty_adp: 46.1, is_active: true },
      'olave_chr': { full_name: 'Chris Olave', position: 'WR', team: 'NO', dynasty_adp: 49.7, is_active: true },
      'london_dra': { full_name: 'Drake London', position: 'WR', team: 'ATL', dynasty_adp: 43.8, is_active: true },
      
      // Real TEs
      'kelce_tra': { full_name: 'Travis Kelce', position: 'TE', team: 'KC', dynasty_adp: 39.7, is_active: true },
      'andrews_mar': { full_name: 'Mark Andrews', position: 'TE', team: 'BAL', dynasty_adp: 59.3, is_active: true },
      'kittle_geo': { full_name: 'George Kittle', position: 'TE', team: 'SF', dynasty_adp: 82.7, is_active: true },
      'pitts_kyl': { full_name: 'Kyle Pitts', position: 'TE', team: 'ATL', dynasty_adp: 61.8, is_active: true },
      'waller_dar': { full_name: 'Darren Waller', position: 'TE', team: 'NYG', dynasty_adp: 97.3, is_active: true },
      'goedert_dal': { full_name: 'Dallas Goedert', position: 'TE', team: 'PHI', dynasty_adp: 94.1, is_active: true },
      'hockenson_tj': { full_name: 'T.J. Hockenson', position: 'TE', team: 'MIN', dynasty_adp: 78.2, is_active: true },
      'ertz_zac': { full_name: 'Zach Ertz', position: 'TE', team: 'ARI', dynasty_adp: 112.5, is_active: true },
      
      // Real Kickers
      'tucker_jus': { full_name: 'Justin Tucker', position: 'K', team: 'BAL', dynasty_adp: 205.2, is_active: true },
      'mcpherson_eva': { full_name: 'Evan McPherson', position: 'K', team: 'CIN', dynasty_adp: 215.2, is_active: true },
      'bass_tyl': { full_name: 'Tyler Bass', position: 'K', team: 'BUF', dynasty_adp: 215.7, is_active: true },
      'butker_har': { full_name: 'Harrison Butker', position: 'K', team: 'KC', dynasty_adp: 234.8, is_active: true },
      
      // Real Defenses
      'def_sf': { full_name: 'San Francisco 49ers', position: 'DEF', team: 'SF', dynasty_adp: 187.2, is_active: true },
      'def_dal': { full_name: 'Dallas Cowboys', position: 'DEF', team: 'DAL', dynasty_adp: 194.7, is_active: true },
      'def_buf': { full_name: 'Buffalo Bills', position: 'DEF', team: 'BUF', dynasty_adp: 201.3, is_active: true },
      'def_phi': { full_name: 'Philadelphia Eagles', position: 'DEF', team: 'PHI', dynasty_adp: 208.9, is_active: true }
    };
    
    // Step 3: Update each player with real data or mark as inactive
    let updatedReal = 0;
    let markedInactive = 0;
    let errors = 0;
    
    for (const player of allPlayers) {
      try {
        const realData = realPlayerData[player.player_id];
        
        if (realData) {
          // Update with real NFL player data
          const { error: updateError } = await supabase
            .from('players')
            .update(realData)
            .eq('player_id', player.player_id);
          
          if (updateError) {
            console.log(`❌ Error updating ${player.player_id}:`, updateError);
            errors++;
          } else {
            console.log(`✅ Updated ${player.player_id} -> ${realData.full_name}`);
            updatedReal++;
          }
        } else {
          // Mark fake players as inactive so they don't appear in drafts
          const { error: deactivateError } = await supabase
            .from('players')
            .update({ is_active: false, dynasty_adp: 999 })
            .eq('player_id', player.player_id);
          
          if (deactivateError) {
            console.log(`❌ Error deactivating ${player.player_id}:`, deactivateError);
            errors++;
          } else {
            markedInactive++;
          }
        }
        
        // Small delay to avoid rate limiting
        if ((updatedReal + markedInactive) % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.log(`❌ Unexpected error with ${player.player_id}:`, error);
        errors++;
      }
    }
    
    console.log('\n🎉 REAL PLAYER OVERWRITE COMPLETE!');
    console.log(`✅ Updated with real data: ${updatedReal} players`);
    console.log(`🚫 Marked inactive (fake): ${markedInactive} players`);
    console.log(`❌ Errors: ${errors}`);
    
    // Step 4: Show only real active players
    console.log('\n🏆 VERIFYING REAL PLAYERS ONLY...');
    const { data: realPlayers, error: verifyError } = await supabase
      .from('players')
      .select('full_name, position, team, dynasty_adp')
      .eq('is_active', true)
      .not('dynasty_adp', 'is', null)
      .order('dynasty_adp', { ascending: true })
      .limit(15);
    
    if (!verifyError && realPlayers) {
      console.log('\n🏆 TOP 15 REAL NFL PLAYERS AVAILABLE FOR DRAFT:');
      realPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
      });
    }
    
    // Get count of active vs inactive
    const { count: activeCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: inactiveCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);
    
    console.log(`\n📊 ACTIVE REAL PLAYERS: ${activeCount}`);
    console.log(`🚫 INACTIVE FAKE PLAYERS: ${inactiveCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

overwriteFakeWithReal();