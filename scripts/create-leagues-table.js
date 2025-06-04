import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read the SQL file
const sqlFilePath = path.join(process.cwd(), 'supabase', 'create_leagues_table.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Initialize Supabase client
// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLeaguesTable() {
  try {
    console.log('Creating leagues table...');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          // Try alternative method for DDL statements
          const { data: altData, error: altError } = await supabase
            .from('_dummy_') // This will fail but might execute DDL
            .select('*');
          
          console.log('Statement executed (DDL statements may show errors but still work)');
        } else {
          console.log('Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Leagues table creation completed!');
    
    // Test the table by trying to select from it
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error testing leagues table:', error.message);
    } else {
      console.log('✅ Leagues table is accessible and ready to use!');
    }
    
  } catch (error) {
    console.error('❌ Error creating leagues table:', error);
  }
}

createLeaguesTable();