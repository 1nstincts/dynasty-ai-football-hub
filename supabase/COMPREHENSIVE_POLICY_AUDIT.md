# Comprehensive Supabase Policy Audit & Fix

This document provides instructions for running a comprehensive audit and fix for duplicate Row Level Security (RLS) policies across all tables in your Supabase database.

## Overview

The `comprehensive_policy_audit_fix.sql` script systematically:

1. Identifies all tables with duplicate permissive policies for the same role and command
2. Generates detailed reports of duplicate policies
3. Automatically fixes known problematic tables (players, team_rosters)
4. Intelligently handles any other tables with duplicate policies
5. Verifies that all issues have been resolved

## When to Use This

Use this comprehensive audit when:

- You're seeing multiple "Multiple Permissive Policies" warnings in Supabase
- You want to ensure optimal RLS policy configuration across your entire database
- After database migrations or schema changes
- As part of routine database maintenance

## Implementation Steps

### Option 1: Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the entire contents of `comprehensive_policy_audit_fix.sql`
5. Run the script
6. Review the output to ensure no duplicate policies remain

### Option 2: Supabase CLI

```bash
# Ensure you have the latest Supabase CLI installed
supabase sql -f supabase/comprehensive_policy_audit_fix.sql
```

## How It Works

The script uses a systematic approach:

1. **Identification Phase**
   - Creates temporary tables to track tables with duplicate policies
   - Generates detailed reports about policy configurations

2. **Fix Phase for Known Tables**
   - Specifically handles players and team_rosters tables with tailored fixes
   - Drops all policies and recreates them with clear role separation

3. **Automatic Fix Phase**
   - For any other tables with duplicate policies
   - Preserves one policy per role/command combination
   - Intelligently recreates policies with the same permissions

4. **Verification Phase**
   - Confirms no duplicate policies remain
   - Reports the final state of policies

## Important Considerations

- **Backup First**: Always create a database backup before running this script
- **Testing**: Run this in a test environment first if possible
- **Transaction Safety**: The script runs in a transaction, so it will completely succeed or fail
- **Review Results**: Always review the output to ensure policies have been fixed correctly

## Expected Outcome

After running this script:

1. No tables should have duplicate policies for the same role and command
2. RLS policies should have clear separation between anonymous and authenticated users
3. The Supabase dashboard should no longer show "Multiple Permissive Policies" warnings
4. Database performance for queries should improve

## Troubleshooting

If issues persist after running the script:

1. Check if any errors occurred during execution
2. Verify that the transaction was committed successfully
3. Restart your Supabase instance to refresh the policy cache
4. Contact Supabase support if problems continue

## Future Prevention

To prevent duplicate policies from recurring:

1. Use the pattern established in this script when creating new policies
2. Always use `DROP POLICY IF EXISTS` before creating new policies
3. Implement a policy naming convention that clearly indicates role and action
4. Run this audit script periodically as part of database maintenance