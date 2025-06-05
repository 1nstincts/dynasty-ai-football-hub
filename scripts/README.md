# Dynasty AI Football Hub Scripts

This directory contains utility scripts for the Dynasty AI Football Hub application.

## Database Management Scripts

### Supabase Policy Verification

- `verify-policy-removal.mjs` - Verifies that duplicate RLS policies have been removed from the Supabase database.

Usage:
```bash
# Set environment variables first
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_KEY=your_service_key

# Run the verification script
node verify-policy-removal.mjs
```

## Player Management Scripts

- `add-all-real-nfl-players.mjs` - Imports real NFL player data
- `add-player-metadata.mjs` - Adds metadata to player records
- `check-players.mjs` - Validates player data integrity
- `force-delete-all-players.mjs` - Purges player records when needed
- `update-player-metadata-simplified.mjs` - Updates specific player metadata fields

## League Management Scripts

- `create-leagues-table.js` - Sets up the leagues database table
- `setup-leagues.mjs` - Initializes league data

## SQL Management

- `run-sql-cli.mjs` - Utility for running SQL commands against the database
- `run-supabase-sql.mjs` - Executes SQL files against the Supabase database

## Notes

- Most scripts require environment variables for database access
- Create a `.env` file in the project root with the necessary credentials
- Run scripts with `node scripts/script-name.mjs`