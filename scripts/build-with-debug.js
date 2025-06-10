#!/usr/bin/env node

/**
 * Enhanced build script for troubleshooting Lovable preview builds
 * This script runs the build process with additional error reporting
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Timestamp for log files
const timestamp = new Date().toISOString().replace(/:/g, '-');
const logFile = path.resolve(logsDir, `build-${timestamp}.log`);
const errorLogFile = path.resolve(logsDir, `build-error-${timestamp}.log`);

// Create log streams
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
const errorLogStream = fs.createWriteStream(errorLogFile, { flags: 'a' });

console.log(`📝 Logging build output to ${logFile}`);
console.log(`📝 Logging build errors to ${errorLogFile}`);

// Function to log with timestamps
function logWithTimestamp(message, isError = false) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  
  if (isError) {
    errorLogStream.write(formattedMessage + '\n');
    console.error(formattedMessage);
  } else {
    logStream.write(formattedMessage + '\n');
    console.log(formattedMessage);
  }
}

// Set environment variable to enable additional debug logging
process.env.DEBUG = 'vite:*';

// Determine build mode - check if running in Lovable environment
const isLovable = process.env.LOVABLE === 'true';

// Choose the appropriate build command based on environment
const buildCommand = isLovable ? 'lovable:build' : 'build';

// Log build environment information
logWithTimestamp(`Build environment: ${isLovable ? 'Lovable Preview' : 'Standard Build'}`);
logWithTimestamp(`Using build command: npm run ${buildCommand}`);

// Check for required environment files
if (isLovable) {
  if (fs.existsSync('.env.lovable')) {
    logWithTimestamp('Found .env.lovable file for Lovable build');
  } else {
    logWithTimestamp('WARNING: No .env.lovable file found. Creating one with default values...', true);
    
    // Create a basic .env.lovable file if it doesn't exist
    const defaultLovableEnv = 
`# Lovable environment configuration
VITE_SUPABASE_URL=https://example-lovable.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example
VITE_DEV_MODE=false
NODE_ENV=production
LOVABLE=true`;
    
    fs.writeFileSync('.env.lovable', defaultLovableEnv);
    logWithTimestamp('Created default .env.lovable file');
  }
}

// Setup additional environment variables for the build
const buildEnv = {
  ...process.env,
  FORCE_COLOR: 'true',
  DEBUG: 'vite:*',
  LOVABLE: isLovable ? 'true' : 'false'
};

// Run the build command
logWithTimestamp('Starting build process...');

const buildProcess = spawn('npm', ['run', buildCommand], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: buildEnv
});

// Handle stdout
buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  logWithTimestamp(output);
});

// Handle stderr
buildProcess.stderr.on('data', (data) => {
  const errorOutput = data.toString();
  logWithTimestamp(errorOutput, true);
});

// Handle process completion
buildProcess.on('close', (code) => {
  if (code === 0) {
    logWithTimestamp('✅ Build completed successfully!');
    
    // Verify build output
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      logWithTimestamp(`Build output directory exists at ${distDir}`);
      
      // Check for critical files
      const indexHtml = path.resolve(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        logWithTimestamp('Found index.html in build output');
      } else {
        logWithTimestamp('WARNING: index.html not found in build output', true);
      }
      
      // List assets directory
      const assetsDir = path.resolve(distDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        logWithTimestamp('Found assets directory in build output');
        const assets = fs.readdirSync(assetsDir);
        logWithTimestamp(`Assets directory contains ${assets.length} files`);
      } else {
        logWithTimestamp('WARNING: assets directory not found in build output', true);
      }
    } else {
      logWithTimestamp('WARNING: Build output directory not found', true);
    }
  } else {
    logWithTimestamp(`❌ Build failed with exit code ${code}`, true);
    
    // Check for common errors in the log files
    analyzeErrorLogs();
  }
  
  // Close log streams
  logStream.end();
  errorLogStream.end();
});

// Analyze error logs for common problems
function analyzeErrorLogs() {
  try {
    const errorLog = fs.readFileSync(errorLogFile, 'utf8');
    
    logWithTimestamp('🔍 Analyzing build errors...', true);
    
    // Check for common error patterns
    const errorPatterns = [
      { pattern: /Module not found/i, message: 'Missing module dependencies' },
      { pattern: /Failed to resolve import/i, message: 'Import resolution error' },
      { pattern: /Unexpected token/i, message: 'Syntax error in code' },
      { pattern: /Cannot find module/i, message: 'Missing module' },
      { pattern: /ReferenceError/i, message: 'Reference error (undefined variable)' },
      { pattern: /TypeError/i, message: 'Type error' },
      { pattern: /chunk.*failed/i, message: 'Chunk loading failure' },
      { pattern: /ENOENT/i, message: 'File not found error' },
      { pattern: /out of memory/i, message: 'Out of memory error' },
      { pattern: /Error loading env/i, message: 'Environment variable loading error' },
      { pattern: /undefined variable/i, message: 'Undefined variable reference' },
      { pattern: /process is not defined/i, message: 'Process variable not defined - environment issue' },
      { pattern: /No matching export/i, message: 'Missing export in module' }
    ];
    
    const foundIssues = errorPatterns
      .filter(({ pattern }) => pattern.test(errorLog))
      .map(({ message }) => message);
    
    if (foundIssues.length > 0) {
      logWithTimestamp('🛑 Potential issues found:', true);
      foundIssues.forEach(issue => {
        logWithTimestamp(`  - ${issue}`, true);
      });
      
      // Lovable-specific guidance
      if (isLovable) {
        logWithTimestamp('\n🔧 Lovable-specific troubleshooting:', true);
        logWithTimestamp('  - Check that the .env.lovable file has the correct environment variables', true);
        logWithTimestamp('  - Verify lovable.config.js has the correct build and preview settings', true);
        logWithTimestamp('  - Ensure vite.config.ts properly handles the Lovable mode', true);
      }
    }
    
    logWithTimestamp('👉 Check the complete error log for details', true);
  } catch (error) {
    logWithTimestamp(`Error analyzing logs: ${error.message}`, true);
  }
}