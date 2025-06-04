import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Team colors for use in player cards and UI
const TEAM_COLORS = {
  'ARI': { primary: '#97233F', secondary: '#000000' },
  'ATL': { primary: '#A71930', secondary: '#000000' },
  'BAL': { primary: '#241773', secondary: '#000000' },
  'BUF': { primary: '#00338D', secondary: '#C60C30' },
  'CAR': { primary: '#0085CA', secondary: '#101820' },
  'CHI': { primary: '#0B162A', secondary: '#C83803' },
  'CIN': { primary: '#FB4F14', secondary: '#000000' },
  'CLE': { primary: '#311D00', secondary: '#FF3C00' },
  'DAL': { primary: '#003594', secondary: '#869397' },
  'DEN': { primary: '#FB4F14', secondary: '#002244' },
  'DET': { primary: '#0076B6', secondary: '#B0B7BC' },
  'GB': { primary: '#203731', secondary: '#FFB612' },
  'HOU': { primary: '#03202F', secondary: '#A71930' },
  'IND': { primary: '#002C5F', secondary: '#A2AAAD' },
  'JAX': { primary: '#101820', secondary: '#D7A22A' },
  'KC': { primary: '#E31837', secondary: '#FFB81C' },
  'LV': { primary: '#000000', secondary: '#A5ACAF' },
  'LAC': { primary: '#0080C6', secondary: '#FFC20E' },
  'LAR': { primary: '#003594', secondary: '#FFA300' },
  'MIA': { primary: '#008E97', secondary: '#FC4C02' },
  'MIN': { primary: '#4F2683', secondary: '#FFC62F' },
  'NE': { primary: '#002244', secondary: '#C60C30' },
  'NO': { primary: '#D3BC8D', secondary: '#101820' },
  'NYG': { primary: '#0B2265', secondary: '#A71930' },
  'NYJ': { primary: '#125740', secondary: '#000000' },
  'PHI': { primary: '#004C54', secondary: '#A5ACAF' },
  'PIT': { primary: '#FFB612', secondary: '#101820' },
  'SF': { primary: '#AA0000', secondary: '#B3995D' },
  'SEA': { primary: '#002244', secondary: '#69BE28' },
  'TB': { primary: '#D50A0A', secondary: '#FF7900' },
  'TEN': { primary: '#0C2340', secondary: '#4B92DB' },
  'WSH': { primary: '#5A1414', secondary: '#FFB612' }
};

// Generate player image URL
function generateImageUrl(playerName, teamCode) {
  // For real implementation, this would link to actual player images
  // For now, we'll generate placeholder URLs with team colors
  const safeName = encodeURIComponent(playerName.replace(/\s/g, '+'));
  const teamData = TEAM_COLORS[teamCode] || { primary: '808080', secondary: 'FFFFFF' };
  const primaryColor = teamData.primary.replace('#', '');
  const secondaryColor = teamData.secondary.replace('#', '');
  
  // Use a placeholder service
  return `https://via.placeholder.com/200x200/${primaryColor}/${secondaryColor}?text=${safeName}`;
}

// Add basic metadata to players
async function addBasicMetadata() {
  console.log('🔍 Fetching players from database...');
  
  try {
    // Get all players
    const { data: players, error } = await supabase
      .from('players')
      .select('player_id, full_name, team');
    
    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    
    console.log(`📊 Found ${players.length} players to update with image URLs`);
    
    // Process in batches
    const batchSize = 20;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(players.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
      
      // Create update data with image URLs for each player
      const updates = batch.map(player => ({
        player_id: player.player_id,
        image_url: generateImageUrl(player.full_name, player.team)
      }));
      
      // Update players with image URLs
      const { data: updateResult, error: updateError } = await supabase
        .from('players')
        .upsert(updates, { 
          returning: 'minimal',
          onConflict: 'player_id' 
        });
      
      if (updateError) {
        console.error(`❌ Failed to update batch: ${updateError.message}`);
        failCount += batch.length;
      } else {
        console.log(`✅ Successfully updated ${batch.length} players with image URLs`);
        successCount += batch.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 PLAYER IMAGE URL UPDATE COMPLETE!');
    console.log(`✅ Successfully updated: ${successCount} players`);
    console.log(`❌ Failed to update: ${failCount} players`);
    
  } catch (error) {
    console.error('❌ Error updating player image URLs:', error);
  }
}

// Main function
async function main() {
  try {
    // First check if image_url column exists
    console.log('🔍 Checking if image_url column exists...');
    const { data, error } = await supabase
      .from('players')
      .select('image_url')
      .limit(1);
      
    if (error && error.message.includes('column "image_url" does not exist')) {
      console.log('\n❌ The image_url column does not exist in the players table.');
      console.log('Please run the add_player_metadata_columns.sql script first.');
      console.log('You can run it in the Supabase SQL Editor manually.');
      return;
    }
    
    await addBasicMetadata();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();