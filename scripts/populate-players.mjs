// Script to populate NFL players with realistic dynasty ADP
const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const players = [
  // Elite QBs
  { player_id: 'mahomes_pat', full_name: 'Patrick Mahomes', position: 'QB', team: 'KC', dynasty_adp: 15.5, is_active: true },
  { player_id: 'allen_jos', full_name: 'Josh Allen', position: 'QB', team: 'BUF', dynasty_adp: 18.2, is_active: true },
  { player_id: 'burrow_joe', full_name: 'Joe Burrow', position: 'QB', team: 'CIN', dynasty_adp: 22.1, is_active: true },
  { player_id: 'jackson_lam', full_name: 'Lamar Jackson', position: 'QB', team: 'BAL', dynasty_adp: 25.8, is_active: true },
  { player_id: 'herbert_jus', full_name: 'Justin Herbert', position: 'QB', team: 'LAC', dynasty_adp: 28.3, is_active: true },
  { player_id: 'lawrence_tre', full_name: 'Trevor Lawrence', position: 'QB', team: 'JAX', dynasty_adp: 32.7, is_active: true },
  { player_id: 'murray_kyl', full_name: 'Kyler Murray', position: 'QB', team: 'ARI', dynasty_adp: 38.4, is_active: true },
  { player_id: 'watson_des', full_name: 'Deshaun Watson', position: 'QB', team: 'CLE', dynasty_adp: 45.2, is_active: true },
  { player_id: 'prescott_dak', full_name: 'Dak Prescott', position: 'QB', team: 'DAL', dynasty_adp: 52.1, is_active: true },
  { player_id: 'tua_tago', full_name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', dynasty_adp: 58.9, is_active: true },

  // Elite RBs
  { player_id: 'mccaffrey_chr', full_name: 'Christian McCaffrey', position: 'RB', team: 'SF', dynasty_adp: 8.3, is_active: true },
  { player_id: 'taylor_jon', full_name: 'Jonathan Taylor', position: 'RB', team: 'IND', dynasty_adp: 12.7, is_active: true },
  { player_id: 'cook_dal', full_name: 'Dalvin Cook', position: 'RB', team: 'FA', dynasty_adp: 35.2, is_active: true },
  { player_id: 'henry_der', full_name: 'Derrick Henry', position: 'RB', team: 'BAL', dynasty_adp: 42.1, is_active: true },
  { player_id: 'ekeler_aus', full_name: 'Austin Ekeler', position: 'RB', team: 'WSH', dynasty_adp: 38.5, is_active: true },
  { player_id: 'chubb_nic', full_name: 'Nick Chubb', position: 'RB', team: 'CLE', dynasty_adp: 28.9, is_active: true },
  { player_id: 'mixon_joe', full_name: 'Joe Mixon', position: 'RB', team: 'HOU', dynasty_adp: 45.7, is_active: true },
  { player_id: 'jacobs_jos', full_name: 'Josh Jacobs', position: 'RB', team: 'GB', dynasty_adp: 52.3, is_active: true },
  { player_id: 'saquon_bar', full_name: 'Saquon Barkley', position: 'RB', team: 'PHI', dynasty_adp: 24.6, is_active: true },
  { player_id: 'elliott_eze', full_name: 'Ezekiel Elliott', position: 'RB', team: 'DAL', dynasty_adp: 85.2, is_active: true },

  // Elite WRs
  { player_id: 'jefferson_jus', full_name: 'Justin Jefferson', position: 'WR', team: 'MIN', dynasty_adp: 5.4, is_active: true },
  { player_id: 'chase_jama', full_name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', dynasty_adp: 7.9, is_active: true },
  { player_id: 'lamb_cee', full_name: 'CeeDee Lamb', position: 'WR', team: 'DAL', dynasty_adp: 11.2, is_active: true },
  { player_id: 'hill_tyr', full_name: 'Tyreek Hill', position: 'WR', team: 'MIA', dynasty_adp: 19.7, is_active: true },
  { player_id: 'adams_dav', full_name: 'Davante Adams', position: 'WR', team: 'LV', dynasty_adp: 32.1, is_active: true },
  { player_id: 'diggs_ste', full_name: 'Stefon Diggs', position: 'WR', team: 'HOU', dynasty_adp: 28.5, is_active: true },
  { player_id: 'hopkins_dea', full_name: 'DeAndre Hopkins', position: 'WR', team: 'TEN', dynasty_adp: 65.8, is_active: true },
  { player_id: 'brown_aj', full_name: 'A.J. Brown', position: 'WR', team: 'PHI', dynasty_adp: 21.3, is_active: true },
  { player_id: 'evans_mik', full_name: 'Mike Evans', position: 'WR', team: 'TB', dynasty_adp: 45.9, is_active: true },
  { player_id: 'kupp_coo', full_name: 'Cooper Kupp', position: 'WR', team: 'LAR', dynasty_adp: 35.3, is_active: true },

  // More WRs
  { player_id: 'waddle_jay', full_name: 'Jaylen Waddle', position: 'WR', team: 'MIA', dynasty_adp: 42.7, is_active: true },
  { player_id: 'smith_dev', full_name: 'DeVonta Smith', position: 'WR', team: 'PHI', dynasty_adp: 38.9, is_active: true },
  { player_id: 'higgins_tee', full_name: 'Tee Higgins', position: 'WR', team: 'CIN', dynasty_adp: 33.4, is_active: true },
  { player_id: 'metcalf_dk', full_name: 'DK Metcalf', position: 'WR', team: 'SEA', dynasty_adp: 48.6, is_active: true },
  { player_id: 'mclaurin_ter', full_name: 'Terry McLaurin', position: 'WR', team: 'WSH', dynasty_adp: 55.2, is_active: true },
  { player_id: 'godwin_chr', full_name: 'Chris Godwin', position: 'WR', team: 'TB', dynasty_adp: 52.8, is_active: true },
  { player_id: 'pittman_mic', full_name: 'Michael Pittman Jr.', position: 'WR', team: 'IND', dynasty_adp: 58.1, is_active: true },
  { player_id: 'williams_gar', full_name: 'Garrett Wilson', position: 'WR', team: 'NYJ', dynasty_adp: 29.3, is_active: true },
  { player_id: 'olave_chr', full_name: 'Chris Olave', position: 'WR', team: 'NO', dynasty_adp: 35.7, is_active: true },
  { player_id: 'london_dra', full_name: 'Drake London', position: 'WR', team: 'ATL', dynasty_adp: 41.2, is_active: true },

  // Elite TEs
  { player_id: 'kelce_tra', full_name: 'Travis Kelce', position: 'TE', team: 'KC', dynasty_adp: 45.2, is_active: true },
  { player_id: 'andrews_mar', full_name: 'Mark Andrews', position: 'TE', team: 'BAL', dynasty_adp: 55.8, is_active: true },
  { player_id: 'kittle_geo', full_name: 'George Kittle', position: 'TE', team: 'SF', dynasty_adp: 58.3, is_active: true },
  { player_id: 'pitts_kyl', full_name: 'Kyle Pitts', position: 'TE', team: 'ATL', dynasty_adp: 38.7, is_active: true },
  { player_id: 'waller_dar', full_name: 'Darren Waller', position: 'TE', team: 'NYG', dynasty_adp: 75.6, is_active: true },
  { player_id: 'goedert_dal', full_name: 'Dallas Goedert', position: 'TE', team: 'PHI', dynasty_adp: 85.3, is_active: true },
  { player_id: 'hockenson_tj', full_name: 'T.J. Hockenson', position: 'TE', team: 'MIN', dynasty_adp: 78.9, is_active: true },
  { player_id: 'ertz_zac', full_name: 'Zach Ertz', position: 'TE', team: 'ARI', dynasty_adp: 95.2, is_active: true },

  // Kickers
  { player_id: 'tucker_jus', full_name: 'Justin Tucker', position: 'K', team: 'BAL', dynasty_adp: 180.5, is_active: true },
  { player_id: 'mcpherson_eva', full_name: 'Evan McPherson', position: 'K', team: 'CIN', dynasty_adp: 185.2, is_active: true },
  { player_id: 'bass_tyl', full_name: 'Tyler Bass', position: 'K', team: 'BUF', dynasty_adp: 192.1, is_active: true },
  { player_id: 'butker_har', full_name: 'Harrison Butker', position: 'K', team: 'KC', dynasty_adp: 188.7, is_active: true },

  // Defense/Special Teams
  { player_id: 'def_sf', full_name: 'San Francisco 49ers', position: 'DEF', team: 'SF', dynasty_adp: 175.8, is_active: true },
  { player_id: 'def_dal', full_name: 'Dallas Cowboys', position: 'DEF', team: 'DAL', dynasty_adp: 178.3, is_active: true },
  { player_id: 'def_buf', full_name: 'Buffalo Bills', position: 'DEF', team: 'BUF', dynasty_adp: 182.6, is_active: true },
  { player_id: 'def_phi', full_name: 'Philadelphia Eagles', position: 'DEF', team: 'PHI', dynasty_adp: 185.9, is_active: true },
];

async function populatePlayers() {
  console.log('🏈 Starting to populate NFL players...');
  
  try {
    // Insert players in batches to avoid hitting API limits
    const batchSize = 10;
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(players.length/batchSize)}...`);
      
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
        console.log(`❌ Failed to insert batch: ${response.status} - ${errorText}`);
        failed += batch.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n🎉 Player population complete!`);
    console.log(`✅ Successfully inserted: ${successful} players`);
    console.log(`❌ Failed to insert: ${failed} players`);
    
    // Verify the data
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/players?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (verifyResponse.ok) {
      const count = verifyResponse.headers.get('content-range');
      console.log(`📊 Total players in database: ${count}`);
    }
    
  } catch (error) {
    console.error('💥 Error populating players:', error);
  }
}

populatePlayers();