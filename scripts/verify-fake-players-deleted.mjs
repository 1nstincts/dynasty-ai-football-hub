import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyFakePlayersDeleted() {
  console.log('🔍 VERIFYING FAKE PLAYERS DELETION...');
  
  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total players in database: ${totalCount}`);
    
    // Get all remaining players
    const { data: allPlayers, error } = await supabase
      .from('players')
      .select('full_name, position, team, dynasty_adp')
      .order('dynasty_adp', { ascending: true });
    
    if (error) {
      console.log('❌ Error fetching players:', error);
      return;
    }
    
    console.log(`\n🏆 ALL ${allPlayers.length} REMAINING PLAYERS:`);
    allPlayers.forEach((player, index) => {
      console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
    });
    
    // Check for any fake names that might still exist
    const suspiciousFakeNames = [
      'Austin Carter', 'Stefon Godwin', 'Derrick Hurts', 'Najee Mixon', 'Amon-Ra Miller',
      'Ryan Brown', 'Michael Evans', 'Keenan Hill', 'Caleb Pickens', 'Jonathan Hall',
      'Malik Robinson', 'Kenneth Mixon', 'Saquon Johnson', 'Dalvin Kelce'
    ];
    
    const fakePlayersFound = allPlayers.filter(player => 
      suspiciousFakeNames.some(fakeName => player.full_name.includes(fakeName)) ||
      player.dynasty_adp === 999
    );
    
    if (fakePlayersFound.length === 0) {
      console.log('\n🎉 SUCCESS! ALL FAKE PLAYERS HAVE BEEN PERMANENTLY DELETED!');
      console.log('✅ Only real NFL players remain in the database!');
      
      if (totalCount <= 60) {
        console.log(`✅ Player count looks correct: ${totalCount} players (expected ~52 real players)`);
      } else {
        console.log(`⚠️  Player count seems high: ${totalCount} players (expected ~52)`);
      }
    } else {
      console.log(`\n❌ WARNING: ${fakePlayersFound.length} suspicious fake players still found:`);
      fakePlayersFound.forEach(fake => {
        console.log(`❌ ${fake.full_name} (${fake.position}) - ${fake.team} - ADP: ${fake.dynasty_adp}`);
      });
    }
    
    // Verify the real players are there with correct ADP
    const realPlayersCheck = [
      'Justin Jefferson', 'Ja\'Marr Chase', 'Christian McCaffrey', 'CeeDee Lamb', 
      'Jonathan Taylor', 'Patrick Mahomes', 'A.J. Brown', 'Josh Allen'
    ];
    
    console.log('\n🔍 Checking key real players are present:');
    for (const realPlayer of realPlayersCheck) {
      const found = allPlayers.find(p => p.full_name === realPlayer);
      if (found) {
        console.log(`✅ ${realPlayer} - ADP: ${found.dynasty_adp}`);
      } else {
        console.log(`❌ MISSING: ${realPlayer}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyFakePlayersDeleted();