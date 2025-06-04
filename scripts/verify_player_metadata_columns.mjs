import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Query the players table structure
async function verifyPlayerMetadata() {
  try {
    console.log('🔍 Verifying players table metadata columns...');
    
    // Get a row from the players table to check column structure
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (playerError) {
      console.error('❌ Error querying players table:', playerError);
      return;
    }
    
    if (!playerData || playerData.length === 0) {
      console.log('⚠️ Players table is empty or not accessible');
      return;
    }
    
    // Get all columns from the first row
    const player = playerData[0];
    const columns = Object.keys(player);
    
    // Define the metadata columns we expect to find with their expected types
    const metadataColumns = [
      { name: 'height', expectedType: 'integer' },
      { name: 'weight', expectedType: 'integer' },
      { name: 'birth_date', expectedType: 'date' },
      { name: 'college', expectedType: 'text' },
      { name: 'jersey_number', expectedType: 'integer' },
      { name: 'experience', expectedType: 'integer' },
      { name: 'team_primary_color', expectedType: 'text' },
      { name: 'team_secondary_color', expectedType: 'text' },
      { name: 'image_url', expectedType: 'text' },
      { name: 'fantasy_position_rank', expectedType: 'integer' },
      { name: 'last_season_points', expectedType: 'numeric' },
      { name: 'bye_week', expectedType: 'integer' }
    ];
    
    // Insert some test data to help determine column types
    console.log('📝 Inserting test data to verify column types...');
    
    // Create a test record with example data for each metadata column
    const testData = {
      player_id: 'test_player_' + Date.now(),
      full_name: 'Test Player',
      position: 'QB',
      team: 'TEST',
      height: 72,
      weight: 220,
      birth_date: '1995-01-01',
      college: 'Test University',
      jersey_number: 99,
      experience: 3,
      team_primary_color: '#FF0000',
      team_secondary_color: '#0000FF',
      image_url: 'https://example.com/test.jpg',
      fantasy_position_rank: 1,
      last_season_points: 250.5,
      bye_week: 10,
      is_active: false // Set to false so it won't show up in normal queries
    };
    
    // Insert the test record
    const { data: insertData, error: insertError } = await supabase
      .from('players')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test data:', insertError);
      // Continue with the verification using existing data
    } else {
      console.log('✅ Test data inserted successfully');
    }
    
    // Now query the table again to get fresh data including our test record
    const { data: freshData, error: freshError } = await supabase
      .from('players')
      .select('*')
      .eq('player_id', testData.player_id)
      .limit(1);
    
    if (freshError) {
      console.error('❌ Error querying test data:', freshError);
    }
    
    // Use either the fresh data or the original data
    const testPlayer = freshData && freshData.length > 0 ? freshData[0] : player;
    
    // Print all metadata columns with their values and types
    console.log('\n📋 Metadata columns verification:');
    console.log('-------------------------------------------');
    console.log('COLUMN NAME          | EXPECTED TYPE | ACTUAL TYPE | VALUE | STATUS');
    console.log('-------------------- | ------------- | ----------- | ----- | ------');
    
    metadataColumns.forEach(({ name, expectedType }) => {
      const exists = columns.includes(name);
      const value = testPlayer[name];
      
      // Determine actual type based on the value and some heuristics
      let actualType = 'unknown';
      if (value === null) {
        actualType = 'null (cannot determine)';
      } else if (typeof value === 'number' && Number.isInteger(value)) {
        actualType = 'integer';
      } else if (typeof value === 'number') {
        actualType = 'numeric';
      } else if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
          actualType = 'date';
        } else {
          actualType = 'text';
        }
      } else {
        actualType = typeof value;
      }
      
      // Determine if types match
      const typeMatch = actualType.includes(expectedType) || 
                       (expectedType === 'integer' && actualType === 'numeric') || 
                       (actualType === 'null (cannot determine)');
      
      console.log(
        `${name.padEnd(20)} | ${expectedType.padEnd(13)} | ${actualType.padEnd(11)} | ${String(value).substring(0, 15).padEnd(5)} | ${exists ? (typeMatch ? '✅' : '⚠️') : '❌'}`
      );
    });
    
    // Count the results
    const foundColumns = metadataColumns.filter(({ name }) => columns.includes(name));
    
    console.log('\n📊 Summary:');
    console.log('-------------------------------------------');
    console.log(`Found ${foundColumns.length}/${metadataColumns.length} metadata columns`);
    
    // Clean up the test data
    if (insertData && insertData.length > 0) {
      console.log('\n🧹 Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('player_id', testData.player_id);
      
      if (deleteError) {
        console.error('❌ Error deleting test data:', deleteError);
      } else {
        console.log('✅ Test data cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Error verifying player metadata:', error);
  }
}

// Main function
async function main() {
  await verifyPlayerMetadata();
}

main();