# Dynasty AI Football Hub

A comprehensive fantasy football platform with AI-powered dynasty analysis tools, player management, and league administration features.

## Project Overview

The Dynasty AI Football Hub provides fantasy football enthusiasts with advanced tools for dynasty league management, player valuation, team analysis, and more.

## Database Policy Management

The project uses Supabase for the database with Row Level Security (RLS) policies to control data access. We have implemented comprehensive tools to manage and maintain optimal policy configuration.

### Policy Verification

To check for duplicate RLS policies in the database:

```bash
# Run the verification script
node scripts/verify-policies-ci.mjs
```

This script is also integrated into the CI/CD pipeline to catch policy issues before deployment.

### Policy Fixes

If duplicate policies are detected, use one of these solutions:

1. **Targeted Fix**: For specific tables
   ```bash
   # Fix players table
   supabase sql -f supabase/fix_duplicate_policy.sql
   
   # Fix team_rosters table
   supabase sql -f supabase/fix_team_rosters_policy_complete.sql
   ```

2. **Comprehensive Fix**: For all tables
   ```bash
   supabase sql -f supabase/comprehensive_policy_audit_fix.sql
   ```

### Documentation

For detailed information on policy management, see:
- `supabase/COMPREHENSIVE_POLICY_AUDIT.md` - Complete audit guide
- `supabase/TEAM_ROSTERS_POLICY_FIX.md` - Team rosters specific fix
- `supabase/DUPLICATE_POLICY_FIX_SUMMARY.md` - Overview of all fixes

## Development

### Setup

```sh
# Clone the repository
git clone https://github.com/1nstincts/dynasty-ai-football-hub.git

# Navigate to the project directory
cd dynasty-ai-football-hub

# Install dependencies
npm install

# Setup environment variables (copy example file)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start the development server
npm run dev
```

### Environment Setup

Create a `.env.local` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Prerequisites

- Node.js 18+ and npm
- Supabase account with a project set up
- Supabase CLI (for database migrations and policy management)

## Technology Stack

This project is built with:

- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **State Management**: Redux Toolkit
- **Database**: Supabase (PostgreSQL)
- **API**: Supabase REST/Realtime
- **Authentication**: Supabase Auth
- **Hosting**: Custom deployment

## Features

- AI-powered team analysis and recommendations
- Dynasty value calculator with multi-year projections
- Advanced player comparison tools
- Dynasty rankings with customizable metrics
- Team roster management with contract features
- Trade analyzer with fairness evaluation
- League history and standings visualization
- Rookie and startup draft tools
