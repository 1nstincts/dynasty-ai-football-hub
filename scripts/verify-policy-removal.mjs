#!/usr/bin/env node

/**
 * Script to verify the removal of duplicate RLS policies in Supabase
 * 
 * This script connects to the Supabase database and executes verification queries
 * to check if duplicate policies have been successfully removed.
 * 
 * Usage:
 *   node verify-policy-removal.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key to access RLS policies

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the verification SQL script
const sqlScriptPath = path.join(process.cwd(), 'supabase', 'verify_policy_removal.sql');
let sqlScript;

try {
  sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
} catch (error) {
  console.error(`Error reading SQL script: ${error.message}`);
  process.exit(1);
}

// Extract individual SQL queries from the script
const queries = sqlScript
  .split(';')
  .map(query => query.trim())
  .filter(query => query && !query.startsWith('--'));

async function verifyPolicyRemoval() {
  console.log('Verifying policy removal...\n');
  
  try {
    // PLAYERS TABLE VERIFICATION
    console.log('==== PLAYERS TABLE VERIFICATION ====');
    
    // Execute each query in the verification script
    console.log('All policies on the players table:');
    const { data: playerPolicies, error: playerPoliciesError } = await supabase.rpc('query_sql', {
      query_text: queries[0]
    });
    
    if (playerPoliciesError) throw playerPoliciesError;
    console.table(playerPolicies);
    
    console.log('\nChecking for duplicate policies in players table:');
    const { data: playerDuplicates, error: playerDuplicatesError } = await supabase.rpc('query_sql', {
      query_text: queries[1]
    });
    
    if (playerDuplicatesError) throw playerDuplicatesError;
    
    if (playerDuplicates.length === 0) {
      console.log('✅ No duplicate policies found in players table!');
    } else {
      console.log('❌ Duplicate policies still exist in players table:');
      console.table(playerDuplicates);
    }
    
    console.log('\nChecking for specific problematic policy in players table:');
    const { data: playerSpecificPolicy, error: playerSpecificPolicyError } = await supabase.rpc('query_sql', {
      query_text: queries[2]
    });
    
    if (playerSpecificPolicyError) throw playerSpecificPolicyError;
    
    const playerCount = playerSpecificPolicy[0].players_policy_count;
    if (playerCount === 0) {
      console.log('❌ Policy "Enable read access for all users" does not exist at all.');
      console.log('Note: This could be correct if the policy was completely removed, but check if this was intended.');
    } else if (playerCount === 1) {
      console.log('✅ Policy "Enable read access for all users" exists exactly once (as expected).');
    } else {
      console.log(`❌ Policy "Enable read access for all users" exists ${playerCount} times. Duplicates still present!`);
    }
    
    // TEAM_ROSTERS TABLE VERIFICATION
    console.log('\n==== TEAM_ROSTERS TABLE VERIFICATION ====');
    
    console.log('All policies on the team_rosters table:');
    const { data: rosterPolicies, error: rosterPoliciesError } = await supabase.rpc('query_sql', {
      query_text: queries[3]
    });
    
    if (rosterPoliciesError) throw rosterPoliciesError;
    console.table(rosterPolicies);
    
    console.log('\nChecking for duplicate policies by role and action in team_rosters table:');
    const { data: rosterDuplicates, error: rosterDuplicatesError } = await supabase.rpc('query_sql', {
      query_text: queries[4]
    });
    
    if (rosterDuplicatesError) throw rosterDuplicatesError;
    
    if (rosterDuplicates.length === 0) {
      console.log('✅ No duplicate policies found in team_rosters table!');
    } else {
      console.log('❌ Duplicate policies still exist in team_rosters table:');
      console.table(rosterDuplicates);
    }
    
    console.log('\nChecking for specific problematic policy in team_rosters table:');
    const { data: rosterSpecificPolicy, error: rosterSpecificPolicyError } = await supabase.rpc('query_sql', {
      query_text: queries[5]
    });
    
    if (rosterSpecificPolicyError) throw rosterSpecificPolicyError;
    
    const rosterCount = rosterSpecificPolicy[0].team_rosters_policy_count;
    if (rosterCount === 0) {
      console.log('✅ Policy "Allow all to manage team rosters" has been removed.');
    } else {
      console.log(`❌ Policy "Allow all to manage team rosters" still exists (count: ${rosterCount}).`);
    }
    
    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
    process.exit(1);
  }
}

verifyPolicyRemoval();