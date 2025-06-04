import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function forceDeleteAllPlayers() {
  console.log('💥 FORCING COMPLETE DELETION OF ALL PLAYERS...');
  
  try {
    // Get total count first
    const { count: beforeCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Players before deletion: ${beforeCount}`);
    
    // Method 1: Delete by batches to handle large datasets
    let deletedTotal = 0;
    let batchSize = 1000;
    
    while (true) {
      const { data: playersToDelete, error: selectError } = await supabase
        .from('players')
        .select('player_id')
        .limit(batchSize);
      
      if (selectError || !playersToDelete || playersToDelete.length === 0) {
        break;
      }
      
      console.log(`🗑️  Deleting batch of ${playersToDelete.length} players...`);
      
      const playerIds = playersToDelete.map(p => p.player_id);
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .in('player_id', playerIds);
      
      if (deleteError) {
        console.log('❌ Delete error:', deleteError);
        break;
      }
      
      deletedTotal += playersToDelete.length;
      console.log(`✅ Deleted ${deletedTotal} players so far...`);
      
      if (playersToDelete.length < batchSize) {
        break;
      }
    }
    
    // Verify deletion
    const { count: afterCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Players after deletion: ${afterCount}`);
    console.log(`🗑️  Total deleted: ${deletedTotal}`);
    
    if (afterCount === 0) {
      console.log('✅ ALL PLAYERS SUCCESSFULLY DELETED!');
    } else {
      console.log(`⚠️  ${afterCount} players still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

forceDeleteAllPlayers();