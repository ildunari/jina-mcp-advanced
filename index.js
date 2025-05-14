#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fetch from 'node-fetch';

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    type: 'number',
    default: 3000,
    description: 'Port to run the server on'
  })
  .option('apiKey', {
    alias: 'k',
    type: 'string',
    description: 'Default Jina API key (optional)'
  })
  .option('headless', {
    type: 'boolean',
    default: false,
    description: 'Run in headless mode'
  })
  .help()
  .argv;

const app = express();
app.use(cors());
app.use(express.json());

// Store the API key if provided
const defaultJinaApiKey = argv.apiKey;

// Jina Reader Advanced function
async function jina_reader_advanced(params, userSettings) {
  // Destructure parameters with updated default for return_format
  const {
    url,
    return_format = 'markdown',
    engine = 'default',
    retain_images = false,
    json_response = false,
    summarize_links = true,
    summarize_images = false,
    image_caption = false,
    use_readerlm = false,
    bypass_cache = false,
    target_selector,
    wait_for_selector,
    exclude_selector,
    timeout
  } = params;

  // Get API key from user settings
  const { jinaApiKey } = userSettings;

  // Validate required parameters
  if (!url) {
    throw new Error('URL is required');
  }
  if (!jinaApiKey) {
     throw new Error('Jina API Key is required');
  }

  try {
    // Initialize headers with mandatory Authorization
    const headers = {
      'Authorization': `Bearer ${jinaApiKey}`
    };

    // Add headers based on parameters
    if (engine !== 'default') {
      headers['X-Engine'] = engine;
    }
    if (return_format !== 'default') {
      headers['X-Return-Format'] = return_format;
    }
    headers['X-Retain-Images'] = retain_images ? 'true' : 'none';
    
    if (json_response) {
        headers['Accept'] = 'application/json';
    }
    if (!summarize_links) {
        headers['X-With-Links-Summary'] = 'false';
    } else {
        headers['X-With-Links-Summary'] = 'true';
    }
    if (summarize_images) {
        headers['X-With-Images-Summary'] = 'true';
    }
    if (image_caption) {
        headers['X-Image-Caption'] = 'true';
    }
    if (use_readerlm) {
        headers['X-Reader-LM'] = 'true';
    }
    if (bypass_cache) {
        headers['X-No-Cache'] = 'true';
    }
    if (target_selector) {
      headers['X-Target-Selector'] = target_selector;
    }
    if (wait_for_selector) {
      headers['X-Wait-For-Selector'] = wait_for_selector;
    }
    if (exclude_selector) {
      headers['X-Exclude-Selector'] = exclude_selector;
    }
    if (timeout && Number.isInteger(timeout) && timeout > 0) {
      headers['X-Timeout'] = timeout.toString();
    }

    // Construct the API URL
    const apiUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;

    console.log("Fetching Jina Reader URL:", apiUrl);
    console.log("Using Headers:", JSON.stringify(headers, null, 2));

    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });

    // Handle non-successful responses
    if (!response.ok) {
       let errorBody = await response.text();
       try {
         errorBody = JSON.stringify(JSON.parse(errorBody), null, 2);
       } catch(e) { /* Ignore if response body is not JSON */ }
       console.error(`Jina API Error (${response.status}): ${errorBody}`);
       throw new Error(`Failed to fetch content (${response.status} ${response.statusText}): ${errorBody}`);
    }

    // Process the response based on Content-Type
    const contentType = response.headers.get('content-type') || '';
    let content;

    if (json_response || contentType.includes('application/json')) {
       content = await response.json();
       if (!json_response && typeof content === 'object' && content !== null) {
           return { response_type: 'json_received_unexpectedly', data: content };
       }
    } else if (contentType.includes('text/')) {
       content = await response.text();
    } else if (contentType.includes('image/')) {
       // For image responses, we need to handle differently in a Node.js environment
       const arrayBuffer = await response.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       content = `data:${contentType};base64,${buffer.toString('base64')}`;
       return { response_type: 'image_data_url', format: return_format, data_url: content };
    } else {
      return { response_type: 'blob', content_type: contentType, message: "Received unexpected binary data, cannot display directly." };
    }

    return content;

  } catch (error) {
    console.error("Error in jina_reader_advanced:", error);
    throw error;
  }
}

// API endpoint
app.post('/api/jina/read', async (req, res) => {
  try {
    const params = req.body;
    const apiKey = req.headers['x-api-key'] || defaultJinaApiKey;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required. Provide it as an x-api-key header or with the --apiKey flag when starting the server.' });
    }
    
    const result = await jina_reader_advanced(params, { jinaApiKey: apiKey });
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add OpenAPI specification endpoint
app.get('/api/jina/openapi', (req, res) => {
  const openApiSpec = {
    "openapi": "3.0.0",
    "info": {
      "title": "Jina Advanced MCP API",
      "version": "1.0.0",
      "description": "API for advanced web scraping using Jina Reader"
    },
    "paths": {
      "/api/jina/read": {
        "post": {
          "summary": "Scrape and extract content from a web page",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["url"],
                  "properties": {
                    "url": {
                      "type": "string",
                      "description": "The URL of the web page to scrape and extract content from."
                    },
                    "engine": {
                      "type": "string",
                      "enum": ["default", "browser"],
                      "default": "default",
                      "description": "The rendering engine. Use 'browser' for JavaScript-heavy dynamic web pages."
                    },
                    "return_format": {
                      "type": "string",
                      "enum": ["default", "markdown", "html", "text", "screenshot", "pageshot"],
                      "default": "markdown",
                      "description": "The desired format for the scraped content."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Successful response with extracted content",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  
  res.json(openApiSpec);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: '@ildunari/jina-mcp-advanced',
    version: '1.0.0'
  });
});

// Start server
const PORT = argv.port;
const server = app.listen(PORT, () => {
  console.log(`Jina MCP Advanced Server running on port ${PORT}`);
  if (!argv.headless) {
    console.log(`
=============================================================
  @ildunari/jina-mcp-advanced server is running!
  
  Endpoints:
  - POST http://localhost:${PORT}/api/jina/read
  - GET  http://localhost:${PORT}/health
  - GET  http://localhost:${PORT}/api/jina/openapi
  
  API Key: ${defaultJinaApiKey ? "Using provided API key" : "No default API key (required in request headers)"}
=============================================================
    `);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the server running despite uncaught exceptions
});