# Figma Drift

> Detect visual drift between Figma designs and live implementations.

## Prerequisites

Figma Drift requires a **Figma Personal Access Token** to fetch design data. [Generate a token](https://www.figma.com/settings) before proceeding.

### Setup Configuration
Depending on your use case, create a `.env` file in the appropriate location:

-   **CLI Usage:** Create `.env` in your **current directory** containing only:
    ```bash
    FIGMA_ACCESS_TOKEN=figd_your_token_here
    ```
-   **Development Setup:** Create **`packages/backend/.env`**. This file supports:
    -   `FIGMA_ACCESS_TOKEN` (Required)
    -   `PORT` (Default: 3000)
    -   `CORS_ALLOWED_ORIGINS`, `ALLOW_LOCALHOST` (Optional)

---

## Test Fixtures

Test fixtures are local HTML files stored in the `/test-fixtures/` directory at the repository root. They are designed to simulate live websites, enabling you to test Figma Drift without requiring a real hosted environment.

To utilize these fixtures, run the `npx serve test-fixtures -p 5555` command. This starts a local server at `http://localhost:5555`, allowing you to perform comparisons against local files. Using fixtures ensures a consistent testing environment and is the recommended way to verify tool functionality during development.

---

## Quick Start

### Prerequisites

You need a **Figma Personal Access Token**. Get one from [Figma Settings → Personal Access Tokens](https://www.figma.com/settings).

**For CLI use:** Create a `.env` file in your current directory:
```bash
# macOS / Linux
echo "FIGMA_ACCESS_TOKEN=figd_your_token_here" > .env

# Windows (PowerShell)
Set-Content -Path .env -Value "FIGMA_ACCESS_TOKEN=figd_your_token_here"

# Windows (CMD)
echo FIGMA_ACCESS_TOKEN=figd_your_token_here > .env
```

**For development:** Copy to backend directory:
```bash
cp packages/backend/.env.example packages/backend/.env
# Then edit packages/backend/.env with your token
```

> **Token priority:** CLI flags (`--token`) > Environment variables > `.env` file

### Run a Comparison

Use the CLI to compare your Figma design against a live implementation:

**For live sites:**
```bash
npx figma-drift check \
  --figma "<YOUR_FIGMA_FRAME_URL>" \
  --live "<YOUR_LIVE_SITE_URL>"
```

**For local HTML files (like test fixtures):**
```bash
npx figma-drift check \
  --figma "<YOUR_FIGMA_FRAME_URL>" \
  --live "http://localhost:5555/your-file.html"
```

> **Note:** Local HTML files must be served via HTTP. The `npx serve test-fixtures -p 5555` command serves files from `test-fixtures/` on `http://localhost:5555`.

### What Happens

The CLI automatically:
- Downloads Playwright browsers on first run
- Captures screenshots of both designs
- Creates a `.figma-drift/` folder in your project root with:
  - `figma.png` - Figma design screenshot
  - `live.png` - Live implementation screenshot
  - `diff.png` - Visual difference (red highlights)
  - `report.json` - Detailed comparison results

> **No installation needed:** Use `npx figma-drift` to run directly. Test fixtures don't need to be installed—just serve them with `npx serve test-fixtures -p 5555`.

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

## Organized Results

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

## Development Setup (For Contributors)

This section is for contributors who want to work on Figma Drift source code. If you just want to **use** the tool, see Quick Start above—you don't need to follow these steps.

### Development Prerequisites

- **Node.js 20+** (required for Playwright compatibility)
- **Figma Personal Access Token** - Get from [Figma Settings → Personal Access Tokens](https://www.figma.com/settings)

### Installation

```bash
# Clone repository
git clone https://github.com/CaryIsFree/figma-drift.git
cd figma-drift

# Install dependencies
npm install

# Build all packages
npm run build
```

### Backend Configuration

```bash
# Create **packages/backend/.env** and add your Figma token
FIGMA_ACCESS_TOKEN=figd_your_token_here
PORT=3000
```

### Usage

You need **3 terminals** to run the full system during development:

#### Terminal 1: Serve Test Fixtures (optional, for testing)

```bash
npx serve test-fixtures -p 5555
# Serves test-fixtures/ on http://localhost:5555
```

#### Terminal 2: Start Core Engine (Backend)

```bash
cd packages/backend
npm run dev
# Server will start on http://localhost:3000
```

> **Note:** Backend uses Node.js via `tsx` for Playwright compatibility on Windows.

#### Terminal 3: Run CLI Checks (Direct from source)

```bash
cd packages/cli
npm run dev -- check \
   --figma "<YOUR_FIGMA_FRAME_URL>" \
   --live "<YOUR_LIVE_SITE_URL>"
```

### Development Scripts

- **Test**: Run all unit and integration tests.
  ```bash
  npm test
  ```
- **Lint**: Run linting checks across all packages.
  ```bash
  npm run lint
  ```
- **Typecheck**: Verify TypeScript types across the monorepo.
  ```bash
  npm run typecheck
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

```text
⠋ Fetching Figma data...
✓ Browser installation complete
⠙ Comparing...

📂 Results saved to: .figma-drift/2026-01-28_15-30-45-123/
💾 Diff image saved to: diff.png

📊 Drift Report
================
Figma:  https://www.figma.com/design/...
Live:   https://your-staging-site.com/page
Time:   2026-01-28T15:30:45.123Z

🖼️  Visual Diff
   Difference: 10.10%

📐 Spec Diff
   Colors missing:
     - #1e1e1e (used in: Button, Header)
   Fonts missing:
     - Inter 24px 700 (used in: Title)

❌ FAILED - Drift detected
```

---

## API Reference

### POST /api/compare

Compare a Figma design to a live implementation.

**Request:**

```json
{
  "figmaUrl": "<YOUR_FIGMA_FRAME_URL>",
  "liveUrl": "<YOUR_LIVE_SITE_URL>",
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

## Configuration Reference

### Environment Variables

**For Standalone CLI (.env file in current directory):**
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

### Package Structure

- **packages/backend**: The core comparison engine, identified as `figma-drift-core` in `package.json`, handles Figma API integration and image comparison.
- **packages/cli**: The command-line client provides a user-friendly interface for executing drift checks.
- **packages/figma-plugin**: A planned plugin to integrate comparison features directly within the Figma design environment.

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

**Solution:** Requires Figma Professional/Dev tier for increased limits or wait for monthly reset.

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
npm link -w figma-drift
figma-drift check --figma "..." --live "..."
```

### "figma-drift: command not found"

Fixed in latest version. If you see this, pull latest code.

## Closed Beta & Feedback

Figma Drift is currently in **Closed Beta**. We are actively looking for technical validation from developers and designers.

- **Found a bug?** Please [open an issue](https://github.com/CaryIsFree/figma-drift/issues) using our bug report template.
- **Have feedback?** We'd love to hear your thoughts! Please fill out our [Technical Feedback Survey](FEEDBACK.md).
- **Want to contribute?** Please read our [Contributing Guidelines](CONTRIBUTING.md) and Beta Agreement.

---

## Contact

- **GitHub**: [CaryIsFree/figma-drift](https://github.com/CaryIsFree/figma-drift)
- **Issues**: [GitHub Issues](https://github.com/CaryIsFree/figma-drift/issues)

## License

**Proprietary – All Rights Reserved**

Figma Drift is currently in a closed beta phase. The source code is available for technical review and testing purposes only. You may not copy, modify, distribute, or use this software for commercial purposes without explicit written permission from the owner.
