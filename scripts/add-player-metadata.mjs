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

// Player physical attributes by position for realistic player generation
const POSITION_ATTRIBUTES = {
  'QB': { 
    height: { min: 73, max: 78 }, // 6'1" - 6'6"
    weight: { min: 210, max: 245 },
    age: { min: 22, max: 38 },
    experience: { min: 0, max: 16 }
  },
  'RB': { 
    height: { min: 68, max: 74 }, // 5'8" - 6'2"
    weight: { min: 190, max: 235 },
    age: { min: 21, max: 32 },
    experience: { min: 0, max: 10 }
  },
  'WR': { 
    height: { min: 69, max: 77 }, // 5'9" - 6'5"
    weight: { min: 175, max: 225 },
    age: { min: 21, max: 34 },
    experience: { min: 0, max: 12 }
  },
  'TE': { 
    height: { min: 74, max: 80 }, // 6'2" - 6'8"
    weight: { min: 240, max: 270 },
    age: { min: 22, max: 34 },
    experience: { min: 0, max: 12 }
  },
  'K': { 
    height: { min: 70, max: 76 }, // 5'10" - 6'4"
    weight: { min: 180, max: 210 },
    age: { min: 22, max: 42 },
    experience: { min: 0, max: 20 }
  },
  'DEF': { // Team defense has no physical attributes
    height: null,
    weight: null,
    age: null,
    experience: null
  }
};

// College football programs for player backgrounds
const COLLEGES = [
  'Alabama', 'Ohio State', 'Georgia', 'Clemson', 'Oklahoma', 'LSU', 'Michigan', 
  'Penn State', 'Notre Dame', 'Florida', 'Texas', 'USC', 'Oregon', 'Wisconsin', 
  'Miami', 'Auburn', 'Texas A&M', 'Florida State', 'Michigan State', 'Washington',
  'Iowa', 'Stanford', 'Ole Miss', 'TCU', 'Baylor', 'Pittsburgh', 'UCLA', 
  'North Carolina', 'Virginia Tech', 'Louisville', 'West Virginia', 'Arizona State',
  'Nebraska', 'Missouri', 'Tennessee', 'Arkansas', 'Kentucky', 'Mississippi State',
  'Georgia Tech', 'Boston College', 'California', 'Washington State', 'Maryland',
  'Rutgers', 'Illinois', 'Purdue', 'Northwestern', 'Colorado', 'Duke', 'NC State',
  'BYU', 'Cincinnati', 'UCF', 'Houston', 'South Carolina', 'Memphis', 'Tulane',
  'Boise State', 'Appalachian State', 'Coastal Carolina', 'Liberty', 'Army', 'Navy'
];

// Random jersey numbers by position
function getRandomJerseyNumber(position) {
  switch (position) {
    case 'QB':
      return randomInt(1, 19);
    case 'RB':
      return randomInt(20, 49);
    case 'WR':
      return randomInt(10, 19) || randomInt(80, 89);
    case 'TE':
      return randomInt(80, 89);
    case 'K':
      return randomInt(1, 19);
    case 'DEF':
      return null; // No jersey number for defenses
    default:
      return randomInt(1, 99);
  }
}

// Generate random value in range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random date of birth
function randomBirthDate(minAge, maxAge) {
  const today = new Date();
  const yearMin = today.getFullYear() - maxAge;
  const yearMax = today.getFullYear() - minAge;
  
  const year = randomInt(yearMin, yearMax);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28); // Simplify by using max 28 for all months
  
  return new Date(year, month - 1, day).toISOString().split('T')[0];
}

// Generate player profile image URL
function generateImageUrl(playerName, teamCode) {
  // For real implementation, this would link to actual player images
  // For now, we'll generate placeholder URLs
  const safeName = playerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Use an actual placeholder service
  return `https://via.placeholder.com/200x200/808080/FFFFFF?text=${safeName}`;
  
  // In a real implementation, you might use:
  // return `https://your-cdn.com/player-images/${teamCode.toLowerCase()}/${safeName}.png`;
}

// Generate player metadata
function generatePlayerMetadata(player) {
  const attributes = POSITION_ATTRIBUTES[player.position] || POSITION_ATTRIBUTES['WR'];
  const teamData = TEAM_COLORS[player.team] || { primary: '#000000', secondary: '#FFFFFF' };
  
  // Skip team defenses for some attributes
  if (player.position === 'DEF') {
    return {
      team_colors: teamData,
      image_url: `https://via.placeholder.com/200x200/${teamData.primary.replace('#', '')}/${teamData.secondary.replace('#', '')}?text=${player.team}`,
    };
  }
  
  // Generate metadata for individual players
  const height = attributes.height ? randomInt(attributes.height.min, attributes.height.max) : null;
  const weight = attributes.weight ? randomInt(attributes.weight.min, attributes.weight.max) : null;
  const experience = attributes.experience ? randomInt(attributes.experience.min, attributes.experience.max) : null;
  
  return {
    height: height, // in inches
    weight: weight, // in pounds
    birth_date: attributes.age ? randomBirthDate(attributes.age.min, attributes.age.max) : null,
    college: COLLEGES[randomInt(0, COLLEGES.length - 1)],
    jersey_number: getRandomJerseyNumber(player.position),
    experience: experience, // years in the league
    team_colors: teamData,
    image_url: generateImageUrl(player.full_name, player.team),
    // Fantasy-specific stats
    fantasy_position_rank: randomInt(1, 100),
    last_season_points: player.position === 'DEF' ? randomInt(70, 170) : 
                        player.position === 'K' ? randomInt(80, 140) : 
                        randomInt(50, 350),
    bye_week: randomInt(4, 14)
  };
}

// Add metadata to players in the database
async function addPlayerMetadata() {
  console.log('🔍 Fetching players from database...');
  
  try {
    // Get all players without sorting to reduce database load
    const { data: players, error } = await supabase
      .from('players')
      .select('player_id, full_name, position, team, dynasty_adp');
    
    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    
    console.log(`📊 Found ${players.length} players to update with metadata`);
    
    // Process in batches
    const batchSize = 20;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(players.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
      
      // Create update data with metadata for each player
      const updates = [];
      
      for (const player of batch) {
        const metadata = generatePlayerMetadata(player);
        
        updates.push({
          player_id: player.player_id,
          height: metadata.height,
          weight: metadata.weight,
          birth_date: metadata.birth_date,
          college: metadata.college,
          jersey_number: metadata.jersey_number,
          experience: metadata.experience,
          team_primary_color: metadata.team_colors.primary,
          team_secondary_color: metadata.team_colors.secondary,
          image_url: metadata.image_url,
          fantasy_position_rank: metadata.fantasy_position_rank,
          last_season_points: metadata.last_season_points,
          bye_week: metadata.bye_week
        });
      }
      
      // Update players with metadata
      const { error: updateError } = await supabase
        .from('players')
        .upsert(updates);
      
      if (updateError) {
        console.error(`❌ Failed to update batch: ${updateError.code} - ${updateError.message}`);
        failCount += batch.length;
      } else {
        console.log(`✅ Successfully updated ${batch.length} players with metadata`);
        successCount += batch.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 PLAYER METADATA UPDATE COMPLETE!');
    console.log(`✅ Successfully updated: ${successCount} players`);
    console.log(`❌ Failed to update: ${failCount} players`);
    
  } catch (error) {
    console.error('❌ Error updating player metadata:', error);
  }
}

// Main function
async function main() {
  try {
    await addPlayerMetadata();
    
    // Display sample players with metadata
    const { data: samplePlayers, error } = await supabase
      .from('players')
      .select('*')
      .limit(5);
    
    if (!error && samplePlayers) {
      console.log('\n📝 SAMPLE PLAYERS WITH METADATA:');
      samplePlayers.forEach(player => {
        console.log(`\n${player.full_name} (${player.position} - ${player.team})`);
        console.log(`  Height: ${player.height ? Math.floor(player.height/12) + "'" + (player.height % 12) + '"' : 'N/A'}`);
        console.log(`  Weight: ${player.weight || 'N/A'} lbs`);
        console.log(`  College: ${player.college || 'N/A'}`);
        console.log(`  Experience: ${player.experience !== null ? player.experience + ' years' : 'N/A'}`);
        console.log(`  Image: ${player.image_url || 'N/A'}`);
        console.log(`  Team Colors: ${player.team_primary_color || 'N/A'} / ${player.team_secondary_color || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();