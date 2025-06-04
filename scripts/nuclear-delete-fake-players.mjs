import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function nuclearDeleteFakePlayers() {
  console.log('☢️  NUCLEAR DELETE: REMOVING ALL FAKE PLAYERS...');
  
  try {
    // Step 1: DELETE all players with ADP 999 (fake players)
    console.log('💣 Deleting all players with ADP 999 (fake players)...');
    
    let totalDeleted = 0;
    let batchCount = 0;
    
    while (true) {
      batchCount++;
      console.log(`🗑️  Deletion batch ${batchCount}...`);
      
      // Delete players with ADP 999 in batches
      const { count, error } = await supabase
        .from('players')
        .delete({ count: 'exact' })
        .eq('dynasty_adp', 999);
      
      if (error) {
        console.log('❌ Delete error:', error);
        break;
      }
      
      if (count === 0) {
        console.log('✅ No more fake players to delete');
        break;
      }
      
      totalDeleted += count;
      console.log(`✅ Deleted ${count} fake players (total: ${totalDeleted})`);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Safety limit
      if (batchCount > 50) {
        console.log('⚠️  Reached batch limit, stopping');
        break;
      }
    }
    
    console.log(`💀 Total fake players deleted: ${totalDeleted}`);
    
    // Step 2: Verify only real players remain
    const { data: remainingPlayers, error: verifyError } = await supabase
      .from('players')
      .select('full_name, position, team, dynasty_adp')
      .order('dynasty_adp', { ascending: true });
    
    const { count: finalCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`✅ Remaining players: ${finalCount}`);
    console.log(`💀 Deleted fake players: ${totalDeleted}`);
    
    if (!verifyError && remainingPlayers) {
      console.log(`\n🏆 ALL ${remainingPlayers.length} REMAINING PLAYERS:`);
      remainingPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
      });
      
      // Check if any fake names remain
      const fakeNamesFound = remainingPlayers.filter(p => 
        p.dynasty_adp === 999 || 
        p.full_name.includes('Stefon Godwin') ||
        p.full_name.includes('Austin Carter') ||
        p.full_name.includes('Derrick Hurts') ||
        p.full_name.includes('Najee Mixon')
      );
      
      if (fakeNamesFound.length === 0) {
        console.log('\n🎉 SUCCESS: ALL FAKE PLAYERS ELIMINATED!');
        console.log('✅ Only real NFL players remain in the database!');
      } else {
        console.log(`\n⚠️  WARNING: ${fakeNamesFound.length} fake players still found`);
        fakeNamesFound.forEach(fake => {
          console.log(`❌ Fake player still present: ${fake.full_name}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

nuclearDeleteFakePlayers();