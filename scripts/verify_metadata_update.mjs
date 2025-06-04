import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// List of positions to check (one player from each position)
const positionsToCheck = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

async function verifyMetadataUpdate() {
  try {
    console.log('🔄 Verifying player metadata update...');
    
    // Get stats on metadata fields
    const { data: stats, error: statsError } = await supabase
      .from('players')
      .select(`
        count(*),
        count(height) filter (where height is not null) as height_count,
        count(weight) filter (where weight is not null) as weight_count,
        count(birth_date) filter (where birth_date is not null) as birth_date_count,
        count(college) filter (where college is not null) as college_count,
        count(jersey_number) filter (where jersey_number is not null) as jersey_number_count,
        count(experience) filter (where experience is not null) as experience_count,
        count(team_primary_color) filter (where team_primary_color is not null) as team_primary_color_count,
        count(team_secondary_color) filter (where team_secondary_color is not null) as team_secondary_color_count,
        count(image_url) filter (where image_url is not null) as image_url_count,
        count(fantasy_position_rank) filter (where fantasy_position_rank is not null) as fantasy_position_rank_count,
        count(last_season_points) filter (where last_season_points is not null) as last_season_points_count,
        count(bye_week) filter (where bye_week is not null) as bye_week_count
      `);
    
    if (statsError) {
      console.error('❌ Error getting metadata stats:', statsError);
    } else if (stats && stats.length > 0) {
      console.log('\n📊 Metadata Population Statistics:');
      console.log('===============================');
      const totalPlayers = stats[0].count;
      
      console.log(`Total Players: ${totalPlayers}`);
      console.log(`Height: ${stats[0].height_count} (${Math.round(stats[0].height_count/totalPlayers*100)}%)`);
      console.log(`Weight: ${stats[0].weight_count} (${Math.round(stats[0].weight_count/totalPlayers*100)}%)`);
      console.log(`Birth Date: ${stats[0].birth_date_count} (${Math.round(stats[0].birth_date_count/totalPlayers*100)}%)`);
      console.log(`College: ${stats[0].college_count} (${Math.round(stats[0].college_count/totalPlayers*100)}%)`);
      console.log(`Jersey Number: ${stats[0].jersey_number_count} (${Math.round(stats[0].jersey_number_count/totalPlayers*100)}%)`);
      console.log(`Experience: ${stats[0].experience_count} (${Math.round(stats[0].experience_count/totalPlayers*100)}%)`);
      console.log(`Team Primary Color: ${stats[0].team_primary_color_count} (${Math.round(stats[0].team_primary_color_count/totalPlayers*100)}%)`);
      console.log(`Team Secondary Color: ${stats[0].team_secondary_color_count} (${Math.round(stats[0].team_secondary_color_count/totalPlayers*100)}%)`);
      console.log(`Image URL: ${stats[0].image_url_count} (${Math.round(stats[0].image_url_count/totalPlayers*100)}%)`);
      console.log(`Fantasy Position Rank: ${stats[0].fantasy_position_rank_count} (${Math.round(stats[0].fantasy_position_rank_count/totalPlayers*100)}%)`);
      console.log(`Last Season Points: ${stats[0].last_season_points_count} (${Math.round(stats[0].last_season_points_count/totalPlayers*100)}%)`);
      console.log(`Bye Week: ${stats[0].bye_week_count} (${Math.round(stats[0].bye_week_count/totalPlayers*100)}%)`);
    }
    
    // Check one player from each position
    for (const position of positionsToCheck) {
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('dynasty_adp', { ascending: true })
        .limit(1);
        
      if (error) {
        console.error(`❌ Error fetching ${position} player:`, error);
        continue;
      }
      
      if (players && players.length > 0) {
        const player = players[0];
        console.log(`\n🏈 ${player.full_name} (${player.position}, ${player.team}):`);
        console.log(`  Player ID: ${player.player_id}`);
        console.log(`  Dynasty ADP: ${player.dynasty_adp}`);
        console.log(`  Height: ${player.height ? Math.floor(player.height/12) + "'" + (player.height % 12) + '"' : 'N/A'}`);
        console.log(`  Weight: ${player.weight || 'N/A'} lbs`);
        console.log(`  College: ${player.college || 'N/A'}`);
        console.log(`  Jersey: #${player.jersey_number || 'N/A'}`);
        console.log(`  Experience: ${player.experience !== null ? player.experience + ' years' : 'N/A'}`);
        console.log(`  Birth Date: ${player.birth_date || 'N/A'}`);
        console.log(`  Position Rank: ${player.fantasy_position_rank || 'N/A'}`);
        console.log(`  Last Season: ${player.last_season_points || 'N/A'} pts`);
        console.log(`  Bye Week: ${player.bye_week || 'N/A'}`);
        console.log(`  Team Colors: ${player.team_primary_color || 'N/A'} / ${player.team_secondary_color || 'N/A'}`);
        console.log(`  Image URL: ${player.image_url || 'N/A'}`);
      } else {
        console.log(`\n⚠️ No active ${position} players found`);
      }
    }
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyMetadataUpdate();