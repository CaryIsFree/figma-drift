# figma-drift

> Detect visual drift between Figma designs and live implementations.
> Last Updated: January 19, 2026

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
| **1B: Your Environment** | ✅ Complete | CLI + backend working |
| **1C: ICP Environment** | Pending | Need 2 external testers |

## Quick Start

### Prerequisites

- **Node.js 20+**
- **Bun** (`npm install -g bun`)
- **Figma Personal Access Token** - Get from [Figma Settings → Personal Access Tokens](https://www.figma.com/settings/personal-access-tokens)
- **A test Figma file** with a frame you want to compare

### Installation

```bash
# Clone the repository
git clone https://github.com/XeroS/figma-drift.git
cd figma-drift

# Install dependencies
bun install
```

### Configuration

```bash
# Copy example environment file
cp .env.example packages/backend/.env

# Edit packages/backend/.env and add your Figma token
FIGMA_ACCESS_TOKEN=your_figma_personal_access_token_here
PORT=3000
```

### Usage

#### Start the Backend

```bash
# Terminal 1: Start backend server
cd packages/backend
bun run dev

# Server will start on http://localhost:3000
# You'll see: "Server running on http://localhost:3000"
```

#### Run CLI Checks

```bash
# Terminal 2: Compare Figma design to live site
cd packages/cli
bun run dev check \
  --figma "https://www.figma.com/file/YOUR_FILE/Name?node-id=1-2" \
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

#### CLI Output

```
📊 Drift Report
================
Figma:  https://www.figma.com/file/...
Live:   https://your-staging-site.com/page
Time:   2026-01-19T20:06:51.000Z

🖼️  Visual Diff
   Difference: 2.35%

📐 Spec Diff
   Colors missing: #ff0000
   No spec drift detected ✅

✅ PASSED - No significant drift detected
```

**Exit Codes:**
- `0` - PASSED (no significant drift)
- `1` - FAILED (drift detected) or error occurred

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED BACKEND CORE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐        ┌──────────────┐       ┌────────┐  │
│  │  Figma   │        │  Playwright   │       │pixelmatch│  │
│  │   API    │        │  Screenshots  │       │  diffing │  │
│  └─────────┘        └──────────────┘       └────────┘  │
│       │                   │                   │       │        │  │
│       ▼                   ▼                   │       ▼        │  │
│  design.json         live.png            report.json   │        │
│                                          diff.png         │
└─────────────────────────────────────────────────────────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
    ┌─────────┐                         ┌──────────────┐
    │   CLI   │                         │Figma Plugin  │
    │         │                         │    (MVP)    │
    └─────────┘                         └──────────────┘
```

### Project Structure

```
figma-drift/
├── packages/
│   ├── backend/          # Core comparison engine (deployed)
│   │   ├── src/
│   │   │   ├── lib/         # Shared utilities
│   │   │   ├── types.ts      # TypeScript interfaces
│   │   │   ├── figma/       # Figma API integration
│   │   │   ├── capture/     # Playwright screenshots
│   │   │   ├── compare/     # Visual & spec diffing
│   │   │   └── server.ts    # Hono HTTP server
│   │   ├── tests/           # Unit tests
│   │   └── package.json
│   ├── cli/              # Command-line interface
│   │   ├── src/cli.ts
│   │   └── package.json
│   └── figma-plugin/      # Future: Figma plugin wrapper
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
cd packages/cli && bun run typecheck
```

### Linting

**Note:** ESLint configuration is deferred to future PR to avoid scope creep in initial implementation.

## API

### Backend Endpoints

#### POST /api/compare

Compare a Figma design to a live implementation.

**Request:**
```json
{
  "figmaUrl": "https://www.figma.com/file/XXX/Name?node-id=YYY",
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
    "timestamp": "2026-01-19T...",
    "visual": {
      "diffPercent": 2.35,
      "diffImageBase64": "data:image/png;base64,..."
    },
    "specs": {
      "colorDrift": ["#ff0000"],
      "fontDrift": [
        { "family": "Inter", "size": 16, "weight": 400 }
      ],
      "spacingDrift": [8, 16]
    },
    "passed": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "figmaUrl and liveUrl are required"
}
```

#### GET /health

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

### Thresholds

- **Visual Diff Threshold**: Controls sensitivity of pixel diffing
  - Lower values (0.05) = More sensitive, detects smaller differences
  - Higher values (0.2) = Less sensitive, allows more variation
  - Recommended: 0.1 (10% tolerance)

## Technical Details

### Tech Stack

| Layer | Technology | Purpose |
|--------|-------------|---------|
| **Backend** | Hono | Lightweight HTTP framework |
| **Screenshots** | Playwright | Browser automation & capture |
| **Diffing** | pixelmatch | Pixel-level image comparison |
| **CLI** | Commander.js | Argument parsing |
| **Runtime** | Bun | Fast JavaScript runtime |
| **Language** | TypeScript (strict mode) | Type safety |

### Key Features

1. **Figma Integration**
   - Fetches design specs via REST API
   - Extracts colors, fonts, spacing from nodes
   - Supports both `/file/` and `/design/` URL formats

2. **Screenshot Capture**
   - Headless browser automation
   - Viewport matching Figma dimensions
   - Waits for network idle before capture

3. **Visual Diffing**
   - Pixel-level comparison using pixelmatch
   - Generates diff overlay images
   - Calculates percentage difference

4. **Spec Comparison**
   - Detects missing colors
   - Detects missing fonts (with 2px tolerance)
   - Detects spacing differences (with 2px tolerance)

## Known Limitations

- **Single-node comparison**: Only one Figma frame at a time
- **Authentication**: No user system yet (uses shared token)
- **Rate limits**: Figma API has rate limits (respects them automatically)
- **Browser support**: Uses Chromium via Playwright

## Roadmap

### Phase 1C: ICP Environment (Current)
- [ ] Find 2-3 external testers
- [ ] Run on their Figma + staging
- [ ] Collect feedback on UX and performance
- [ ] Validate "Would you pay $20/mo?"

### MVP (Future)
- [ ] Figma plugin UI
- [ ] User authentication (Figma OAuth)
- [ ] Historical tracking
- [ ] Team workspaces

### MLP (Future)
- [ ] Polished UI
- [ ] Improved error messages
- [ ] Email notifications
- [ ] CI/CD integration

## Contributing

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes
# ... edit files ...

# 3. Type check
bun run typecheck

# 4. Test
bun test

# 5. Build
bun run build

# 6. Commit
git add .
git commit -m "feat(scope): description"

# 7. Push
git push -u origin feature/your-feature
```

### Code Style

- **TypeScript**: Strict mode enabled
- **No `any` types**: All code properly typed
- **Explicit return types**: All functions have declared return types
- **Shared utilities**: Common functions in `lib/utils.ts`
- **Barrel exports**: Clean imports via `index.ts` files

## Troubleshooting

### "Figma API error: 403 Forbidden"

- Your personal access token is invalid or expired
- Generate a new token from Figma settings
- Update `FIGMA_ACCESS_TOKEN` in `.env`

### "Node not found in file X"

- Ensure URL includes `node-id` parameter
- Use the full frame URL from Figma (click frame → Copy link)

### "Playwright not found"

- Playwright downloads browsers on first run
- This may take 1-2 minutes on first launch
- Check network connection if stuck

### "No diff image saved"

- Check you specified `--output` flag
- Ensure you have write permissions to the output directory

## License

[Add your license here - MIT recommended for open source]

## Contact

- **GitHub**: [XeroS/figma-drift](https://github.com/XeroS/figma-drift)
- **Issues**: [GitHub Issues](https://github.com/XeroS/figma-drift/issues)
