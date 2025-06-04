import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// NFL Teams
const NFL_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 
  'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 
  'LV', 'LAC', 'LAR', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 
  'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WSH'
];

// First names and last names for generating player names
const FIRST_NAMES = [
  'Michael', 'Christopher', 'Matthew', 'Joshua', 'David', 'James', 'Daniel', 'Robert', 
  'John', 'Joseph', 'William', 'Richard', 'Thomas', 'Mark', 'Charles', 'Steven',
  'Brian', 'Kevin', 'Jason', 'Ronald', 'Edward', 'Anthony', 'Paul', 'Larry', 
  'Jeffrey', 'Gary', 'Timothy', 'Ryan', 'Nicholas', 'Eric', 'Marcus', 'Jalen',
  'DeAndre', 'DeShaun', 'JaMarcus', 'Tyreek', 'Lamar', 'Trevon', 'D\'Wayne', 'Kyler',
  'Tua', 'Jared', 'Zach', 'Dak', 'Carson', 'Justin', 'Trey', 'Mac', 'Jayden', 'Trevor',
  'Antonio', 'Julio', 'Ezekiel', 'Derrick', 'Dalvin', 'Saquon', 'Alvin', 'Christian',
  'Travis', 'Davante', 'DeVonta', 'Ja\'Marr', 'Jaylen', 'CeeDee', 'DK', 'Stefon'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia',
  'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker',
  'Allen', 'King', 'Wright', 'Hill', 'Scott', 'Green', 'Adams', 'Baker',
  'Mahomes', 'Brady', 'Rodgers', 'Wilson', 'Prescott', 'Watson', 'Murray', 'Jackson',
  'Barkley', 'Elliott', 'McCaffrey', 'Cook', 'Kamara', 'Henry', 'Jones', 'Jacobs',
  'Kelce', 'Kittle', 'Waller', 'Andrews', 'Pitts', 'Schultz', 'Goedert', 'Hockenson',
  'Jefferson', 'Chase', 'Lamb', 'Diggs', 'Hopkins', 'Metcalf', 'Hill', 'Adams'
];

// Generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random player name
function generatePlayerName() {
  const firstName = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
  const lastName = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
  return `${firstName} ${lastName}`;
}

// Generate a unique player ID based on name and team
function generatePlayerId(name, team) {
  // Create a player ID using name and team, ensuring it's unique
  const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const teamCode = team.toLowerCase();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${baseName}_${teamCode}_${randomSuffix}`;
}

// Generate a realistic ADP based on position and depth
function generateRealisticADP(position, depth) {
  const positionTiers = {
    'QB': [
      { min: 40, max: 80 },    // Tier 1
      { min: 100, max: 150 },  // Tier 2
      { min: 180, max: 220 }   // Tier 3
    ],
    'RB': [
      { min: 15, max: 40 },    // Tier 1
      { min: 50, max: 90 },    // Tier 2
      { min: 110, max: 160 }   // Tier 3
    ],
    'WR': [
      { min: 20, max: 50 },    // Tier 1
      { min: 60, max: 100 },   // Tier 2
      { min: 120, max: 170 }   // Tier 3
    ],
    'TE': [
      { min: 50, max: 90 },    // Tier 1
      { min: 110, max: 150 },  // Tier 2
      { min: 180, max: 220 }   // Tier 3
    ],
    'K': [
      { min: 180, max: 220 },  // All kickers
    ],
    'DEF': [
      { min: 180, max: 220 },  // All defenses
    ]
  };

  // Determine tier based on depth
  let tierIndex = 0;
  if (depth > 0 && depth <= 2) tierIndex = 1;
  else if (depth > 2) tierIndex = 2;

  // If tier doesn't exist for this position, use the first tier
  const tiers = positionTiers[position] || positionTiers['WR'];
  const tier = tiers[Math.min(tierIndex, tiers.length - 1)];

  // Generate random ADP within the tier range
  return randomInt(tier.min * 10, tier.max * 10) / 10;
}

// Generate a specific number of players for each position
async function generatePositionalPlayers() {
  // Number of additional players to create per position and team
  const playersPerTeam = {
    'QB': 3,  // 3 QBs per team
    'RB': 5,  // 5 RBs per team
    'WR': 8,  // 8 WRs per team
    'TE': 3,  // 3 TEs per team
    'K': 1,   // 1 kicker per team
    'DEF': 0  // Already have team defenses
  };

  // Get current player counts
  const { data: existingPlayers, error } = await supabase
    .from('players')
    .select('position');

  if (error) {
    console.error('Error fetching existing players:', error);
    return [];
  }

  // Count players by position
  const existingPositionCounts = {};
  existingPlayers.forEach(player => {
    existingPositionCounts[player.position] = (existingPositionCounts[player.position] || 0) + 1;
  });

  console.log('Current player counts by position:', existingPositionCounts);

  // Generate new players
  const newPlayers = [];
  
  // For each team
  for (const team of NFL_TEAMS) {
    // For each position
    for (const [position, count] of Object.entries(playersPerTeam)) {
      // Calculate how many players to add for this position
      const existingCount = existingPositionCounts[position] || 0;
      const targetCount = NFL_TEAMS.length * count;
      const toAdd = Math.max(0, Math.ceil((targetCount - existingCount) / NFL_TEAMS.length));
      
      // Generate players for this position and team
      for (let i = 0; i < toAdd; i++) {
        const name = generatePlayerName();
        const playerId = generatePlayerId(name, team);
        const adp = generateRealisticADP(position, i);
        
        newPlayers.push({
          player_id: playerId,
          full_name: name,
          position: position,
          team: team,
          dynasty_adp: adp,
          is_active: true
        });
      }
    }
  }

  console.log(`Generated ${newPlayers.length} new players`);
  return newPlayers;
}

// Add players to the database in batches
async function addPlayersToDatabase(players) {
  console.log(`🏈 ADDING ${players.length} DEPTH PLAYERS TO DATABASE...`);
  
  try {
    // Insert players in batches
    const batchSize = 25;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(players.length / batchSize);
      
      console.log(`📦 Inserting batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
      
      const { data, error } = await supabase
        .from('players')
        .insert(batch)
        .select();
      
      if (error) {
        console.log(`❌ Failed to insert batch: ${error.code} - ${error.message}`);
        failCount += batch.length;
      } else {
        console.log(`✅ Successfully inserted ${data.length} players`);
        successCount += data.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 DEPTH PLAYER ADDITION COMPLETE!');
    console.log(`✅ Successfully added: ${successCount} players`);
    console.log(`❌ Failed to add: ${failCount} players`);
    
    // Get final count and verify
    const { count: totalCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 TOTAL PLAYERS IN DATABASE: ${totalCount}`);
    
    // Position breakdown
    const { data: playersByPosition, error } = await supabase
      .from('players')
      .select('position');
      
    if (!error && playersByPosition) {
      const positionCounts = {};
      playersByPosition.forEach(p => {
        positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
      });
      
      console.log(`\n📈 POSITION BREAKDOWN:`);
      Object.entries(positionCounts).forEach(([pos, count]) => {
        console.log(`${pos}: ${count} players`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Remove duplicate players
async function removeDuplicatePlayers() {
  console.log('🧹 Checking for duplicate players...');
  
  try {
    // Get all players
    const { data: allPlayers, error } = await supabase
      .from('players')
      .select('player_id, full_name');
      
    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    
    // Find duplicates by name
    const nameCount = {};
    const duplicateIds = [];
    
    allPlayers.forEach(player => {
      nameCount[player.full_name] = (nameCount[player.full_name] || 0) + 1;
      
      // If this is a duplicate name, mark it for removal
      if (nameCount[player.full_name] > 1) {
        duplicateIds.push(player.player_id);
      }
    });
    
    // Remove duplicates if found
    if (duplicateIds.length > 0) {
      console.log(`Found ${duplicateIds.length} duplicate players. Removing...`);
      
      // Remove in batches
      const batchSize = 50;
      for (let i = 0; i < duplicateIds.length; i += batchSize) {
        const batch = duplicateIds.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('players')
          .delete()
          .in('player_id', batch);
          
        if (error) {
          console.error('Error removing duplicates:', error);
        }
      }
      
      console.log(`✅ Removed ${duplicateIds.length} duplicate players`);
    } else {
      console.log('✅ No duplicate players found');
    }
    
  } catch (error) {
    console.error('Error managing duplicates:', error);
  }
}

// Main function
async function main() {
  try {
    // First, clean up any duplicates
    await removeDuplicatePlayers();
    
    // Generate and add new players
    const newPlayers = await generatePositionalPlayers();
    if (newPlayers.length > 0) {
      await addPlayersToDatabase(newPlayers);
    } else {
      console.log('No new players needed');
    }
    
  } catch (error) {
    console.error('Script failed:', error);
  }
}

main();