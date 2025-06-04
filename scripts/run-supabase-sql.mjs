import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Run an SQL file using Supabase's REST API
async function runSqlFile(filePath) {
  try {
    console.log(`📄 Reading SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🔄 Executing SQL on Supabase...`);
    
    // Split the SQL into statements (this is a simple approach; more complex SQL might need better parsing)
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each SQL statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      console.log(`Executing statement ${i+1}/${statements.length}...`);
      
      // Use supabase's rpc function to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: statement + ';' 
      });
      
      if (error) {
        console.error(`❌ Error executing SQL statement ${i+1}:`, error);
      } else {
        console.log(`✅ Successfully executed SQL statement ${i+1}`);
      }
    }
    
    console.log(`\n🎉 SQL execution complete!`);
    
  } catch (error) {
    console.error('❌ Error running SQL file:', error);
  }
}

// Check if Supabase has the exec_sql function, and if not, create it
async function setupExecSqlFunction() {
  try {
    console.log('🔍 Checking for exec_sql function...');
    
    // Try to call the function to see if it exists
    const { error } = await supabase.rpc('exec_sql', { 
      query: 'SELECT 1;' 
    });
    
    // If the function exists but returns an error other than "function doesn't exist", that's fine
    if (!error || !error.message.includes('function "exec_sql" does not exist')) {
      console.log('✅ exec_sql function exists');
      return true;
    }
    
    console.log('⚠️ exec_sql function does not exist, creating it...');
    
    // Since we can't create functions through the JS client easily,
    // let's alert the user to set it up manually
    console.log('\n⚠️⚠️⚠️ IMPORTANT ⚠️⚠️⚠️');
    console.log('You need to create the exec_sql function in your Supabase project.');
    console.log('Execute the following SQL in the Supabase SQL Editor:');
    console.log('\n-------------------------------------------');
    console.log(`
CREATE OR REPLACE FUNCTION exec_sql(query text) 
RETURNS json 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
    `);
    console.log('-------------------------------------------\n');
    console.log('After creating the function, run this script again.');
    
    return false;
    
  } catch (error) {
    console.error('❌ Error checking for exec_sql function:', error);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Please provide the path to an SQL file to execute');
    console.log('Usage: node run-supabase-sql.mjs path/to/sql-file.sql');
    return;
  }
  
  const sqlFilePath = path.resolve(args[0]);
  
  if (!fs.existsSync(sqlFilePath)) {
    console.log(`❌ SQL file not found: ${sqlFilePath}`);
    return;
  }
  
  // Check if the exec_sql function exists
  const canProceed = await setupExecSqlFunction();
  
  if (canProceed) {
    await runSqlFile(sqlFilePath);
  }
}

main();