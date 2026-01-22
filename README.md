# figma-drift

> Detect visual drift between Figma designs and live implementations.
> Last Updated: January 20, 2026

## What is figma-drift?

**figma-drift** detects visual differences between Figma designs and live implementations. It automatically:
- Extracts design specs (colors, fonts, spacing) from Figma
- Captures screenshots of your live site
- Compares them using pixel-level diffing
- Generates a detailed drift report

**One-Liner:** Know when your site doesn't match the design—before users do.

## Project Status

| Phase | Status | Notes |
|--------|--------|-------|
| **1A: ICP + Architecture** | ✅ Complete | Architecture spec finalized |
| **1B: Your Environment** | ✅ Complete | CLI + backend fully working |
| **1C: ICP Environment** | 🔜 Next | Need 2 external testers |

## Quick Start

### Prerequisites

- **Node.js 20+** (required for Playwright compatibility)
- **Bun** (`npm install -g bun`) for package management
- **Figma Personal Access Token** - Get from [Figma Settings → Personal Access Tokens](https://www.figma.com/settings)
- **Figma Dev/Full seat** - Free tier has severe API rate limits (6 requests/month)

### Installation

```bash
# Clone the repository
git clone https://github.com/XeroS/figma-drift.git
cd figma-drift

# Install dependencies
bun install

# Install Playwright browsers (first time only)
bunx playwright install chromium
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
- `--server <url>` - Backend server URL (default: http://localhost:3000)
- `--output <path>` - Save diff image to file

#### Example Output

```
⠹ Connecting to backend...
✓ Comparison complete

📊 Drift Report
================
Figma:  https://www.figma.com/design/...
Live:   http://localhost:5555/brand-card.html
Time:   2026-01-20T20:06:51.000Z

🖼️  Visual Diff
   Difference: 9.57%

📐 Spec Diff
   Colors missing: #1e1e1e, #e3e3e3
   Fonts missing: Inter 24px
   Spacing missing: 8px, 12px

💾 Diff image saved to: diff.png

❌ FAILED - Drift detected
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
3. Copy the URL from the browser address bar
4. Ensure it has a `node-id` parameter (e.g., `?node-id=1-299`)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED BACKEND CORE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐      ┌──────────────┐      ┌────────────┐     │
│  │ Figma   │      │  Playwright  │      │ pixelmatch │     │
│  │  API    │      │ Screenshots  │      │  diffing   │     │
│  └────┬────┘      └──────┬───────┘      └─────┬──────┘     │
│       │                  │                    │            │
│       ▼                  ▼                    ▼            │
│  design specs       live.png              diff report      │
│                                           + diff.png       │
└─────────────────────────────────────────────────────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                    ┌──────────────┐
    │     CLI     │                    │ Figma Plugin │
    │   (MVT)     │                    │    (MVP)     │
    └─────────────┘                    └──────────────┘
```

### Project Structure

```
figma-drift/
├── packages/
│   ├── backend/          # Core comparison engine
│   │   ├── src/
│   │   │   ├── lib/         # Shared utilities
│   │   │   ├── types.ts     # TypeScript interfaces
│   │   │   ├── figma/       # Figma API integration
│   │   │   ├── capture/     # Playwright screenshots
│   │   │   ├── compare/     # Visual & spec diffing
│   │   │   └── server.ts    # Hono HTTP server
│   │   ├── tests/           # Unit tests
│   │   └── package.json
│   ├── cli/              # Command-line interface
│   │   ├── src/cli.ts
│   │   └── package.json
│   └── figma-plugin/     # Future: Figma plugin wrapper
├── test-fixtures/        # HTML test pages
├── docs/                 # Project documentation
├── .env.example
├── package.json
└── README.md
```

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test packages/backend/tests/figma-api.test.ts

# Watch mode during development
bun test --watch
```

### Building

```bash
# Build all packages
bun run build

# Build specific package
bun run build:backend
bun run build:cli
```

### Type Checking

```bash
# Type check all packages
bun run typecheck

# Type check specific package
cd packages/backend && bun run typecheck
```

## API Reference

### POST /api/compare

Compare a Figma design to a live implementation.

**Request:**
```json
{
  "figmaUrl": "https://www.figma.com/design/XXX/Name?node-id=YYY",
  "liveUrl": "https://example.com/page",
  "threshold": 0.1
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "figmaUrl": "...",
    "liveUrl": "...",
    "timestamp": "2026-01-20T...",
    "visual": {
      "diffPercent": 9.57,
      "diffImageBase64": "iVBORw0KGgo..."
    },
    "specs": {
      "colorDrift": ["#1e1e1e", "#e3e3e3"],
      "fontDrift": [{ "family": "Inter", "size": 24, "weight": 400 }],
      "spacingDrift": [8, 12]
    },
    "passed": false
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
- Solution: Upgrade to Dev seat ($15/mo) or wait for monthly reset

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

## Roadmap

### Phase 1C: ICP Environment (Next)
- [ ] Find 2-3 external testers
- [ ] Run on their Figma + staging
- [ ] Collect feedback
- [ ] Validate willingness to pay

### MVP (Future)
- [ ] Figma plugin UI
- [ ] User authentication
- [ ] Historical tracking

## License

MIT

## Contact

- **GitHub**: [XeroS/figma-drift](https://github.com/XeroS/figma-drift)
- **Issues**: [GitHub Issues](https://github.com/XeroS/figma-drift/issues)
