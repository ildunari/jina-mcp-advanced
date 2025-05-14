# Jina MCP Advanced

MCP Server for using Jina.AI Advanced web scraping capabilities.

## Installation

```bash
# Install globally
npm install -g @ildunari/jina-mcp-advanced

# Or use directly with npx
npx @ildunari/jina-mcp-advanced
```

## Usage with MCP Client (Claude Desktop)

Add this to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "JinaAI-Advanced-MCP": {
      "command": "npx",
      "args": [
        "-y",
        "@ildunari/jina-mcp-advanced@latest",
        "--mcp",
        "--apiKey",
        "YOUR_JINA_API_KEY"
      ]
    }
  }
}
```

Or if you have it installed globally:

```json
{
  "mcpServers": {
    "JinaAI-Advanced-MCP": {
      "command": "jina-mcp",
      "args": [
        "--mcp",
        "--apiKey",
        "YOUR_JINA_API_KEY"
      ]
    }
  }
}
```

## Usage Modes

The package can run in two modes:

1. **Express Server Mode** (default): Runs as a standalone HTTP server
   ```bash
   npx @ildunari/jina-mcp-advanced --apiKey YOUR_API_KEY
   ```

2. **MCP Mode**: Runs as an MCP server for Claude Desktop
   ```bash
   npx @ildunari/jina-mcp-advanced --mcp --apiKey YOUR_API_KEY
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