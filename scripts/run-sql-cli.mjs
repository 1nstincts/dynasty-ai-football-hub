import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Run schema alterations using individual column ADD commands
async function runSchemaUpdate(filePath) {
  try {
    console.log(`📄 Reading SQL file: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse column addition commands
    const addColumnMatches = sqlContent.match(/ADD\s+COLUMN\s+\w+\s+[^;]+/gi) || [];
    
    if (addColumnMatches.length === 0) {
      console.log('⚠️ No ADD COLUMN commands found in SQL file');
      return;
    }
    
    console.log(`🔄 Found ${addColumnMatches.length} column additions to process`);
    
    // Process each column addition
    for (let i = 0; i < addColumnMatches.length; i++) {
      const columnAddition = addColumnMatches[i].trim();
      const columnMatch = columnAddition.match(/ADD\s+COLUMN\s+(\w+)\s+([^;]+)/i);
      
      if (!columnMatch) {
        console.log(`⚠️ Could not parse column definition: ${columnAddition}`);
        continue;
      }
      
      const columnName = columnMatch[1];
      const columnType = columnMatch[2].trim();
      
      console.log(`Processing column ${i+1}/${addColumnMatches.length}: ${columnName} ${columnType}...`);
      
      // Use supabase direct API access to alter the table
      const { data, error } = await supabase
        .from('players')
        .select(columnName)
        .limit(1)
        .then(response => {
          // If no error, the column exists
          if (!response.error) {
            console.log(`✅ Column ${columnName} already exists`);
            return { exists: true, error: null };
          }
          
          // If error contains "column does not exist", we need to add it
          if (response.error && response.error.message.includes('column') && response.error.message.includes('does not exist')) {
            return { exists: false, error: null };
          }
          
          // Otherwise, there's some other error
          return { exists: false, error: response.error };
        });
      
      if (error) {
        console.error(`❌ Error checking if column ${columnName} exists:`, error.message);
        continue;
      }
      
      // If column doesn't exist, add it using direct SQL
      if (!data?.exists) {
        // We have to use a different approach since we can't run raw SQL directly
        // For this script, we'll just print out the command to run
        console.log(`⚠️ Need to manually add column: ${columnName} ${columnType}`);
        console.log(`❓ Please add this column through the Supabase UI SQL editor`);
      }
    }
    
    console.log(`\n🎉 Schema update process complete!`);
    console.log(`⚠️ Since we can't execute raw SQL through the JS client,`);
    console.log(`   please run the SQL file manually in the Supabase SQL Editor.`);
    
  } catch (error) {
    console.error('❌ Error processing SQL file:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Please provide the path to an SQL file to execute');
    console.log('Usage: node run-sql-cli.mjs path/to/sql-file.sql');
    return;
  }
  
  const sqlFilePath = path.resolve(args[0]);
  
  if (!fs.existsSync(sqlFilePath)) {
    console.log(`❌ SQL file not found: ${sqlFilePath}`);
    return;
  }
  
  // Display SQL file content
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log('\n📝 SQL FILE CONTENT:');
  console.log('-------------------------------------------');
  console.log(sqlContent);
  console.log('-------------------------------------------\n');
  
  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('⚠️ This SQL file needs to be executed manually in the Supabase SQL Editor. Continue with analysis? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      await runSchemaUpdate(sqlFilePath);
    } else {
      console.log('❌ Operation cancelled');
    }
    rl.close();
  });
}

main();