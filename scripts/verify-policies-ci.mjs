#!/usr/bin/env node

/**
 * Supabase Policy Verification Tool for CI/CD
 * 
 * This script checks for duplicate RLS policies across all tables in the database.
 * It's designed to be run in CI/CD pipelines to catch policy duplication issues before deployment.
 * 
 * Usage:
 *   node verify-policies-ci.mjs
 * 
 * Exit codes:
 *   0 - Success, no duplicate policies found
 *   1 - Duplicate policies found or error running the script
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

/**
 * SQL query to identify tables with duplicate policies
 */
const DUPLICATE_POLICY_CHECK_QUERY = `
WITH role_cmd_counts AS (
  SELECT 
    schemaname,
    tablename,
    roles::text,
    cmd,
    COUNT(*) as policy_count
  FROM pg_policies 
  GROUP BY schemaname, tablename, roles, cmd
  HAVING COUNT(*) > 1
  ORDER BY schemaname, tablename, roles, cmd
)
SELECT * FROM role_cmd_counts;
`;

/**
 * SQL query to get details about duplicate policies
 */
const DUPLICATE_POLICY_DETAILS_QUERY = `
WITH role_cmd_counts AS (
  SELECT 
    schemaname,
    tablename,
    roles::text,
    cmd,
    COUNT(*) as policy_count
  FROM pg_policies 
  GROUP BY schemaname, tablename, roles, cmd
  HAVING COUNT(*) > 1
)
SELECT 
  pol.schemaname,
  pol.tablename, 
  pol.policyname,
  pol.permissive,
  pol.roles::text,
  pol.cmd,
  pol.qual,
  pol.with_check
FROM pg_policies pol
JOIN role_cmd_counts rcc 
  ON pol.schemaname = rcc.schemaname 
  AND pol.tablename = rcc.tablename 
  AND pol.roles::text = rcc.roles 
  AND pol.cmd = rcc.cmd
ORDER BY pol.schemaname, pol.tablename, pol.roles, pol.cmd, pol.policyname;
`;

/**
 * Main function to verify policies
 */
async function verifyPolicies() {
  try {
    console.log('🔍 Checking for duplicate RLS policies...\n');
    
    // Execute the duplicate policy check query
    const { data: duplicates, error } = await supabase.rpc('query_sql', {
      query_text: DUPLICATE_POLICY_CHECK_QUERY
    });
    
    if (error) {
      console.error('Error running duplicate policy check:', error.message);
      process.exit(1);
    }
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate policies found. All tables have optimal RLS configuration.');
      process.exit(0);
    }
    
    console.log('❌ Duplicate policies found:');
    console.table(duplicates);
    
    // Get more details about the duplicate policies
    const { data: details, error: detailsError } = await supabase.rpc('query_sql', {
      query_text: DUPLICATE_POLICY_DETAILS_QUERY
    });
    
    if (detailsError) {
      console.error('Error getting policy details:', detailsError.message);
    } else {
      console.log('\nDetailed information about duplicate policies:');
      console.table(details);
    }
    
    // Generate a report file if CI=true
    if (process.env.CI === 'true') {
      const reportPath = path.join(process.cwd(), 'policy-verification-report.json');
      const report = {
        timestamp: new Date().toISOString(),
        duplicatePolicies: duplicates,
        policyDetails: details || []
      };
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\nReport saved to ${reportPath}`);
    }
    
    console.log('\n📋 Recommendation:');
    console.log('Run the comprehensive policy audit and fix script:');
    console.log('supabase sql -f supabase/comprehensive_policy_audit_fix.sql');
    
    // Exit with error code in CI environments
    process.exit(1);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the verification
verifyPolicies();