# Lovable Preview Setup

This document provides information on the configuration and setup for Lovable previews in the Dynasty AI Football Hub project.

## Environment Configuration

The project is configured to support Lovable previews through dedicated configuration files and environment settings.

### Configuration Files

- **lovable.config.js**: The main configuration file for Lovable, defining build, preview, and development settings.
- **.env.lovable**: Environment variables specific to Lovable previews.
- **vite.config.ts**: Enhanced to detect and handle Lovable preview mode.

### Build Process

The build process for Lovable is customized to ensure proper environment variable handling and debugging:

1. When running a Lovable build, the `LOVABLE=true` environment flag is set.
2. The build process loads environment variables from `.env.lovable`.
3. The `lovable:build` npm script is used, which sets the mode to `lovable`.

## Running Lovable Previews

To run a Lovable preview locally:

```bash
npm run lovable:dev
```

This starts the development server with Lovable configuration.

To build for Lovable preview:

```bash
npm run lovable:build
```

To preview the Lovable build:

```bash
npm run lovable:preview
```

## Troubleshooting

If you encounter issues with the Lovable preview:

1. Check that the environment variables in `.env.lovable` are correctly set.
2. Run the debug build script to get detailed error information:

```bash
LOVABLE=true node scripts/build-with-debug.js
```

3. Verify that the preview server is accessible on port 8080.
4. If necessary, adjust the `lovable.config.js` settings to match your environment.

## Environment Variables

The following environment variables are used in Lovable previews:

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | URL for the Supabase instance |
| VITE_SUPABASE_ANON_KEY | Anonymous key for Supabase access |
| VITE_DEV_MODE | Set to false for production-like environment |
| NODE_ENV | Set to production for optimized builds |
| LOVABLE | Flag indicating Lovable environment |
| VITE_USE_MOCK_DATA | Enable mock data for Supabase in preview |
| VITE_API_BASE_URL | Base URL for API endpoints |
| VITE_ENABLE_ANALYTICS | Feature flag for analytics |
| VITE_ENABLE_NOTIFICATIONS | Feature flag for notifications |
| VITE_CACHE_TTL | Cache time-to-live in seconds |

## Notes for Developers

- When adding new environment variables, make sure to add them to `.env.lovable` as well.
- The build process will automatically detect and use the Lovable configuration when the `LOVABLE` flag is set to `true`.
- Preview builds use mock data by default to avoid Supabase authentication issues.
- The component tagger is enabled in Lovable mode to help with debugging and component identification.