import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPlayersTable() {
  try {
    console.log('🔍 Checking players table structure...');
    
    // Execute a query to get column names and types
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: 'SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = \'public\' AND table_name = \'players\' ORDER BY ordinal_position;' 
    });
    
    if (error) {
      console.error('❌ Error querying table structure:', error);
      return;
    }
    
    console.log('\n📊 Players Table Structure:');
    console.log('==========================');
    
    // Format the result
    if (data && data.result && data.result.length > 0) {
      data.result.forEach(column => {
        console.log(`${column.column_name.padEnd(25)} ${column.data_type}`);
      });
      
      // Check for specific metadata columns
      const columnNames = data.result.map(col => col.column_name);
      const metadataColumns = [
        'height', 'weight', 'birth_date', 'college', 'jersey_number', 
        'experience', 'team_primary_color', 'team_secondary_color',
        'image_url', 'fantasy_position_rank', 'last_season_points', 'bye_week'
      ];
      
      console.log('\n✅ Metadata Columns Check:');
      console.log('=========================');
      metadataColumns.forEach(column => {
        console.log(`${column.padEnd(25)} ${columnNames.includes(column) ? '✓ Present' : '✗ Missing'}`);
      });
      
    } else {
      console.log('No columns found or unexpected response format');
      console.log('Raw response:', data);
    }
    
    // Also check if there are any players in the table
    const { data: countData, error: countError } = await supabase.rpc('exec_sql', { 
      query: 'SELECT COUNT(*) FROM public.players;' 
    });
    
    if (!countError && countData && countData.result && countData.result.length > 0) {
      console.log(`\n📈 Total Players in Database: ${countData.result[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkPlayersTable();