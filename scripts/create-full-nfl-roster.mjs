// Script to populate complete NFL rosters with all ~1700 players
const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

// NFL teams array
const nflTeams = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
  'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
  'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WSH'
];

// Position distributions per team (approximate)
const positionDistribution = {
  'QB': 3,    // 3 QBs per team
  'RB': 4,    // 4 RBs per team  
  'WR': 6,    // 6 WRs per team
  'TE': 3,    // 3 TEs per team
  'OL': 8,    // 8 Offensive linemen (C, G, T)
  'DL': 6,    // 6 Defensive linemen (DE, DT, NT)
  'LB': 6,    // 6 Linebackers
  'CB': 5,    // 5 Cornerbacks
  'S': 4,     // 4 Safeties
  'K': 1,     // 1 Kicker
  'P': 1,     // 1 Punter
  'LS': 1,    // 1 Long snapper
  'DEF': 1    // 1 Defense/ST unit
};

// Dynasty ADP ranges by position (for realistic fantasy values)
const adpRanges = {
  'QB': { elite: [15, 60], starter: [60, 120], backup: [200, 300] },
  'RB': { elite: [8, 40], starter: [40, 100], backup: [150, 250] },
  'WR': { elite: [10, 50], starter: [50, 120], backup: [120, 200] },
  'TE': { elite: [40, 80], starter: [80, 140], backup: [180, 250] },
  'K': { all: [180, 220] },
  'DEF': { all: [175, 200] },
  'default': { all: [250, 400] } // For non-fantasy relevant positions
};

// Generate realistic player names
const firstNames = [
  'Aaron', 'Alvin', 'Antonio', 'Baker', 'Brandon', 'Caleb', 'Calvin', 'Cameron',
  'Christian', 'Cooper', 'Dak', 'Daniel', 'Davante', 'DK', 'Drake', 'Ezekiel',
  'George', 'Garrett', 'Jalen', 'Jamar', 'Joe', 'Jonathan', 'Josh', 'Justin',
  'Kyler', 'Lamar', 'Mac', 'Malik', 'Michael', 'Mike', 'Nick', 'Patrick',
  'Russell', 'Ryan', 'Saquon', 'Stefon', 'Tom', 'Travis', 'Trevor', 'Tua',
  'Tyler', 'Tyreek', 'Von', 'Zach', 'DeAndre', 'Derrick', 'Devonta', 'Diontae',
  'James', 'Jerry', 'Keenan', 'Kenny', 'Marquise', 'Najee', 'Odell', 'Robert',
  'Terry', 'Tee', 'CeeDee', 'AJ', 'Breece', 'Kenneth', 'Isaiah', 'Jaylen',
  'Chris', 'Courtland', 'Dalvin', 'Austin', 'Amari', 'Allen', 'Amon-Ra'
];

const lastNames = [
  'Adams', 'Allen', 'Andrews', 'Barkley', 'Brown', 'Burrow', 'Chase', 'Chubb',
  'Cook', 'Cooper', 'Diggs', 'Elliott', 'Evans', 'Henry', 'Herbert', 'Hill',
  'Hopkins', 'Hurts', 'Jackson', 'Jefferson', 'Jones', 'Kamara', 'Kelce',
  'Kupp', 'Lamb', 'Lawrence', 'Mahomes', 'McCaffrey', 'Metcalf', 'Murray',
  'Prescott', 'Robinson', 'Rodgers', 'Samuel', 'Smith', 'Swift', 'Taylor',
  'Thomas', 'Waddle', 'Watson', 'Wilson', 'Mixon', 'Jacobs', 'Hall', 'Walker',
  'London', 'Olave', 'Williams', 'Pittman', 'McLaurin', 'Godwin', 'Moore',
  'Higgins', 'Sutton', 'Johnson', 'Robinson', 'Davis', 'Miller', 'White',
  'Green', 'Carter', 'Pierce', 'Pickens', 'Burks', 'Dotson', 'Skyy'
];

