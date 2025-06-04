import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPlayers() {
  console.log('🔍 Checking current players in database...');
  
  const { data, error } = await supabase
    .from('players')
    .select('player_id, full_name, position, team')
    .limit(10);
  
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Found ${data.length} players in database:`);
  data.forEach((player, index) => {
    console.log(`${index + 1}. ${player.player_id} - ${player.full_name} (${player.position}) - ${player.team}`);
  });
  
  // Get total count
  const { count, error: countError } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true });
  
  if (!countError) {
    console.log(`\n📈 Total players in database: ${count}`);
  }
}

checkPlayers();