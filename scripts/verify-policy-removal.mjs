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
    // Execute each query in the verification script
    console.log('All policies on the players table:');
    const { data: allPolicies, error: allPoliciesError } = await supabase.rpc('query_sql', {
      query_text: queries[0]
    });
    
    if (allPoliciesError) throw allPoliciesError;
    console.table(allPolicies);
    
    console.log('\nChecking for duplicate policies:');
    const { data: duplicates, error: duplicatesError } = await supabase.rpc('query_sql', {
      query_text: queries[1]
    });
    
    if (duplicatesError) throw duplicatesError;
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate policies found!');
    } else {
      console.log('❌ Duplicate policies still exist:');
      console.table(duplicates);
    }
    
    console.log('\nChecking for specific problematic policy:');
    const { data: specificPolicy, error: specificPolicyError } = await supabase.rpc('query_sql', {
      query_text: queries[2]
    });
    
    if (specificPolicyError) throw specificPolicyError;
    
    const count = specificPolicy[0].count;
    if (count === 0) {
      console.log('❌ Policy "Enable read access for all users" does not exist at all.');
      console.log('Note: This could be correct if the policy was completely removed, but check if this was intended.');
    } else if (count === 1) {
      console.log('✅ Policy "Enable read access for all users" exists exactly once (as expected).');
    } else {
      console.log(`❌ Policy "Enable read access for all users" exists ${count} times. Duplicates still present!`);
    }
    
    console.log('\nVerification complete!');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
    process.exit(1);
  }
}

verifyPolicyRemoval();