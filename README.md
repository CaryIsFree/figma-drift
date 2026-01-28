# figma-drift

> Detect visual drift between Figma designs and live implementations.

## Quick Start

### Standalone Usage (Recommended)

**Zero-Configuration:** Just run the CLI - it will automatically download Playwright browsers on first run.

**1. Setup Environment**
Choose the command for your platform to create a `.env` file:

**Windows (PowerShell)**:
```powershell
Set-Content -Path .env -Value "FIGMA_ACCESS_TOKEN=figd_your_token_here"
```

**Windows (CMD)**:
```cmd
echo FIGMA_ACCESS_TOKEN=figd_your_token_here > .env
```

**macOS / Linux**:
```bash
echo "FIGMA_ACCESS_TOKEN=figd_your_token_here" > .env
```

**2. Run Comparison**
Run comparison directly via npx:
```bash
npx figma-drift check \
  --figma "https://www.figma.com/design/5a6XqJkOHZVNZZfpwBtqe6/LMAO?node-id=2-1424" \
  --live "https://your-staging-site.com/page" \
  --output diff.png
```

**Configuration Priority:**
1. CLI flags (e.g., `--token`)
2. Environment variables (e.g., `export FIGMA_ACCESS_TOKEN=...`)
3. `.env` file in current directory

**Exit Codes for CI/CD:**
- `0` - PASSED (no significant drift detected)
- `1` - DRIFT DETECTED (visual or specification mismatch)
- `2` - ERROR (API failure, invalid URL, timeout)

---

## Visual Comparison Demo

The tool compares your Figma design against the live implementation to detect visual and technical discrepancies.

### 1. Figma Design
The source of truth. A high-fidelity design from Figma.
![Figma Design](docs/images/figma-design.png)

### 2. Live Implementation
The actual web page as rendered in a browser.
![Live Implementation](docs/images/test-site.png)

### 3. Drift Detection (Result)
A pixel-perfect comparison highlighting differences in red. The tool also detects missing colors, font mismatches, and spacing variations.
![Drift Detection](docs/images/pricing-diff.png)

---

### Organized Results

Every time you run a check, `figma-drift` automatically organizes the results into a timestamped directory structure in your project's root.

**Structure:**
```text
.figma-drift/
└── 2026-01-28_15-30-45-123/
    └── outputs/
        ├── figma.png      # Original Figma design screenshot
        ├── live.png       # Original live implementation screenshot
        ├── diff.png       # Visual difference (red highlights)
        └── report.json    # Machine-readable metadata and spec diff
```

**Pro-tip:** Add `.figma-drift/` to your `.gitignore` to keep your repository clean.
```bash
echo ".figma-drift/" >> .gitignore
```

**Result Retention:** The tool automatically keeps the most recent **50 runs** and rotates out older results to prevent disk bloat.

---

### Full System Setup (Development)

Use this setup when developing or running the backend server.

#### Prerequisites

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
npm run serve:fixture
# Serves test-fixtures/ on http://localhost:5555
```

#### Terminal 2: Start Backend

```bash
cd packages/backend
npm run dev
# Or with watch mode:
# npm run dev (already includes watch in scripts)

# Server will start on http://localhost:3000
```

> **Note:** Backend uses Node.js via `tsx` for Playwright compatibility on Windows.

#### Terminal 3: Run CLI Checks

```bash
cd packages/cli
npm run dev -- check \
   --figma "https://www.figma.com/design/YOUR_FILE/Name?node-id=1-2" \
   --live "https://your-staging-site.com/page" \
   --output diff.png
```

**Required Arguments:**
- `--figma <url>` - Figma frame URL (must include `node-id` parameter)
- `--live <url>` - Live page URL

**Optional Arguments:**
- `--token <string>` - Figma access token (overrides .env and environment variables)
- `--threshold <number>` - Diff threshold 0-1 (default: 0.1)
- `--selector <selector>` - CSS selector to target specific element
- `--delay <ms>` - Wait for dynamic content (milliseconds)
- `--header <string>` - HTTP header (can be used multiple times)
- `--cookie <string>` - HTTP cookie (can be used multiple times)
- `--output <path>` - Save diff image to file

#### Example Output

```
Connecting to Figma...
📦 Browser installation complete
Comparing designs...

Spec Diff
   Colors missing: #1e1e1e, #e3e3e3
   Fonts missing: Inter 24px
   Spacing missing: 8px, 12px

📂 Results saved to: .figma-drift/2026-01-28_15-30-45-123/
Diff image saved to: diff.png

Visual diff: 10.10%
```

**Exit Codes:**
- `0` - PASSED (no significant drift)
- `1` - DRIFT DETECTED (visual or specification mismatch)
- `2` - ERROR (API failure, invalid URL, timeout)

---

## Full System Setup (Development)

For development and running the backend server, use this setup.

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
    "timestamp": "2026-01-28T...",
    "visual": {
      "diffPercent": 9.57,
      "diffPixels": 124500,
      "totalPixels": 1200000,
      "diffImageBase64": "iVBORw0KGgo...",
      "figmaImageBase64": "...",
      "liveImageBase64": "..."
    },
    "specs": {
      "colorDrift": [...],
      "fontDrift": [...],
      "spacingDrift": [...]
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

**For Standandalone CLI (.env file in current directory):**
| Variable | Description | Required |
|----------|-------------|---------|
| `FIGMA_ACCESS_TOKEN` | Figma Personal Access Token | Yes |

**For Development (packages/backend/.env):**
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
| Package Manager | npm | Fast dependency management |
| Runtime | Node.js via tsx | Playwright compatibility |
| Language | TypeScript (strict) | Type safety |

## Tester Guide: Jargon vs. Meaning

| Technical Term | Designer Term | What it does |
|----------------|---------------|--------------|
| `node-id` | **Frame Link** | Right-click any frame in Figma > Copy link. |
| `threshold` | **Strictness** | How picky the tool is. (0.1 = Standard, 0.05 = Ultra picky). |
| `selector` | **Target Component** | Focus comparison on one part (e.g., `.header`). |

## Known Limitations

- **Single-node comparison**: One Figma frame at a time
- **Rate limits**: Figma free tier = 6 API requests/month (requires Figma Professional/Dev tier for increased limits)
- **Windows**: Backend requires Node.js (Playwright compatibility)
- **Dimension mismatch**: Images are cropped to smallest common size

## Troubleshooting

### "Figma API error: 429 Too Many Requests"

Your Figma account hit rate limits:
- **Free tier**: 6 requests/month per endpoint
- **Dev/Full seat**: 10 requests/minute

**Solution:** Rate limit exceeded—requires Figma Professional/Dev tier for increased limits or wait for monthly reset.

### "Figma API error: 403 Forbidden"

- Token is invalid or expired
- Generate new token from Figma settings
- Update `FIGMA_ACCESS_TOKEN` in `.env`

### "Node not found in file"

- Ensure URL includes `node-id` parameter
- Select a frame in Figma, then copy URL from address bar

### "launch: Timeout exceeded" (Playwright)

First run downloads Chromium (~150MB), may take a minute. Just wait.

### "CLI: command not found"

After running `npm link`, use `figma-drift` command directly:
```bash
npm link --workspace=@figma-drift/cli
figma-drift check --figma "..." --live "..."
```

### "figma-drift: command not found"

Fixed in latest version. If you see this, pull latest code.

## Contact

- **GitHub**: [XeroS/figma-drift](https://github.com/XeroS/figma-drift)
- **Issues**: [GitHub Issues](https://github.com/XeroS/figma-drift/issues)

## License

MIT
