# figma-drift

> Detect visual drift between Figma designs and live implementations.

## Quick Start

### Prerequisites

- **Node.js 20+** (required for Playwright compatibility)
- **Figma Personal Access Token** - Get from [Figma Settings → Personal Access Tokens](https://www.figma.com/settings)

### Installation

```bash
# Clone repository
git clone https://github.com/XeroS/figma-drift.git
cd figma-drift

# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

### Configuration

```bash
# Copy example environment file
cp .env.example packages/backend/.env

# Edit packages/backend/.env and add your Figma token
FIGMA_ACCESS_TOKEN=figd_your_token_here
PORT=3000
```

### Usage

You need **3 terminals** to run the full system:

#### Terminal 1: Serve Test Fixture (optional, for testing)

```bash
bun run serve:fixture
# Serves test-fixtures/ on http://localhost:5555
```

#### Terminal 2: Start Backend

```bash
cd packages/backend
npx tsx src/server.ts
# Or with watch mode:
npx tsx watch src/server.ts

# Server will start on http://localhost:3000
```

> **Note:** Backend uses Node.js via `tsx` (not Bun) due to Playwright compatibility on Windows.

#### Terminal 3: Run CLI Checks

```bash
cd packages/cli
bun run dev check \
   --figma "https://www.figma.com/design/YOUR_FILE/Name?node-id=1-2" \
   --live "https://your-staging-site.com/page" \
   --output diff.png
```

**Required Arguments:**
- `--figma <url>` - Figma frame URL (must include `node-id` parameter)
- `--live <url>` - Live page URL

**Optional Arguments:**
- `--threshold <number>` - Diff threshold 0-1 (default: 0.1)
- `--selector <selector>` - CSS selector to target specific element
- `--delay <ms>` - Wait for dynamic content (milliseconds)
- `--header <string>` - HTTP header (can be used multiple times)
- `--cookie <string>` - HTTP cookie (can be used multiple times)
- `--server <url>` - Backend server URL (default: http://localhost:3000)
- `--output <path>` - Save diff image to file

#### Example Output

```
Connecting to backend...
Comparison complete

Spec Diff
   Colors missing: #1e1e1e, #e3e3e3
   Fonts missing: Inter 24px
   Spacing missing: 8px, 12px

Diff image saved to: diff.png

Figma:
```

**Exit Codes:**
- `0` - PASSED (no significant drift)
- `1` - FAILED (drift detected) or error occurred

## Figma URL Formats

The tool supports all Figma URL formats:
- `figma.com/design/...` (new format)
- `figma.com/file/...` (legacy format)

**To get the correct URL:**

1. Open your Figma file
2. Select a frame in the canvas
3. Copy URL from browser address bar
4. Ensure it has a `node-id` parameter (e.g., `?node-id=1-299`)

## API Reference

### POST /api/compare

Compare a Figma design to a live implementation.

**Request:**

```json
{
  "figmaUrl": "https://www.figma.com/design/XXX/Name?node-id=YYY",
  "liveUrl": "https://example.com/page",
  "threshold": 0.1,
  "selector": ".my-component",
  "delay": 1000,
  "headers": { "Authorization": "Bearer ..." },
  "cookies": ["session=123"]
}
```

**Response:**

```json
{
  "success": true,
  "report": {
    "figmaUrl": "...",
    "liveUrl": "...",
    "timestamp": "2026-01-22T...",
    "visual": {
      "diffPercent": 9.57,
      "diffImageBase64": "iVBORw0KGgo..."
    },
    "specs": {
      "specs": {
        "colorDrift": [{ "value": "#1e1e1e", "nodes": [...] }],
        "fontDrift": [{ "value": { "family": "Inter", "size": 24, "weight": 400 }, "nodes": [...] }],
        "spacingDrift": [{ "value": 8, "nodes": [...] }]
      },
      "passed": false
    }
  }
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIGMA_ACCESS_TOKEN` | Figma Personal Access Token | Required |
| `PORT` | Backend server port | 3000 |

### Diff Threshold

Controls sensitivity of pixel diffing:

- `0.05` - Very sensitive, detects tiny differences
- `0.1` - Recommended default (10% tolerance)
- `0.2` - Less sensitive, allows more variation

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend | Hono + @hono/node-server | HTTP framework |
| Screenshots | Playwright | Browser automation |
| Diffing | pixelmatch | Pixel comparison |
| CLI | Commander.js | Argument parsing |
| Package Manager | Bun | Fast dependency management |
| Runtime | Node.js via tsx | Playwright compatibility |
| Language | TypeScript (strict) | Type safety |

## Known Limitations

- **Single-node comparison**: One Figma frame at a time
- **Rate limits**: Figma free tier = 6 API requests/month (get Dev seat for 10/min)
- **Windows**: Backend requires Node.js (Bun + Playwright incompatible)
- **Dimension mismatch**: Images are cropped to smallest common size

## Troubleshooting

### "Figma API error: 429 Too Many Requests"

Your Figma account hit rate limits:
- **Free tier**: 6 requests/month per endpoint
- **Dev/Full seat**: 10 requests/minute

**Solution:** Upgrade to Dev seat ($15/mo) or wait for monthly reset.

### "Figma API error: 403 Forbidden"

- Token is invalid or expired
- Generate new token from Figma settings
- Update `FIGMA_ACCESS_TOKEN` in `.env`

### "Node not found in file"

- Ensure URL includes `node-id` parameter
- Select a frame in Figma, then copy URL from address bar

### "launch: Timeout exceeded" (Playwright)

- On Windows, use Node.js (`npx tsx`) instead of Bun
- First run downloads Chromium (~150MB), may take a minute

### "Image sizes do not match"

Fixed in latest version. If you see this, pull latest code.

## Contact

- **GitHub**: [XeroS/figma-drift](https://github.com/XeroS/figma-drift)
- **Issues**: [GitHub Issues](https://github.com/XeroS/figma-drift/issues)

## License

MIT
