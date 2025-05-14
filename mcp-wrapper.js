#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Parse command line arguments for API key
const args = process.argv.slice(2);
let jinaApiKey = null;

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--apiKey' || args[i] === '-k') && i + 1 < args.length) {
    jinaApiKey = args[i + 1];
    break;
  }
}

if (!jinaApiKey) {
  console.error('Error: Jina API key is required. Use --apiKey flag to provide it.');
  process.exit(1);
}

// Jina Reader Advanced function
async function jina_reader_advanced(params) {
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

  if (!url) {
    throw new Error('URL is required');
  }

  try {
    const headers = {
      'Authorization': `Bearer ${jinaApiKey}`
    };

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

    const apiUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      let errorBody = await response.text();
      try {
        errorBody = JSON.stringify(JSON.parse(errorBody), null, 2);
      } catch(e) { /* Ignore if response body is not JSON */ }
      throw new Error(`Failed to fetch content (${response.status} ${response.statusText}): ${errorBody}`);
    }

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
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      content = `data:${contentType};base64,${buffer.toString('base64')}`;
      return { response_type: 'image_data_url', format: return_format, data_url: content };
    } else {
      return { response_type: 'blob', content_type: contentType, message: "Received unexpected binary data, cannot display directly." };
    }

    return content;

  } catch (error) {
    throw error;
  }
}

// Create the Jina tool definition
const JINA_TOOL = {
  name: 'fetch_web_content',
  description: 'Fetch and extract content from a URL using Jina Reader',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to fetch content from',
      },
      return_format: {
        type: 'string',
        enum: ['default', 'markdown', 'html', 'text', 'screenshot', 'pageshot'],
        default: 'markdown',
        description: 'The desired format for the scraped content',
      },
      engine: {
        type: 'string',
        enum: ['default', 'browser'],
        default: 'default',
        description: 'The rendering engine to use',
      },
      json_response: {
        type: 'boolean',
        default: false,
        description: 'Whether to return JSON response',
      },
      retain_images: {
        type: 'boolean',
        default: false,
        description: 'Whether to retain images in the output',
      },
      summarize_links: {
        type: 'boolean',
        default: true,
        description: 'Whether to summarize links',
      },
      summarize_images: {
        type: 'boolean',
        default: false,
        description: 'Whether to summarize images',
      },
      image_caption: {
        type: 'boolean',
        default: false,
        description: 'Whether to generate image captions',
      },
      use_readerlm: {
        type: 'boolean',
        default: false,
        description: 'Whether to use ReaderLM',
      },
      bypass_cache: {
        type: 'boolean',
        default: false,
        description: 'Whether to bypass cache',
      },
      target_selector: {
        type: 'string',
        description: 'CSS selector for specific content',
      },
      wait_for_selector: {
        type: 'string',
        description: 'Wait for element before scraping',
      },
      exclude_selector: {
        type: 'string',
        description: 'Elements to exclude',
      },
      timeout: {
        type: 'integer',
        description: 'Request timeout in seconds',
      },
    },
    required: ['url'],
  },
};

// Create MCP server
const server = new Server(
  {
    name: 'jina-mcp-advanced',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: [JINA_TOOL],
  };
});

// Handle call tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'fetch_web_content') {
    try {
      const content = await jina_reader_advanced(request.params.arguments);
      return {
        content: [
          {
            type: 'text',
            text: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
  
  return {
    content: [
      {
        type: 'text',
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});

// Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jina MCP Server running on stdio');
}

runServer().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});