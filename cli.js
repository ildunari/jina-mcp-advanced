#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);

// Check if we're in MCP mode
const isMcpMode = args.includes('--mcp') || args.includes('-m');

// Determine which script to run
const script = isMcpMode ? 'mcp-wrapper.js' : 'index.js';
const fullPath = path.join(__dirname, script);

// Filter out the --mcp flag from args if present
const filteredArgs = args.filter(arg => arg !== '--mcp' && arg !== '-m');

// Spawn the appropriate server
const child = spawn('node', [fullPath, ...filteredArgs], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});