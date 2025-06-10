import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Determine if we're in Lovable mode
  const isLovable = process.env.LOVABLE === 'true' || mode === 'lovable';
  
  // Load env file based on mode - prioritize Lovable specific env file if available
  const envFiles = ['.env', `.env.${mode}`];
  
  // Add Lovable-specific env file if in Lovable mode
  if (isLovable && fs.existsSync('.env.lovable')) {
    envFiles.push('.env.lovable');
  }
  
  // Load env vars - ensure we load them in the correct order (later files override earlier ones)
  const env = envFiles.reduce((acc, file) => {
    if (fs.existsSync(file)) {
      const fileEnv = loadEnv(mode, process.cwd(), '', { envFile: file });
      return { ...acc, ...fileEnv };
    }
    return acc;
  }, {});
  
  console.log(`Building for mode: ${mode}, Lovable: ${isLovable}`);
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      (mode === 'development' || isLovable) && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Handle public paths - important for Lovable preview
    base: '/',
    // Improve build settings
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Generate sourcemaps for easier debugging
      sourcemap: true,
      // Minimize output
      minify: 'terser',
      // Handle dependency optimization
      commonjsOptions: {
        include: [/node_modules/],
      },
      // Ensure we don't break on warnings
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react', 
              'react-dom',
              'react-router-dom'
            ],
            ui: [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              // ... other UI libraries
            ],
          },
        },
      },
    },
    // Fix for missing environment variables in production and Lovable mode
    define: {
      // Ensure all environment variables are properly defined
      'process.env': {
        ...Object.entries(env).reduce((acc, [key, value]) => {
          acc[key] = JSON.stringify(value);
          return acc;
        }, {}),
        NODE_ENV: JSON.stringify(mode),
        IS_LOVABLE: JSON.stringify(isLovable),
      },
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: [],
    },
  };
});
