# Jina MCP Advanced

MCP Server for using Jina.AI Advanced web scraping capabilities.

## Installation

```bash
# Install globally
npm install -g @ildunari/jina-mcp-advanced

# Or use directly with npx
npx @ildunari/jina-mcp-advanced
```

## Usage with MCP Client

Add this to your MCP client configuration:

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

## API Endpoints

- `POST /api/jina/read` - Main endpoint for web scraping
- `GET /health` - Health check endpoint
- `GET /api/jina/openapi` - OpenAPI specification

## Parameters

The `/api/jina/read` endpoint accepts all Jina Reader parameters:

- `url` (required) - URL to scrape
- `return_format` - Output format (markdown, html, text, etc.)
- `engine` - Rendering engine (default or browser)
- And many more options that control the behavior of the scraper

## Command Line Options

- `--port`, `-p` - Port to run the server on (default: 3000)
- `--apiKey`, `-k` - Default Jina API key
- `--headless` - Run in headless mode (less console output)
- `--help` - Show help

## License

MIT