/**
 * Lovable configuration file
 * This file configures how Lovable builds and previews the project
 */

export default {
  // Build configuration
  build: {
    // Command to run when building the project - passing LOVABLE=true to indicate this is a Lovable build
    command: 'LOVABLE=true npm run lovable:build',
    // Output directory for the build
    outputDir: 'dist',
    // Environment variables to inject during build
    env: {
      // These are placeholders - Lovable will replace them with actual values
      VITE_SUPABASE_URL: '{{SUPABASE_URL}}',
      VITE_SUPABASE_ANON_KEY: '{{SUPABASE_ANON_KEY}}',
      VITE_DEV_MODE: 'false',
      NODE_ENV: 'production',
      LOVABLE: 'true',
      // Add any other environment variables needed for the build
    },
    // Log all output
    verbose: true,
  },
  
  // Preview configuration
  preview: {
    // Command to run when previewing the project - with LOVABLE flag
    command: 'LOVABLE=true npm run lovable:preview',
    // Port to serve the preview on
    port: 3000,
    // URL to open in the browser
    url: 'http://localhost:3000',
    // Health check endpoint (for Lovable to verify the preview is running)
    healthCheck: {
      path: '/',
      timeout: 60000, // 60 seconds timeout for preview to start
    },
    // Ensure the preview server has adequate time to start
    wait: 10000,
  },
  
  // Development configuration
  development: {
    // Command to run when developing the project
    command: 'npm run dev',
    // Port to serve the development server on
    port: 8080,
  },
  
  // Project metadata
  project: {
    name: 'Dynasty AI Football Hub',
    description: 'Advanced fantasy football platform with AI-powered dynasty analysis tools',
  },
  
  // Additional settings
  settings: {
    // Disable strict mode for build to prevent errors from failing the build
    strict: false,
    // Timeout for builds (in milliseconds) - 5 minutes
    buildTimeout: 300000,
    // Enable debug mode for more verbose output
    debug: true,
  },
};