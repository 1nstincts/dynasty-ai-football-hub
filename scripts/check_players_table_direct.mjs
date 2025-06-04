import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expected metadata columns and their types
const expectedColumns = {
  // Base columns
  'player_id': 'text',
  'full_name': 'text',
  'position': 'text',
  'team': 'text',
  'created_at': 'timestamp with time zone',
  
  // Draft information
  'draft_year': 'integer',
  'draft_round': 'integer',
  'draft_pick': 'integer',
  
  // ADP information
  'adp': 'numeric',
  'dynasty_adp': 'numeric',
  'is_active': 'boolean',
  
  // Metadata columns from add_player_metadata_columns.sql
  'height': 'text',         // Note: Type in DB vs. expected in code might differ
  'weight': 'integer',
  'birth_date': 'date',
  'college': 'text',
  'jersey_number': 'integer',
  'experience': 'integer',
  'team_primary_color': 'text',
  'team_secondary_color': 'text',
  'image_url': 'text',
  'fantasy_position_rank': 'integer',
  'last_season_points': 'numeric',
  'bye_week': 'integer'
};

/**
 * Check if all expected columns exist in the players table
 */
async function checkColumnsExist() {
  try {
    console.log('🔍 Checking if all expected columns exist in players table...');
    
    // Get table information using Postgres information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'players')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Error fetching column information:', error);
      return;
    }
    
    console.log(`\n📋 Found ${data.length} columns in the players table:\n`);
    
    // Create a map of existing columns and their types
    const existingColumns = {};
    data.forEach(column => {
      existingColumns[column.column_name] = {
        type: column.data_type,
        nullable: column.is_nullable === 'YES'
      };
    });
    
    // Print all existing columns with their types
    console.log('Column Name'.padEnd(25) + 'Data Type'.padEnd(20) + 'Nullable');
    console.log('='.repeat(60));
    
    Object.entries(existingColumns).forEach(([name, info]) => {
      console.log(
        `${name.padEnd(25)}${info.type.padEnd(20)}${info.nullable ? 'YES' : 'NO'}`
      );
    });
    
    // Check for missing columns
    const missingColumns = [];
    Object.keys(expectedColumns).forEach(columnName => {
      if (!existingColumns[columnName]) {
        missingColumns.push(columnName);
      }
    });
    
    if (missingColumns.length > 0) {
      console.log(`\n❌ Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('\n✅ All expected columns exist in the players table');
    }
    
    // Check column type mismatches
    const typeMismatches = [];
    Object.entries(expectedColumns).forEach(([columnName, expectedType]) => {
      if (existingColumns[columnName] && !existingColumns[columnName].type.includes(expectedType)) {
        typeMismatches.push(`${columnName}: expected ${expectedType}, got ${existingColumns[columnName].type}`);
      }
    });
    
    if (typeMismatches.length > 0) {
      console.log('\n⚠️ Column type mismatches:');
      typeMismatches.forEach(mismatch => console.log(`- ${mismatch}`));
    } else {
      console.log('\n✅ All column types match expected values');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

/**
 * Check player count and sample data
 */
async function checkPlayerData() {
  try {
    console.log('\n🔍 Checking player data...');
    
    // Count players
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting players:', countError);
      return;
    }
    
    console.log(`\n📊 Total player count: ${count}`);
    
    // Fetch a sample player
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (playerError) {
      console.error('❌ Error fetching sample player:', playerError);
      return;
    }
    
    if (playerData && playerData.length > 0) {
      console.log('\n📝 Sample player data:');
      console.log(JSON.stringify(playerData[0], null, 2));
    } else {
      console.log('\n⚠️ No players found in the database');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Starting players table structure check...');
  
  // Check columns
  await checkColumnsExist();
  
  // Check player data
  await checkPlayerData();
  
  console.log('\n🏁 Table structure check complete!');
}

// Run the main function
main();