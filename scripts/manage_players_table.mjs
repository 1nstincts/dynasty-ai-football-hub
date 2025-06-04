import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Define the metadata columns with their expected types
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

// Verify the players table structure
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
      return null;
    }
    
    if (!playerData || playerData.length === 0) {
      console.log('⚠️ Players table is empty or not accessible');
      return null;
    }
    
    // Get all columns from the first row
    const player = playerData[0];
    const columns = Object.keys(player);
    
    // Prepare results object
    const results = {
      allColumnsFound: true,
      columnsStatus: [],
      missingColumns: []
    };
    
    // Check each metadata column
    metadataColumns.forEach(({ name, expectedType }) => {
      const exists = columns.includes(name);
      if (!exists) {
        results.allColumnsFound = false;
        results.missingColumns.push({ name, expectedType });
      }
      
      results.columnsStatus.push({
        name,
        exists,
        expectedType
      });
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error verifying player metadata:', error);
    return null;
  }
}

// Display the verification results
function displayResults(results) {
  if (!results) {
    console.log('❌ Verification failed');
    return;
  }
  
  console.log('\n📋 Metadata columns status:');
  console.log('-------------------------------------------');
  console.log('COLUMN NAME          | STATUS  | EXPECTED TYPE');
  console.log('-------------------- | ------- | -------------');
  
  results.columnsStatus.forEach(({ name, exists, expectedType }) => {
    console.log(
      `${name.padEnd(20)} | ${(exists ? '✅ Found' : '❌ Missing').padEnd(7)} | ${expectedType}`
    );
  });
  
  console.log('\n📊 Summary:');
  console.log('-------------------------------------------');
  console.log(`${results.columnsStatus.filter(c => c.exists).length}/${metadataColumns.length} metadata columns found`);
  
  if (!results.allColumnsFound) {
    console.log('\n⚠️ Missing columns:');
    console.log('-------------------------------------------');
    results.missingColumns.forEach(({ name, expectedType }) => {
      console.log(`${name} (${expectedType})`);
    });
  } else {
    console.log('\n✅ All metadata columns are present!');
  }
}

// Generate SQL statements to fix missing columns
function generateFixSQL(results) {
  if (!results || results.allColumnsFound) {
    return '';
  }
  
  let sql = '-- SQL to add missing columns\n\n';
  
  results.missingColumns.forEach(({ name, expectedType }) => {
    sql += `ALTER TABLE public.players ADD COLUMN IF NOT EXISTS ${name} ${expectedType};\n`;
  });
  
  return sql;
}

// Fix the height column data type issue
async function fixHeightColumn() {
  try {
    console.log('🔧 Attempting to fix height column data type...');
    
    // First, check if the height column exists and its current type
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('height')
      .limit(1);
    
    if (playerError) {
      console.error('❌ Error checking height column:', playerError);
      return false;
    }
    
    // Create a temporary column, move data, then replace
    const sql = `
      -- Fix height column type (changing from text to integer)
      ALTER TABLE public.players ADD COLUMN IF NOT EXISTS height_integer integer;
      
      -- Update the new column with converted data
      UPDATE public.players 
      SET height_integer = height::integer 
      WHERE height ~ '^[0-9]+$';
      
      -- Drop the old column
      ALTER TABLE public.players DROP COLUMN height;
      
      -- Rename the new column to the original name
      ALTER TABLE public.players RENAME COLUMN height_integer TO height;
    `;
    
    console.log('\n📝 SQL to fix height column:');
    console.log('-------------------------------------------');
    console.log(sql);
    console.log('-------------------------------------------');
    
    console.log('\n⚠️ You need to run this SQL in the Supabase SQL Editor manually.');
    console.log('   The column type cannot be changed directly through the JS client.');
    
    return true;
  } catch (error) {
    console.error('❌ Error fixing height column:', error);
    return false;
  }
}

// Create an interactive CLI
function createCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('👋 Welcome to the Players Table Manager');
  console.log('----------------------------------------');
  
  function showMenu() {
    console.log('\n📋 Menu:');
    console.log('1. Verify player metadata columns');
    console.log('2. Fix height column data type');
    console.log('3. Count players in the database');
    console.log('4. Show a sample player record');
    console.log('0. Exit');
    
    rl.question('\nSelect an option (0-4): ', async (answer) => {
      switch (answer) {
        case '1':
          const results = await verifyPlayerMetadata();
          displayResults(results);
          if (!results.allColumnsFound) {
            const sql = generateFixSQL(results);
            console.log('\n📝 SQL to fix missing columns:');
            console.log('-------------------------------------------');
            console.log(sql);
            console.log('-------------------------------------------');
          }
          showMenu();
          break;
          
        case '2':
          await fixHeightColumn();
          showMenu();
          break;
          
        case '3':
          try {
            const { count, error } = await supabase
              .from('players')
              .select('*', { count: 'exact', head: true });
              
            if (error) {
              console.error('❌ Error counting players:', error);
            } else {
              console.log(`\n📊 Player count: ${count}`);
            }
          } catch (error) {
            console.error('❌ Error:', error);
          }
          showMenu();
          break;
          
        case '4':
          try {
            const { data, error } = await supabase
              .from('players')
              .select('*')
              .limit(1);
              
            if (error) {
              console.error('❌ Error retrieving sample player:', error);
            } else if (data && data.length > 0) {
              console.log('\n📋 Sample player record:');
              console.log('-------------------------------------------');
              Object.entries(data[0]).forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
              });
            } else {
              console.log('⚠️ No players found in the database');
            }
          } catch (error) {
            console.error('❌ Error:', error);
          }
          showMenu();
          break;
          
        case '0':
          console.log('👋 Goodbye!');
          rl.close();
          break;
          
        default:
          console.log('❌ Invalid option. Please try again.');
          showMenu();
          break;
      }
    });
  }
  
  showMenu();
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--verify')) {
    const results = await verifyPlayerMetadata();
    displayResults(results);
    process.exit(0);
  } else if (args.includes('--fix-height')) {
    await fixHeightColumn();
    process.exit(0);
  } else {
    createCLI();
  }
}

main();