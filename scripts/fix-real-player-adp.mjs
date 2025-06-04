import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Real NFL players with correct dynasty ADP values
const REAL_PLAYER_ADP = {
  'Patrick Mahomes': 15.5,
  'Josh Allen': 18.2,
  'Joe Burrow': 23.7,
  'Lamar Jackson': 31.2,
  'Justin Herbert': 29.3,
  'Trevor Lawrence': 62.8,
  'Kyler Murray': 88.4,
  'Deshaun Watson': 108.2,
  'Dak Prescott': 89.7,
  
  'Christian McCaffrey': 8.3,
  'Jonathan Taylor': 12.7,
  'Derrick Henry': 35.2,
  'Austin Ekeler': 42.1,
  'Nick Chubb': 28.9,
  'Joe Mixon': 45.7,
  'Josh Jacobs': 52.3,
  'Saquon Barkley': 18.6,
  
  'Justin Jefferson': 5.4,
  "Ja'Marr Chase": 7.9,
  'CeeDee Lamb': 11.2,
  'Tyreek Hill': 22.4,
  'Davante Adams': 24.8,
  'Stefon Diggs': 26.9,
  'DeAndre Hopkins': 81.3,
  'A.J. Brown': 16.3,
  'Mike Evans': 32.1,
  'Cooper Kupp': 34.7,
  'Jaylen Waddle': 56.8,
  'DeVonta Smith': 54.2,
  'Tee Higgins': 51.3,
  'DK Metcalf': 41.2,
  'Terry McLaurin': 72.4,
  'Chris Godwin': 77.2,
  'Michael Pittman Jr.': 69.8,
  'Garrett Wilson': 46.1,
  'Chris Olave': 49.7,
  'Drake London': 43.8,
  
  'Travis Kelce': 39.7,
  'Mark Andrews': 59.3,
  'George Kittle': 82.7,
  'Kyle Pitts': 61.8,
  'Darren Waller': 97.3,
  'Dallas Goedert': 94.1,
  'T.J. Hockenson': 78.2,
  'Zach Ertz': 112.5,
  
  'Justin Tucker': 205.2,
  'Evan McPherson': 215.2,
  'Tyler Bass': 215.7,
  'Harrison Butker': 234.8,
  
  'San Francisco 49ers': 187.2,
  'Dallas Cowboys': 194.7,
  'Buffalo Bills': 201.3
};

async function fixRealPlayerADP() {
  console.log('🔧 FIXING REAL PLAYER ADP VALUES...');
  
  let updated = 0;
  let errors = 0;
  
  for (const [playerName, correctADP] of Object.entries(REAL_PLAYER_ADP)) {
    try {
      const { error: updateError } = await supabase
        .from('players')
        .update({ dynasty_adp: correctADP })
        .eq('full_name', playerName)
        .eq('is_active', true);
      
      if (updateError) {
        console.log(`❌ Error updating ${playerName}:`, updateError);
        errors++;
      } else {
        console.log(`✅ Fixed ${playerName} -> ADP: ${correctADP}`);
        updated++;
      }
    } catch (error) {
      console.log(`❌ Unexpected error with ${playerName}:`, error);
      errors++;
    }
  }
  
  console.log('\n🎉 ADP FIX COMPLETE!');
  console.log(`✅ Updated ADP values: ${updated} players`);
  console.log(`❌ Errors: ${errors}`);
  
  // Verify the top players
  const { data: topPlayers, error: verifyError } = await supabase
    .from('players')
    .select('full_name, position, team, dynasty_adp')
    .eq('is_active', true)
    .order('dynasty_adp', { ascending: true })
    .limit(15);
  
  if (!verifyError && topPlayers) {
    console.log('\n🏆 TOP 15 REAL NFL PLAYERS WITH CORRECT ADP:');
    topPlayers.forEach((player, index) => {
      console.log(`${index + 1}. ${player.full_name} (${player.position}) - ${player.team} - ADP: ${player.dynasty_adp}`);
    });
  }
}

fixRealPlayerADP();