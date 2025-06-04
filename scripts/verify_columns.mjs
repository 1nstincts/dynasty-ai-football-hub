import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Define the expected metadata columns
const expectedColumns = [
  'player_id',
  'full_name',
  'position',
  'team',
  'height',
  'weight',
  'birth_date',
  'college',
  'jersey_number',
  'experience',
  'team_primary_color',
  'team_secondary_color',
  'image_url',
  'fantasy_position_rank',
  'last_season_points',
  'bye_week',
  'adp',
  'dynasty_adp',
  'is_active'
];

async function verifyColumns() {
  try {
    console.log('🔍 Verifying players table columns...');
    
    // Fetch a sample player to see all columns
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching players:', error);
      return;
    }
    
    if (!players || players.length === 0) {
      console.log('⚠️ No players found in the database');
      return;
    }
    
    // Get actual columns from the sample player
    const samplePlayer = players[0];
    const actualColumns = Object.keys(samplePlayer);
    
    console.log('\n📊 Column Verification:');
    console.log('======================');
    
    // Check each expected column
    expectedColumns.forEach(column => {
      const exists = actualColumns.includes(column);
      console.log(`${column.padEnd(25)} ${exists ? '✅ Present' : '❌ Missing'}`);
    });
    
    // Check for any unexpected columns
    const unexpectedColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    if (unexpectedColumns.length > 0) {
      console.log('\n⚠️ Unexpected columns found:');
      unexpectedColumns.forEach(col => console.log(`  - ${col}`));
    }
    
    console.log('\n📈 Total Players: Fetching count...');
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting players:', countError);
    } else {
      console.log(`📊 Total Players in Database: ${count}`);
    }
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyColumns();