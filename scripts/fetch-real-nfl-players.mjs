// Script to fetch real NFL players from ESPN API
const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

// ESPN API endpoints
const ESPN_TEAMS_API = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";

// Dynasty ADP ranges by position for realistic fantasy values
const adpRanges = {
  'QB': { tier1: [15, 60], tier2: [60, 120], tier3: [200, 300] },
  'RB': { tier1: [8, 40], tier2: [40, 100], tier3: [150, 250] },
  'WR': { tier1: [10, 50], tier2: [50, 120], tier3: [120, 200] },
  'TE': { tier1: [40, 80], tier2: [80, 140], tier3: [180, 250] },
  'K': { tier1: [180, 220], tier2: [220, 260], tier3: [260, 300] },
  'DEF': { tier1: [175, 200], tier2: [200, 225], tier3: [225, 250] },
  'default': { tier1: [250, 300], tier2: [300, 350], tier3: [350, 400] }
};

function generateRealisticADP(position, depthIndex = 0) {
  const ranges = adpRanges[position] || adpRanges.default;
  let tier;
  
  if (depthIndex === 0) tier = 'tier1';      // Starters
  else if (depthIndex === 1) tier = 'tier2'; // Backups  
  else tier = 'tier3';                       // Deep bench
  
  const range = ranges[tier];
  return Math.random() * (range[1] - range[0]) + range[0];
}

function normalizePosition(espnPosition) {
  const positionMap = {
    'QB': 'QB',
    'RB': 'RB', 
    'WR': 'WR',
    'TE': 'TE',
    'K': 'K',
    'C': 'OL',
    'G': 'OL', 
    'T': 'OL',
    'OG': 'OL',
    'OT': 'OL',
    'DE': 'DL',
    'DT': 'DL',
    'NT': 'DL',
    'LB': 'LB',
    'ILB': 'LB',
    'OLB': 'LB',
    'MLB': 'LB',
    'CB': 'CB',
    'S': 'S',
    'SS': 'S',
    'FS': 'S',
    'P': 'P',
    'LS': 'LS',
    'FB': 'RB' // Fullback as RB
  };
  
  return positionMap[espnPosition] || espnPosition;
}

async function fetchESPNTeams() {
  try {
    console.log('🏈 Fetching NFL teams from ESPN API...');
    const response = await fetch(ESPN_TEAMS_API);
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }
    
    const data = await response.json();
    const teams = data.sports[0].leagues[0].teams;
    
    console.log(`✅ Found ${teams.length} NFL teams`);
    return teams;
  } catch (error) {
    console.error('❌ Error fetching teams:', error);
    return [];
  }
}

async function fetchTeamRoster(teamId, teamAbbrev) {
  try {
    const rosterUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`;
    console.log(`   Fetching roster for ${teamAbbrev}...`);
    
    const response = await fetch(rosterUrl);
    
    if (!response.ok) {
      console.log(`   ⚠️  Failed to fetch ${teamAbbrev} roster: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const athletes = data.athletes || [];
    
    const players = [];
    let positionCounts = {};
    
    athletes.forEach(athlete => {
      const player = athlete.items ? athlete.items[0] : athlete;
      
      if (!player || !player.displayName) return;
      
      const position = normalizePosition(player.position?.abbreviation || 'UNKNOWN');
      positionCounts[position] = (positionCounts[position] || 0) + 1;
      const depthIndex = positionCounts[position] - 1;
      
      // Create player ID from name and team
      const playerId = `${player.displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${teamAbbrev.toLowerCase()}`;
      
      players.push({
        player_id: playerId,
        full_name: player.displayName,
        position: position,
        team: teamAbbrev,
        dynasty_adp: generateRealisticADP(position, depthIndex),
        is_active: true,
        jersey_number: player.jersey || null,
        height: player.height || null,
        weight: player.weight || null,
        birth_date: player.dateOfBirth || null
      });
    });
    
    console.log(`   ✅ ${teamAbbrev}: ${players.length} players`);
    return players;
    
  } catch (error) {
    console.error(`   ❌ Error fetching ${teamAbbrev} roster:`, error.message);
    return [];
  }
}

async function fetchAllNFLPlayers() {
  console.log('🚀 Starting to fetch real NFL players from ESPN...');
  
  const teams = await fetchESPNTeams();
  if (teams.length === 0) {
    console.log('❌ No teams found, stopping...');
    return [];
  }
  
  const allPlayers = [];
  
  for (const teamData of teams) {
    const team = teamData.team;
    const teamId = team.id;
    const teamAbbrev = team.abbreviation;
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roster = await fetchTeamRoster(teamId, teamAbbrev);
    allPlayers.push(...roster);
    
    // Add team defense
    allPlayers.push({
      player_id: `def_${teamAbbrev.toLowerCase()}`,
      full_name: `${team.displayName} Defense`,
      position: 'DEF',
      team: teamAbbrev,
      dynasty_adp: generateRealisticADP('DEF', 0),
      is_active: true
    });
  }
  
  console.log(`\n📊 Total players fetched: ${allPlayers.length}`);
  
  // Show position breakdown
  const positionCounts = {};
  allPlayers.forEach(p => {
    positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
  });
  console.log('Position breakdown:', positionCounts);
  
  return allPlayers;
}

async function insertPlayersToSupabase(players) {
  console.log(`\n💾 Inserting ${players.length} real NFL players to database...`);
  
  try {
    // Clear existing fake players first
    console.log('🧹 Clearing existing fake players...');
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/players`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Cleared existing players');
    } else {
      console.log('⚠️  Could not clear existing players, continuing...');
    }
    
    // Insert real players in batches
    const batchSize = 25; // Smaller batches for ESPN data
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(players.length/batchSize)} (${batch.length} players)...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/players`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(batch)
      });
      
      if (response.ok) {
        successful += batch.length;
        console.log(`✅ Successfully inserted ${batch.length} players`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed to insert batch: ${response.status} - ${errorText.substring(0, 200)}`);
        failed += batch.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n🎉 Real NFL player insertion complete!`);
    console.log(`✅ Successfully inserted: ${successful} players`);
    console.log(`❌ Failed to insert: ${failed} players`);
    
  } catch (error) {
    console.error('💥 Error inserting players:', error);
  }
}

async function main() {
  try {
    const players = await fetchAllNFLPlayers();
    
    if (players.length > 0) {
      await insertPlayersToSupabase(players);
      
      // Show some sample players
      console.log('\n🔍 Sample players:');
      players.slice(0, 10).forEach(p => {
        console.log(`  ${p.full_name} (${p.position}) - ${p.team} - ADP: ${Math.round(p.dynasty_adp)}`);
      });
    } else {
      console.log('❌ No players found to insert');
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

main();