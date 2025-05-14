#!/usr/bin/env node

import fetch from 'node-fetch';

const API_KEY = process.env.JINA_API_KEY || process.argv[2];
const PORT = process.env.PORT || 3000;

if (!API_KEY) {
  console.error('Please provide a Jina API key as the first argument or set JINA_API_KEY environment variable');
  process.exit(1);
}

async function test() {
  console.log('Testing Jina MCP Advanced Server...\n');

  // Test health endpoint
  console.log('1. Testing health endpoint...');
  try {
    const healthRes = await fetch(`http://localhost:${PORT}/health`);
    const health = await healthRes.json();
    console.log('✓ Health check passed:', health);
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
  }

  // Test OpenAPI endpoint
  console.log('\n2. Testing OpenAPI endpoint...');
  try {
    const openApiRes = await fetch(`http://localhost:${PORT}/api/jina/openapi`);
    const openApi = await openApiRes.json();
    console.log('✓ OpenAPI spec retrieved:', openApi.info.title);
  } catch (error) {
    console.error('✗ OpenAPI fetch failed:', error.message);
  }

  // Test main scraping endpoint
  console.log('\n3. Testing scraping endpoint...');
  try {
    const scrapeRes = await fetch(`http://localhost:${PORT}/api/jina/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        url: 'https://example.com',
        return_format: 'markdown'
      })
    });
    
    if (scrapeRes.ok) {
      const result = await scrapeRes.json();
      console.log('✓ Scraping successful');
      console.log('Response type:', typeof result);
      console.log('Content preview:', 
        typeof result === 'string' ? result.substring(0, 100) + '...' : JSON.stringify(result).substring(0, 100) + '...'
      );
    } else {
      const error = await scrapeRes.json();
      console.error('✗ Scraping failed:', error);
    }
  } catch (error) {
    console.error('✗ Scraping request failed:', error.message);
  }

  // Test with invalid URL
  console.log('\n4. Testing error handling (invalid URL)...');
  try {
    const errorRes = await fetch(`http://localhost:${PORT}/api/jina/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        return_format: 'markdown'
        // Missing URL
      })
    });
    
    const error = await errorRes.json();
    console.log('✓ Error handling works:', error.error);
  } catch (error) {
    console.error('✗ Error handling test failed:', error.message);
  }

  // Test without API key
  console.log('\n5. Testing authentication (no API key)...');
  try {
    const authRes = await fetch(`http://localhost:${PORT}/api/jina/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://example.com'
      })
    });
    
    if (authRes.status === 401) {
      const error = await authRes.json();
      console.log('✓ Authentication check works:', error.error);
    } else {
      console.error('✗ Authentication check failed - expected 401 status');
    }
  } catch (error) {
    console.error('✗ Authentication test failed:', error.message);
  }

  console.log('\n✅ All tests completed!');
}

// Run tests
console.log(`Starting tests against server on port ${PORT}...`);
console.log('Make sure the server is running with: node index.js --apiKey YOUR_API_KEY\n');

test().catch(console.error);