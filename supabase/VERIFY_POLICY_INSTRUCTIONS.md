# Verifying Policy Removal

After applying the fix to remove duplicate RLS policies, follow these steps to verify that the fix was successful.

## Option 1: Using Supabase Studio SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `verify_policy_removal.sql`
5. Run the query

## Option 2: Using the Supabase CLI

If you have the Supabase CLI installed and configured:

```bash
supabase db execute --file=verify_policy_removal.sql
```

## Option 3: Using the Database Settings UI

1. Log in to your Supabase dashboard
2. Navigate to Database → Tables → players
3. Click on "Policies" tab
4. Visually inspect the policies list to ensure there are no duplicates
5. Each policy name should appear only once

## Interpreting Results

When running the verification SQL script:

1. The first query shows all policies on the players table
   - Review this list to ensure there are no obvious duplicates

2. The second query will return any policy names that appear more than once
   - If this query returns no rows, it means there are no duplicate policies
   - If it returns any rows, it means there are still duplicates that need to be fixed

3. The third query checks for a specific policy by name
   - If this returns 1, the policy exists (which is expected for a legitimate policy)
   - If it returns 0, the policy doesn't exist at all
   - If it returns > 1, there's still a duplicate policy problem

## What to Do If Duplicates Still Exist

If you still see duplicate policies after applying the fix:

1. Double-check that you ran the fix script correctly
2. Try running the fix script again (it's designed to be idempotent)
3. If problems persist, you may need to contact Supabase support or manually remove the policies through the UI

Remember to test your application functionality after removing policies to ensure that the correct access controls are still in place.