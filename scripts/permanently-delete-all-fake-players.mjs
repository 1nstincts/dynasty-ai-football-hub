import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// List of ONLY real NFL player names - everything else gets DELETED
const REAL_NFL_PLAYERS = [
  'Patrick Mahomes', 'Josh Allen', 'Joe Burrow', 'Lamar Jackson', 'Justin Herbert',
  'Trevor Lawrence', 'Kyler Murray', 'Deshaun Watson', 'Dak Prescott',
  'Christian McCaffrey', 'Jonathan Taylor', 'Derrick Henry', 'Austin Ekeler',
  'Nick Chubb', 'Joe Mixon', 'Josh Jacobs', 'Saquon Barkley',
  'Justin Jefferson', "Ja'Marr Chase", 'CeeDee Lamb', 'Tyreek Hill', 'Davante Adams',
  'Stefon Diggs', 'DeAndre Hopkins', 'A.J. Brown', 'Mike Evans', 'Cooper Kupp',
  'Jaylen Waddle', 'DeVonta Smith', 'Tee Higgins', 'DK Metcalf', 'Terry McLaurin',
  'Chris Godwin', 'Michael Pittman Jr.', 'Garrett Wilson', 'Chris Olave', 'Drake London',
  'Travis Kelce', 'Mark Andrews', 'George Kittle', 'Kyle Pitts', 'Darren Waller',
  'Dallas Goedert', 'T.J. Hockenson', 'Zach Ertz',
  'Justin Tucker', 'Evan McPherson', 'Tyler Bass', 'Harrison Butker',
  'San Francisco 49ers', 'Dallas Cowboys', 'Buffalo Bills'
];

async function permanentlyDeleteAllFakePlayers() {
  console.log('💀 PERMANENTLY DELETING ALL FAKE PLAYERS FROM DATABASE...');
  console.log('⚠️  WARNING: This will completely remove fake players - they cannot be recovered!');
  
  try {
    // Step 1: Get count before deletion
    const { count: beforeCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total players before deletion: ${beforeCount}`);
    
    // Step 2: Get all real players to keep
    const realPlayersToKeep = [];
    
    for (const realPlayerName of REAL_NFL_PLAYERS) {
      const { data: foundPlayers, error: searchError } = await supabase
        .from('players')
        .select('player_id, full_name')
        .ilike('full_name', realPlayerName);
      
      if (!searchError && foundPlayers && foundPlayers.length > 0) {
        realPlayersToKeep.push(foundPlayers[0].player_id);
        console.log(`✅ Will keep: ${foundPlayers[0].full_name}`);
      }
    }
    
    console.log(`\n🛡️  Found ${realPlayersToKeep.length} real players to keep`);
    
    // Step 3: DELETE all players EXCEPT the real ones
    console.log('\n💀 DELETING ALL FAKE PLAYERS PERMANENTLY...');
    
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .not('player_id', 'in', `(${realPlayersToKeep.map(id => `"${id}"`).join(',')})`);
    
    if (deleteError) {
      console.log('❌ Error deleting fake players:', deleteError);
      return;
    }
    
    console.log('✅ ALL FAKE PLAYERS PERMANENTLY DELETED!');
    
    // Step 4: Verify only real players remain
    const { count: afterCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    const { data: remainingPlayers, error: verifyError } = await supabase
      .from('players')
      .select('full_name, position, team, dynasty_adp')
      .order('dynasty_adp', { ascending: true });
    
    console.log(`\n📊 DELETION RESULTS:`);
    console.log(`🗑️  Players before: ${beforeCount}`);
    console.log(`✅ Players after: ${afterCount}`);
    console.log(`💀 PERMANENTLY DELETED: ${beforeCount - afterCount} fake players`);
    
    if (!verifyError && remainingPlayers) {
      console.log(`\n🏆 ALL ${remainingPlayers.length} REMAINING PLAYERS (REAL NFL ONLY):`);
      remainingPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
      });
    }
    
    if (afterCount <= 60) {
      console.log('\n🎉 SUCCESS: Only real NFL players remain in the database!');
      console.log('💀 All fake players have been PERMANENTLY ELIMINATED!');
    } else {
      console.log('\n⚠️  WARNING: More players than expected remain. Manual review may be needed.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

permanentlyDeleteAllFakePlayers();