import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function setupLeaguesTable() {
  try {
    console.log('🔧 Setting up leagues table...');
    
    // First, let's test if we can access the database
    console.log('Testing database connection...');
    const { data: players, error: testError } = await supabase
      .from('players')
      .select('player_id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Try to check if leagues table already exists
    console.log('Checking if leagues table exists...');
    const { data: existingLeagues, error: checkError } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Leagues table already exists and is accessible!');
      console.log('Current leagues count:', existingLeagues?.length || 0);
      return;
    }
    
    console.log('📋 Leagues table does not exist yet. This is expected.');
    console.log('');
    console.log('To create the leagues table, please:');
    console.log('1. Go to your Supabase Dashboard: https://emowltjqevmwydjyahrj.supabase.co');
    console.log('2. Navigate to "SQL Editor"');
    console.log('3. Copy and paste the following SQL:');
    console.log('');
    console.log('-- Create leagues table');
    console.log(`CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dynasty', 'redraft', 'keeper')),
    size INTEGER NOT NULL CHECK (size >= 4 AND size <= 16),
    owner_id TEXT,
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all to read leagues" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Allow users to create leagues" ON public.leagues FOR INSERT WITH CHECK (true);`);
    
    console.log('');
    console.log('4. Run the SQL script');
    console.log('5. Your league persistence will be fully functional!');
    
    // Test creating a sample league in memory for now
    console.log('');
    console.log('📝 For now, leagues will be stored in browser memory only.');
    console.log('They will persist during your session but not between browser restarts.');
    
  } catch (error) {
    console.error('❌ Error setting up leagues:', error);
  }
}

setupLeaguesTable();