function generateADP(position, tier) {
  const ranges = adpRanges[position] || adpRanges.default;
  let range;
  
  if (ranges.elite && tier === 'elite') {
    range = ranges.elite;
  } else if (ranges.starter && tier === 'starter') {
    range = ranges.starter;
  } else if (ranges.backup && tier === 'backup') {
    range = ranges.backup;
  } else {
    range = ranges.all || ranges.default || [200, 400];
  }
  
  return Math.random() * (range[1] - range[0]) + range[0];
}

function generatePlayers() {
  const players = [];
  let playerIdCounter = 1;
  
  nflTeams.forEach(team => {
    console.log(`Generating roster for ${team}...`);
    
    // Generate players for each position
    Object.entries(positionDistribution).forEach(([position, count]) => {
      if (position === 'DEF') {
        // Special case for team defense
        players.push({
          player_id: `def_${team.toLowerCase()}`,
          full_name: `${getTeamName(team)} Defense`,
          position: 'DEF',
          team: team,
          dynasty_adp: generateADP('DEF', 'all'),
          is_active: true
        });
        return;
      }
      
      for (let i = 0; i < count; i++) {
        // Determine tier based on depth chart position
        let tier = 'backup';
        if (position === 'QB' || position === 'RB' || position === 'WR' || position === 'TE') {
          if (i === 0) tier = 'elite';
          else if (i === 1) tier = 'starter';
          else tier = 'backup';
        }
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        
        // Make sure we don't have duplicate names
        const playerId = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${team.toLowerCase()}_${playerIdCounter}`;
        playerIdCounter++;
        
        players.push({
          player_id: playerId,
          full_name: fullName,
          position: position,
          team: team,
          dynasty_adp: generateADP(position, tier),
          is_active: true
        });
      }
    });
  });
  
  console.log(`Generated ${players.length} total players across ${nflTeams.length} teams`);
  return players;
}

function getTeamName(teamCode) {
  const teamNames = {
    'ARI': 'Arizona Cardinals', 'ATL': 'Atlanta Falcons', 'BAL': 'Baltimore Ravens',
    'BUF': 'Buffalo Bills', 'CAR': 'Carolina Panthers', 'CHI': 'Chicago Bears',
    'CIN': 'Cincinnati Bengals', 'CLE': 'Cleveland Browns', 'DAL': 'Dallas Cowboys',
    'DEN': 'Denver Broncos', 'DET': 'Detroit Lions', 'GB': 'Green Bay Packers',
    'HOU': 'Houston Texans', 'IND': 'Indianapolis Colts', 'JAX': 'Jacksonville Jaguars',
    'KC': 'Kansas City Chiefs', 'LV': 'Las Vegas Raiders', 'LAC': 'Los Angeles Chargers',
    'LAR': 'Los Angeles Rams', 'MIA': 'Miami Dolphins', 'MIN': 'Minnesota Vikings',
    'NE': 'New England Patriots', 'NO': 'New Orleans Saints', 'NYG': 'New York Giants',
    'NYJ': 'New York Jets', 'PHI': 'Philadelphia Eagles', 'PIT': 'Pittsburgh Steelers',
    'SF': 'San Francisco 49ers', 'SEA': 'Seattle Seahawks', 'TB': 'Tampa Bay Buccaneers',
    'TEN': 'Tennessee Titans', 'WSH': 'Washington Commanders'
  };
  return teamNames[teamCode] || teamCode;
}

async function populateFullRosters() {
  console.log('🏈 Generating complete NFL rosters...');
  
  const players = generatePlayers();
  
  console.log(`📊 Player breakdown:`);
  const positionCounts = {};
  players.forEach(p => {
    positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
  });
  console.log(positionCounts);
  
  try {
    // Insert players in batches
    const batchSize = 50;
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
      
      // Delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 Full roster population complete!`);
    console.log(`✅ Successfully inserted: ${successful} players`);
    console.log(`❌ Failed to insert: ${failed} players`);
    console.log(`📊 Total players per team: ~${Math.floor(successful / nflTeams.length)}`);
    
  } catch (error) {
    console.error('💥 Error populating full rosters:', error);
  }
}

populateFullRosters();