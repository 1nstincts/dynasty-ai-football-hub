import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Team colors data (hexadecimal color codes)
const teamColors = {
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
  'LAC': { primary: '#0080C6', secondary: '#FFC20E' },
  'LAR': { primary: '#003594', secondary: '#FFA300' },
  'LV': { primary: '#000000', secondary: '#A5ACAF' },
  'MIA': { primary: '#008E97', secondary: '#FC4C02' },
  'MIN': { primary: '#4F2683', secondary: '#FFC62F' },
  'NE': { primary: '#002244', secondary: '#C60C30' },
  'NO': { primary: '#D3BC8D', secondary: '#101820' },
  'NYG': { primary: '#0B2265', secondary: '#A71930' },
  'NYJ': { primary: '#125740', secondary: '#000000' },
  'PHI': { primary: '#004C54', secondary: '#A5ACAF' },
  'PIT': { primary: '#FFB612', secondary: '#101820' },
  'SEA': { primary: '#002244', secondary: '#69BE28' },
  'SF': { primary: '#AA0000', secondary: '#B3995D' },
  'TB': { primary: '#D50A0A', secondary: '#34302B' },
  'TEN': { primary: '#0C2340', secondary: '#4B92DB' },
  'WSH': { primary: '#773141', secondary: '#FFB612' },
  'FA': { primary: '#808080', secondary: '#404040' } // For free agents
};

// College data
const colleges = [
  'Alabama', 'Ohio State', 'Georgia', 'Clemson', 'Oklahoma', 
  'LSU', 'Michigan', 'Notre Dame', 'Penn State', 'Florida', 
  'Texas', 'USC', 'Oregon', 'Wisconsin', 'Auburn', 
  'Texas A&M', 'Iowa', 'Miami', 'Nebraska', 'Florida State',
  'Michigan State', 'Stanford', 'UCLA', 'Washington', 'TCU',
  'Ole Miss', 'Baylor', 'Mississippi State', 'North Carolina', 'Pittsburgh',
  'Tennessee', 'Arkansas', 'South Carolina', 'Virginia Tech', 'West Virginia',
  'Oklahoma State', 'Louisville', 'Arizona State', 'California', 'Purdue'
];

// Generate realistic metadata for a player based on position
function generatePlayerMetadata(player) {
  // Height in inches (based on position averages)
  const heightRanges = {
    'QB': [73, 78], // 6'1" to 6'6"
    'RB': [68, 74], // 5'8" to 6'2"
    'WR': [70, 77], // 5'10" to 6'5"
    'TE': [74, 80], // 6'2" to 6'8"
    'K': [70, 76],  // 5'10" to 6'4"
    'DEF': [null, null], // N/A for team defense
  };
  
  // Weight in pounds (based on position averages)
  const weightRanges = {
    'QB': [210, 245],
    'RB': [195, 235],
    'WR': [185, 225],
    'TE': [240, 270],
    'K': [180, 210],
    'DEF': [null, null], // N/A for team defense
  };
  
  // Position-specific jersey number ranges
  const jerseyRanges = {
    'QB': [1, 19],
    'RB': [20, 49],
    'WR': [10, 19, 80, 89], // Two ranges for WRs
    'TE': [80, 89],
    'K': [1, 9],
    'DEF': [null, null], // N/A for team defense
  };
  
  // Helper function to get random number in range
  const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Helper function to get random date in range
  const getRandomDate = (start, end) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const randomTime = startDate + Math.random() * (endDate - startDate);
    return new Date(randomTime).toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };
  
  // Helper function to get random item from array
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
  // Skip non-player entries (team defenses)
  const isTeamDefense = player.position === 'DEF';
  
  // Generate metadata
  const metadata = {
    // For human players
    height: isTeamDefense ? null : getRandomInRange(...heightRanges[player.position]),
    weight: isTeamDefense ? null : getRandomInRange(...weightRanges[player.position]),
    birth_date: isTeamDefense ? null : getRandomDate('1990-01-01', '2002-12-31'),
    college: isTeamDefense ? null : getRandomItem(colleges),
    jersey_number: isTeamDefense ? null : 
      player.position === 'WR' 
        ? (Math.random() > 0.5 ? getRandomInRange(10, 19) : getRandomInRange(80, 89))
        : getRandomInRange(...jerseyRanges[player.position]),
    experience: isTeamDefense ? null : getRandomInRange(0, 12),
    team_primary_color: teamColors[player.team]?.primary || '#000000',
    team_secondary_color: teamColors[player.team]?.secondary || '#FFFFFF',
    image_url: isTeamDefense 
      ? `https://static.www.nfl.com/league/apps/clubs/logos/${player.team}.svg`
      : `https://static.www.nfl.com/players/headshots/${player.player_id}_250x250.png`, // Placeholder URL pattern
    fantasy_position_rank: player.dynasty_adp ? Math.ceil(player.dynasty_adp / 12) : null,
    last_season_points: player.dynasty_adp 
      ? (300 - (player.dynasty_adp * (0.8 + (Math.random() * 0.4)))).toFixed(1) 
      : null,
    bye_week: getRandomInRange(4, 14),
  };
  
  return metadata;
}

async function populateMetadata() {
  try {
    console.log('🔄 Starting player metadata population...');
    
    // Fetch all players
    const { data: players, error } = await supabase
      .from('players')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching players:', error);
      return;
    }
    
    console.log(`📊 Found ${players.length} players to update`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process in batches to avoid rate limits
    const batchSize = 25;
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      
      console.log(`⏳ Processing batch ${i/batchSize + 1} of ${Math.ceil(players.length/batchSize)}...`);
      
      // Process each player in the batch
      const updates = await Promise.all(batch.map(async (player) => {
        const metadata = generatePlayerMetadata(player);
        
        // Update the player with metadata
        const { error: updateError } = await supabase
          .from('players')
          .update(metadata)
          .eq('player_id', player.player_id);
        
        if (updateError) {
          console.error(`❌ Error updating player ${player.player_id}:`, updateError);
          errorCount++;
          return false;
        }
        
        successCount++;
        return true;
      }));
      
      // Wait a bit between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Metadata population complete!`);
    console.log(`📊 Successfully updated ${successCount} players`);
    
    if (errorCount > 0) {
      console.log(`⚠️ Failed to update ${errorCount} players`);
    }
    
    // Verify a sample of players to confirm updates
    const { data: samplePlayers, error: sampleError } = await supabase
      .from('players')
      .select('*')
      .limit(3);
    
    if (!sampleError && samplePlayers.length > 0) {
      console.log('\n📝 Sample of updated players:');
      samplePlayers.forEach(player => {
        console.log(`\n${player.full_name} (${player.position}, ${player.team}):`);
        console.log(`  Height: ${player.height ? Math.floor(player.height/12) + "'" + (player.height % 12) + '"' : 'N/A'}`);
        console.log(`  Weight: ${player.weight || 'N/A'} lbs`);
        console.log(`  College: ${player.college || 'N/A'}`);
        console.log(`  Jersey: #${player.jersey_number || 'N/A'}`);
        console.log(`  Experience: ${player.experience !== null ? player.experience + ' years' : 'N/A'}`);
        console.log(`  Birth Date: ${player.birth_date || 'N/A'}`);
        console.log(`  Position Rank: ${player.fantasy_position_rank || 'N/A'}`);
        console.log(`  Last Season: ${player.last_season_points || 'N/A'} pts`);
        console.log(`  Bye Week: ${player.bye_week || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

populateMetadata();