# Jina MCP Advanced Package Documentation

## Overview

The `@ildunari/jina-mcp-advanced` package is a Model Context Protocol (MCP) server that provides access to Jina.AI's advanced web scraping capabilities. It creates a small Express server that exposes endpoints for web scraping with the full power of Jina Reader API.

## Project Structure

```
Jina_MCP_Advanced/
├── index.js           # Main server implementation (executable)
├── package.json       # NPM package configuration
├── README.md          # Quick start documentation
├── DOCUMENTATION.md   # This comprehensive documentation
├── .gitignore        # Git ignore patterns
└── node_modules/     # Dependencies (after npm install)
```

## Features

1. **Full Jina Reader API Implementation**: Supports all Jina Reader parameters including:
   - Multiple output formats (markdown, html, text, screenshot, pageshot)
   - Rendering engines (default, browser)
   - Advanced selectors and wait conditions
   - Image retention and summarization options
   - Cache control and timeouts

2. **Command Line Interface**: 
   - Configurable port
   - Default API key support
   - Headless mode for production use
   - Built-in help documentation

3. **API Endpoints**:
   - `/api/jina/read` - Main scraping endpoint
   - `/health` - Health check endpoint
   - `/api/jina/openapi` - OpenAPI specification

4. **Security**:
   - API key authentication
   - CORS support
   - Error handling and graceful shutdown

## Usage

### As NPX Package

```bash
# Run directly without installation
npx @ildunari/jina-mcp-advanced --apiKey YOUR_API_KEY

# Run on custom port
npx @ildunari/jina-mcp-advanced --port 8080 --apiKey YOUR_API_KEY

# Run in headless mode (less output)
npx @ildunari/jina-mcp-advanced --headless --apiKey YOUR_API_KEY
```

### As MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "Jina-MCP-Advanced": {
      "command": "npx",
      "args": [
        "@ildunari/jina-mcp-advanced@latest",
        "--headless",
        "--apiKey",
        "YOUR_JINA_API_KEY"
      ]
    }
  }
}
```

### API Example

```bash
curl -X POST http://localhost:3000/api/jina/read \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_JINA_API_KEY" \
  -d '{
    "url": "https://example.com",
    "return_format": "markdown",
    "engine": "browser"
  }'
```

## API Parameters

### Required Parameters
- `url` (string): The URL to scrape

### Optional Parameters
- `return_format` (string): Output format - default, markdown, html, text, screenshot, pageshot
- `engine` (string): Rendering engine - default or browser
- `retain_images` (boolean): Whether to keep images in output
- `json_response` (boolean): Force JSON response format
- `summarize_links` (boolean): Include link summaries
- `summarize_images` (boolean): Include image summaries
- `image_caption` (boolean): Generate image captions
- `use_readerlm` (boolean): Use Jina's ReaderLM
- `bypass_cache` (boolean): Skip caching layer
- `target_selector` (string): CSS selector for specific content
- `wait_for_selector` (string): Wait for element before scraping
- `exclude_selector` (string): Elements to exclude
- `timeout` (integer): Request timeout in seconds

## Git Repository Setup

The project is ready to be pushed to GitHub:

1. Create a new repository on GitHub called `jina-mcp-advanced`
2. Push the code:
   ```bash
   git push -u origin main
   ```

## NPM Publishing

To publish to npm:

1. Login to npm:
   ```bash
   npm login
   ```

2. Publish the package:
   ```bash
   npm publish --access public
   ```

## Development

### Local Testing

```bash
# Start the server locally
node index.js --apiKey YOUR_API_KEY

# Test the health endpoint
curl http://localhost:3000/health

# Test the scraping endpoint
curl -X POST http://localhost:3000/api/jina/read \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"url": "https://example.com"}'
```

### Version Management

Update version in package.json:
```bash
npm version patch  # For bug fixes
npm version minor  # For new features
npm version major  # For breaking changes
```

### Continuous Integration

Consider adding GitHub Actions for automated testing and publishing:

```yaml
name: NPM Publish

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## Security Considerations

1. **API Key Management**: 
   - Never commit API keys to the repository
   - Use environment variables or command line arguments
   - Consider using a secrets management system

2. **CORS Configuration**:
   - Currently allows all origins (*)
   - Consider restricting to specific domains in production

3. **Error Handling**:
   - Errors are logged but server continues running
   - Sensitive information is not exposed in error messages

## Troubleshooting

### Common Issues

1. **Module not found errors**:
   ```bash
   npm install
   ```

2. **Permission denied on execution**:
   ```bash
   chmod +x index.js
   ```

3. **API key errors**:
   - Ensure API key is provided via command line or headers
   - Check if the API key is valid

4. **Port already in use**:
   - Use a different port with `--port` flag
   - Kill the process using the port

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and support:
- GitHub Issues: https://github.com/ildunari/jina-mcp-advanced/issues
- NPM Package: https://www.npmjs.com/package/@ildunari/jina-mcp-advanced

## Changelog

### 1.0.0 (Initial Release)
- Full Jina Reader API implementation
- Command line interface
- Health check and OpenAPI endpoints
- NPX executable support
- MCP server compatibility