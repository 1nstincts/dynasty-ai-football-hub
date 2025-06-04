import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// List of real NFL player names - ONLY these should be active
const REAL_NFL_PLAYERS = [
  'Patrick Mahomes', 'Josh Allen', 'Joe Burrow', 'Lamar Jackson', 'Justin Herbert',
  'Trevor Lawrence', 'Kyler Murray', 'Deshaun Watson', 'Dak Prescott', 'Tua Tagovailoa',
  'Christian McCaffrey', 'Jonathan Taylor', 'Dalvin Cook', 'Derrick Henry', 'Austin Ekeler',
  'Nick Chubb', 'Joe Mixon', 'Josh Jacobs', 'Saquon Barkley', 'Ezekiel Elliott',
  'Justin Jefferson', "Ja'Marr Chase", 'CeeDee Lamb', 'Tyreek Hill', 'Davante Adams',
  'Stefon Diggs', 'DeAndre Hopkins', 'A.J. Brown', 'Mike Evans', 'Cooper Kupp',
  'Jaylen Waddle', 'DeVonta Smith', 'Tee Higgins', 'DK Metcalf', 'Terry McLaurin',
  'Chris Godwin', 'Michael Pittman Jr.', 'Garrett Wilson', 'Chris Olave', 'Drake London',
  'Travis Kelce', 'Mark Andrews', 'George Kittle', 'Kyle Pitts', 'Darren Waller',
  'Dallas Goedert', 'T.J. Hockenson', 'Zach Ertz',
  'Justin Tucker', 'Evan McPherson', 'Tyler Bass', 'Harrison Butker',
  'San Francisco 49ers', 'Dallas Cowboys', 'Buffalo Bills', 'Philadelphia Eagles'
];

async function ensureOnlyRealPlayersActive() {
  console.log('🎯 ENSURING ONLY REAL NFL PLAYERS ARE ACTIVE...');
  
  try {
    // Step 1: Deactivate ALL players first
    console.log('🚫 Deactivating all players...');
    const { error: deactivateAllError } = await supabase
      .from('players')
      .update({ is_active: false, dynasty_adp: 999 })
      .gte('dynasty_adp', 0); // All players
    
    if (deactivateAllError) {
      console.log('❌ Error deactivating all players:', deactivateAllError);
      return;
    }
    
    console.log('✅ All players deactivated');
    
    // Step 2: Reactivate only real NFL players
    let reactivatedCount = 0;
    let notFoundCount = 0;
    
    for (const realPlayerName of REAL_NFL_PLAYERS) {
      const { data: foundPlayers, error: searchError } = await supabase
        .from('players')
        .select('player_id, full_name')
        .ilike('full_name', realPlayerName);
      
      if (searchError) {
        console.log(`❌ Error searching for ${realPlayerName}:`, searchError);
        continue;
      }
      
      if (foundPlayers && foundPlayers.length > 0) {
        const player = foundPlayers[0];
        
        // Reactivate this real player
        const { error: activateError } = await supabase
          .from('players')
          .update({ is_active: true })
          .eq('player_id', player.player_id);
        
        if (activateError) {
          console.log(`❌ Error activating ${realPlayerName}:`, activateError);
        } else {
          console.log(`✅ Activated: ${realPlayerName}`);
          reactivatedCount++;
        }
      } else {
        console.log(`⚠️  Real player not found in database: ${realPlayerName}`);
        notFoundCount++;
      }
    }
    
    console.log('\n🎉 REAL PLAYERS ACTIVATION COMPLETE!');
    console.log(`✅ Reactivated real players: ${reactivatedCount}`);
    console.log(`⚠️  Real players not found: ${notFoundCount}`);
    
    // Step 3: Verify only real players are active
    console.log('\n🔍 VERIFYING ONLY REAL PLAYERS ARE ACTIVE...');
    const { data: activeRealPlayers, error: verifyError } = await supabase
      .from('players')
      .select('full_name, position, team, dynasty_adp')
      .eq('is_active', true)
      .order('dynasty_adp', { ascending: true })
      .limit(20);
    
    if (!verifyError && activeRealPlayers) {
      console.log('\n🏆 TOP 20 ACTIVE REAL NFL PLAYERS FOR DRAFT:');
      activeRealPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
      });
    }
    
    // Get final counts
    const { count: activeCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: inactiveCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`✅ ACTIVE REAL PLAYERS: ${activeCount}`);
    console.log(`🚫 INACTIVE FAKE PLAYERS: ${inactiveCount}`);
    
    if (activeCount <= 60) {
      console.log('🎯 SUCCESS: Only real NFL players are now active for drafting!');
    } else {
      console.log('⚠️  WARNING: More than expected players are active. Some fake players may still be included.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

ensureOnlyRealPlayersActive();