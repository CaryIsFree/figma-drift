# IMPLEMENTATION.md - Phase 1B Build Guide

> **Step-by-step implementation for AI agents**
> Phase: 1B (Your Environment)
> Target: Working CLI + Backend on localhost

---

## Prerequisites

Before starting:
- [ ] Node.js 20+ installed
- [ ] Bun installed (`npm install -g bun`)
- [ ] Figma Personal Access Token (for API calls)
- [ ] A test Figma file with a simple frame

---

## Step 0: Scaffold Monorepo

### 0.1 Create folder structure

```bash
mkdir -p packages/backend/src/{figma,capture,compare,report}
mkdir -p packages/cli/src
mkdir -p packages/backend/tests
mkdir -p packages/cli/tests
```

### 0.2 Create root package.json

```json
{
  "name": "figma-drift",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "bun run --filter '*' build",
    "build:backend": "bun run --filter backend build",
    "build:cli": "bun run --filter cli build",
    "test": "bun run --filter '*' test",
    "lint": "bun run --filter '*' lint",
    "typecheck": "bun run --filter '*' typecheck"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0"
  }
}
```

### 0.3 Create packages/backend/package.json

```json
{
  "name": "@figma-drift/backend",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "bun run --watch src/server.ts",
    "build": "bun build src/server.ts --outdir dist --target node",
    "start": "bun run dist/server.js",
    "test": "bun test",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "playwright": "^1.40.0",
    "pixelmatch": "^5.3.0",
    "pngjs": "^7.0.0"
  },
  "devDependencies": {
    "@types/pixelmatch": "^5.2.0",
    "@types/pngjs": "^6.0.0"
  }
}
```

### 0.4 Create packages/cli/package.json

```json
{
  "name": "@figma-drift/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "figma-drift": "./dist/cli.js"
  },
  "scripts": {
    "dev": "bun run src/cli.ts",
    "build": "bun build src/cli.ts --outdir dist --target node",
    "test": "bun test",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^12.0.0"
  }
}
```

### 0.5 Create root tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### 0.6 Create .env.example

```bash
FIGMA_ACCESS_TOKEN=your_figma_personal_access_token
PORT=3000
```

### 0.7 Update .gitignore

```
node_modules/
dist/
.env
*.log
.DS_Store
```

### 0.8 Install dependencies

```bash
bun install
```

---

## Step 1: Backend - Types (First)

### 1.1 Create packages/backend/src/types.ts

```typescript
// Core types shared across backend

export interface FigmaFrame {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface DesignSpecs {
  colors: string[];                    // Hex values: ["#ffffff", "#000000"]
  fonts: FontSpec[];
  spacing: number[];                   // Unique values: [8, 16, 24]
  dimensions: { width: number; height: number };
}

export interface FontSpec {
  family: string;
  size: number;
  weight: number;
}

export interface LiveSpecs {
  colors: string[];
  fonts: FontSpec[];
  spacing: number[];
  dimensions: { width: number; height: number };
}

export interface DriftReport {
  figmaUrl: string;
  liveUrl: string;
  timestamp: string;
  visual: {
    diffPercent: number;              // 0-100
    diffImageBase64: string | null;   // PNG as base64
  };
  specs: {
    colorDrift: string[];             // Colors in Figma but not in live
    fontDrift: FontSpec[];            // Fonts that differ
    spacingDrift: number[];           // Spacing values that differ
  };
  passed: boolean;                    // true if diffPercent < threshold
}

export interface CompareRequest {
  figmaUrl: string;                   // https://www.figma.com/file/XXX?node-id=YYY
  liveUrl: string;                    // https://staging.example.com/page
  threshold?: number;                 // Default: 0.1 (10% drift allowed)
}

export interface CompareResponse {
  success: boolean;
  report?: DriftReport;
  error?: string;
}
```

---

## Step 2: Backend - Figma API Client

### 2.1 Create packages/backend/src/figma/api.ts

```typescript
// Figma REST API client

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaFileResponse {
  document: FigmaNode;
  name: string;
  lastModified: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: FigmaFill[];
  style?: FigmaTextStyle;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface FigmaFill {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
}

export async function fetchFigmaFile(
  fileKey: string,
  token: string
): Promise<FigmaFileResponse> {
  const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchFigmaNode(
  fileKey: string,
  nodeId: string,
  token: string
): Promise<FigmaNode> {
  const response = await fetch(
    `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const nodes = data.nodes;
  const nodeData = nodes[nodeId];

  if (!nodeData || !nodeData.document) {
    throw new Error(`Node ${nodeId} not found in file ${fileKey}`);
  }

  return nodeData.document;
}

export async function fetchFigmaImage(
  fileKey: string,
  nodeId: string,
  token: string,
  scale: number = 2
): Promise<string> {
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&scale=${scale}&format=png`,
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const imageUrl = data.images[nodeId];

  if (!imageUrl) {
    throw new Error(`No image URL for node ${nodeId}`);
  }

  return imageUrl;
}

export function parseFigmaUrl(url: string): { fileKey: string; nodeId: string | null } {
  // Handle: https://www.figma.com/file/XXXX/Name?node-id=1-2
  // Handle: https://www.figma.com/design/XXXX/Name?node-id=1-2
  const fileMatch = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  const nodeMatch = url.match(/node-id=([^&]+)/);

  if (!fileMatch) {
    throw new Error('Invalid Figma URL: could not extract file key');
  }

  return {
    fileKey: fileMatch[2],
    nodeId: nodeMatch ? decodeURIComponent(nodeMatch[1]) : null,
  };
}
```

### 2.2 Create packages/backend/src/figma/extract.ts

```typescript
// Extract design specs from Figma node

import type { FigmaNode } from './api';
import type { DesignSpecs, FontSpec } from '../types';

export function extractDesignSpecs(node: FigmaNode): DesignSpecs {
  const colors = new Set<string>();
  const fonts: FontSpec[] = [];
  const spacing = new Set<number>();

  traverseNode(node, colors, fonts, spacing);

  return {
    colors: Array.from(colors),
    fonts: deduplicateFonts(fonts),
    spacing: Array.from(spacing).sort((a, b) => a - b),
    dimensions: {
      width: node.absoluteBoundingBox?.width ?? 0,
      height: node.absoluteBoundingBox?.height ?? 0,
    },
  };
}

function traverseNode(
  node: FigmaNode,
  colors: Set<string>,
  fonts: FontSpec[],
  spacing: Set<number>
): void {
  // Extract colors from fills
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.color) {
        const hex = rgbaToHex(fill.color);
        colors.add(hex);
      }
    }
  }

  // Extract font info
  if (node.style) {
    const { fontFamily, fontSize, fontWeight } = node.style;
    if (fontFamily && fontSize) {
      fonts.push({
        family: fontFamily,
        size: fontSize,
        weight: fontWeight ?? 400,
      });
    }
  }

  // Extract spacing
  if (node.paddingLeft !== undefined) spacing.add(node.paddingLeft);
  if (node.paddingRight !== undefined) spacing.add(node.paddingRight);
  if (node.paddingTop !== undefined) spacing.add(node.paddingTop);
  if (node.paddingBottom !== undefined) spacing.add(node.paddingBottom);
  if (node.itemSpacing !== undefined) spacing.add(node.itemSpacing);

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      traverseNode(child, colors, fonts, spacing);
    }
  }
}

function rgbaToHex(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function deduplicateFonts(fonts: FontSpec[]): FontSpec[] {
  const seen = new Set<string>();
  return fonts.filter((font) => {
    const key = `${font.family}-${font.size}-${font.weight}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

---

## Step 3: Backend - Screenshot Capture

### 3.1 Create packages/backend/src/capture/screenshot.ts

```typescript
// Capture screenshot and computed styles from live URL

import { chromium, type Browser, type Page } from 'playwright';
import type { LiveSpecs, FontSpec } from '../types';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
    });
  }
  return browser;
}

export async function captureScreenshot(
  url: string,
  width: number,
  height: number
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: Math.ceil(width), height: Math.ceil(height) });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    return screenshot;
  } finally {
    await page.close();
  }
}

export async function extractLiveSpecs(url: string): Promise<LiveSpecs> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const specs = await page.evaluate(() => {
      const colors = new Set<string>();
      const fonts: { family: string; size: number; weight: number }[] = [];
      const spacing = new Set<number>();

      const elements = document.querySelectorAll('*');

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);

        // Extract colors
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(rgbToHex(bgColor));
        }
        if (textColor) {
          colors.add(rgbToHex(textColor));
        }

        // Extract fonts
        const fontFamily = style.fontFamily.split(',')[0]?.trim().replace(/['"]/g, '');
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseInt(style.fontWeight) || 400;
        if (fontFamily && fontSize) {
          fonts.push({ family: fontFamily, size: fontSize, weight: fontWeight });
        }

        // Extract spacing (padding/margin)
        const paddings = [
          parseFloat(style.paddingTop),
          parseFloat(style.paddingRight),
          parseFloat(style.paddingBottom),
          parseFloat(style.paddingLeft),
        ];
        paddings.forEach((p) => {
          if (p > 0) spacing.add(Math.round(p));
        });
      });

      function rgbToHex(rgb: string): string {
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }

      return {
        colors: Array.from(colors),
        fonts,
        spacing: Array.from(spacing).sort((a, b) => a - b),
      };
    });

    // Deduplicate fonts
    const seenFonts = new Set<string>();
    const uniqueFonts = specs.fonts.filter((f) => {
      const key = `${f.family}-${f.size}-${f.weight}`;
      if (seenFonts.has(key)) return false;
      seenFonts.add(key);
      return true;
    });

    // Get viewport dimensions
    const viewport = page.viewportSize();

    return {
      colors: specs.colors,
      fonts: uniqueFonts,
      spacing: specs.spacing,
      dimensions: {
        width: viewport?.width ?? 0,
        height: viewport?.height ?? 0,
      },
    };
  } finally {
    await page.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
```

---

## Step 4: Backend - Visual Diff

### 4.1 Create packages/backend/src/compare/visual.ts

```typescript
// Visual diff using pixelmatch

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface VisualDiffResult {
  diffPercent: number;
  diffImageBuffer: Buffer | null;
  matchedPixels: number;
  totalPixels: number;
}

export async function compareImages(
  img1Buffer: Buffer,
  img2Buffer: Buffer,
  threshold: number = 0.1
): Promise<VisualDiffResult> {
  const img1 = PNG.sync.read(img1Buffer);
  const img2 = PNG.sync.read(img2Buffer);

  // Ensure same dimensions (resize if needed)
  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

  // Create diff image
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold }
  );

  const totalPixels = width * height;
  const matchedPixels = totalPixels - mismatchedPixels;
  const diffPercent = (mismatchedPixels / totalPixels) * 100;

  return {
    diffPercent,
    diffImageBuffer: PNG.sync.write(diff),
    matchedPixels,
    totalPixels,
  };
}
```

### 4.2 Create packages/backend/src/compare/specs.ts

```typescript
// Compare design specs vs live specs

import type { DesignSpecs, LiveSpecs, FontSpec } from '../types';

export interface SpecDiffResult {
  colorDrift: string[];       // Colors in Figma but not in live
  fontDrift: FontSpec[];      // Fonts that differ
  spacingDrift: number[];     // Spacing values that differ
  hasDrift: boolean;
}

export function compareSpecs(
  design: DesignSpecs,
  live: LiveSpecs
): SpecDiffResult {
  const colorDrift = findMissingColors(design.colors, live.colors);
  const fontDrift = findMissingFonts(design.fonts, live.fonts);
  const spacingDrift = findMissingSpacing(design.spacing, live.spacing);

  return {
    colorDrift,
    fontDrift,
    spacingDrift,
    hasDrift: colorDrift.length > 0 || fontDrift.length > 0 || spacingDrift.length > 0,
  };
}

function findMissingColors(design: string[], live: string[]): string[] {
  const liveSet = new Set(live.map((c) => c.toLowerCase()));
  return design.filter((c) => !liveSet.has(c.toLowerCase()));
}

function findMissingFonts(design: FontSpec[], live: FontSpec[]): FontSpec[] {
  return design.filter((df) => {
    return !live.some(
      (lf) =>
        lf.family.toLowerCase() === df.family.toLowerCase() &&
        Math.abs(lf.size - df.size) < 2 &&
        lf.weight === df.weight
    );
  });
}

function findMissingSpacing(design: number[], live: number[]): number[] {
  const liveSet = new Set(live);
  // Allow 2px tolerance
  return design.filter((ds) => {
    return !live.some((ls) => Math.abs(ls - ds) <= 2);
  });
}
```

---

## Step 5: Backend - Main Compare Endpoint

### 5.1 Create packages/backend/src/compare/index.ts

```typescript
// Main comparison orchestrator

import { parseFigmaUrl, fetchFigmaNode, fetchFigmaImage } from '../figma/api';
import { extractDesignSpecs } from '../figma/extract';
import { captureScreenshot, extractLiveSpecs } from '../capture/screenshot';
import { compareImages } from './visual';
import { compareSpecs } from './specs';
import type { CompareRequest, DriftReport } from '../types';

export async function compare(
  request: CompareRequest,
  figmaToken: string
): Promise<DriftReport> {
  const { figmaUrl, liveUrl, threshold = 0.1 } = request;

  // 1. Parse Figma URL
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  if (!nodeId) {
    throw new Error('Figma URL must include node-id parameter');
  }

  // 2. Fetch Figma node and extract specs
  const figmaNode = await fetchFigmaNode(fileKey, nodeId, figmaToken);
  const designSpecs = extractDesignSpecs(figmaNode);

  // 3. Get Figma rendered image
  const figmaImageUrl = await fetchFigmaImage(fileKey, nodeId, figmaToken);
  const figmaImageResponse = await fetch(figmaImageUrl);
  const figmaImageBuffer = Buffer.from(await figmaImageResponse.arrayBuffer());

  // 4. Capture live screenshot
  const liveScreenshot = await captureScreenshot(
    liveUrl,
    designSpecs.dimensions.width,
    designSpecs.dimensions.height
  );

  // 5. Extract live specs
  const liveSpecs = await extractLiveSpecs(liveUrl);

  // 6. Visual diff
  const visualDiff = await compareImages(figmaImageBuffer, liveScreenshot, threshold);

  // 7. Spec diff
  const specDiff = compareSpecs(designSpecs, liveSpecs);

  // 8. Build report
  const report: DriftReport = {
    figmaUrl,
    liveUrl,
    timestamp: new Date().toISOString(),
    visual: {
      diffPercent: visualDiff.diffPercent,
      diffImageBase64: visualDiff.diffImageBuffer
        ? visualDiff.diffImageBuffer.toString('base64')
        : null,
    },
    specs: {
      colorDrift: specDiff.colorDrift,
      fontDrift: specDiff.fontDrift,
      spacingDrift: specDiff.spacingDrift,
    },
    passed: visualDiff.diffPercent < threshold * 100 && !specDiff.hasDrift,
  };

  return report;
}
```

---

## Step 6: Backend - HTTP Server

### 6.1 Create packages/backend/src/server.ts

```typescript
// Hono HTTP server

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { compare } from './compare';
import { closeBrowser } from './capture/screenshot';
import type { CompareRequest, CompareResponse } from './types';

const app = new Hono();

// Middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Main compare endpoint
app.post('/api/compare', async (c) => {
  const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!figmaToken) {
    return c.json<CompareResponse>(
      { success: false, error: 'FIGMA_ACCESS_TOKEN not configured' },
      500
    );
  }

  try {
    const body = await c.req.json<CompareRequest>();

    if (!body.figmaUrl || !body.liveUrl) {
      return c.json<CompareResponse>(
        { success: false, error: 'figmaUrl and liveUrl are required' },
        400
      );
    }

    const report = await compare(body, figmaToken);

    return c.json<CompareResponse>({ success: true, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<CompareResponse>({ success: false, error: message }, 500);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

const port = parseInt(process.env.PORT ?? '3000');
console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
```

---

## Step 7: CLI Client

### 7.1 Create packages/cli/src/cli.ts

```typescript
#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('figma-drift')
  .description('Detect visual drift between Figma designs and live implementations')
  .version('0.1.0');

program
  .command('check')
  .description('Compare a Figma frame to a live URL')
  .requiredOption('--figma <url>', 'Figma frame URL (with node-id)')
  .requiredOption('--live <url>', 'Live page URL')
  .option('--threshold <number>', 'Diff threshold (0-1)', '0.1')
  .option('--server <url>', 'Backend server URL', 'http://localhost:3000')
  .option('--output <path>', 'Output path for diff image')
  .action(async (options) => {
    try {
      const response = await fetch(`${options.server}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figmaUrl: options.figma,
          liveUrl: options.live,
          threshold: parseFloat(options.threshold),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('❌ Error:', data.error);
        process.exit(1);
      }

      const report = data.report;

      // Output results
      console.log('\n📊 Drift Report');
      console.log('================');
      console.log(`Figma:  ${report.figmaUrl}`);
      console.log(`Live:   ${report.liveUrl}`);
      console.log(`Time:   ${report.timestamp}`);
      console.log('');

      // Visual diff
      console.log('🖼️  Visual Diff');
      console.log(`   Difference: ${report.visual.diffPercent.toFixed(2)}%`);

      // Spec diff
      console.log('');
      console.log('📐 Spec Diff');

      if (report.specs.colorDrift.length > 0) {
        console.log(`   Colors missing: ${report.specs.colorDrift.join(', ')}`);
      }

      if (report.specs.fontDrift.length > 0) {
        console.log(`   Fonts missing: ${report.specs.fontDrift.map((f: any) => `${f.family} ${f.size}px`).join(', ')}`);
      }

      if (report.specs.spacingDrift.length > 0) {
        console.log(`   Spacing missing: ${report.specs.spacingDrift.join('px, ')}px`);
      }

      if (
        report.specs.colorDrift.length === 0 &&
        report.specs.fontDrift.length === 0 &&
        report.specs.spacingDrift.length === 0
      ) {
        console.log('   No spec drift detected ✅');
      }

      // Save diff image if requested
      if (options.output && report.visual.diffImageBase64) {
        const fs = await import('fs');
        const buffer = Buffer.from(report.visual.diffImageBase64, 'base64');
        fs.writeFileSync(options.output, buffer);
        console.log(`\n💾 Diff image saved to: ${options.output}`);
      }

      // Final verdict
      console.log('');
      if (report.passed) {
        console.log('✅ PASSED - No significant drift detected');
        process.exit(0);
      } else {
        console.log('❌ FAILED - Drift detected');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
```

---

## Step 8: Test Files

### 8.1 Create packages/backend/tests/figma-api.test.ts

```typescript
import { describe, it, expect } from 'bun:test';
import { parseFigmaUrl } from '../src/figma/api';

describe('parseFigmaUrl', () => {
  it('extracts file key from /file/ URL', () => {
    const url = 'https://www.figma.com/file/abc123/MyDesign?node-id=1-2';
    const result = parseFigmaUrl(url);
    expect(result.fileKey).toBe('abc123');
    expect(result.nodeId).toBe('1-2');
  });

  it('extracts file key from /design/ URL', () => {
    const url = 'https://www.figma.com/design/xyz789/Test?node-id=10-20';
    const result = parseFigmaUrl(url);
    expect(result.fileKey).toBe('xyz789');
    expect(result.nodeId).toBe('10-20');
  });

  it('handles URL without node-id', () => {
    const url = 'https://www.figma.com/file/abc123/MyDesign';
    const result = parseFigmaUrl(url);
    expect(result.fileKey).toBe('abc123');
    expect(result.nodeId).toBeNull();
  });

  it('throws on invalid URL', () => {
    expect(() => parseFigmaUrl('https://google.com')).toThrow();
  });
});
```

### 8.2 Create packages/backend/tests/extract.test.ts

```typescript
import { describe, it, expect } from 'bun:test';
import { extractDesignSpecs } from '../src/figma/extract';

describe('extractDesignSpecs', () => {
  it('extracts colors from fills', () => {
    const node = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 } }],
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    };

    const specs = extractDesignSpecs(node);
    expect(specs.colors).toContain('#ff0000');
  });

  it('extracts dimensions', () => {
    const node = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 150 },
    };

    const specs = extractDesignSpecs(node);
    expect(specs.dimensions.width).toBe(200);
    expect(specs.dimensions.height).toBe(150);
  });

  it('extracts spacing from padding', () => {
    const node = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      paddingLeft: 16,
      paddingRight: 16,
      itemSpacing: 8,
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    };

    const specs = extractDesignSpecs(node);
    expect(specs.spacing).toContain(16);
    expect(specs.spacing).toContain(8);
  });
});
```

### 8.3 Create packages/backend/tests/compare.test.ts

```typescript
import { describe, it, expect } from 'bun:test';
import { compareSpecs } from '../src/compare/specs';

describe('compareSpecs', () => {
  it('detects missing colors', () => {
    const design = {
      colors: ['#ff0000', '#00ff00'],
      fonts: [],
      spacing: [],
      dimensions: { width: 100, height: 100 },
    };
    const live = {
      colors: ['#ff0000'],
      fonts: [],
      spacing: [],
      dimensions: { width: 100, height: 100 },
    };

    const result = compareSpecs(design, live);
    expect(result.colorDrift).toContain('#00ff00');
    expect(result.hasDrift).toBe(true);
  });

  it('returns no drift when specs match', () => {
    const design = {
      colors: ['#ff0000'],
      fonts: [{ family: 'Inter', size: 16, weight: 400 }],
      spacing: [8, 16],
      dimensions: { width: 100, height: 100 },
    };
    const live = {
      colors: ['#ff0000'],
      fonts: [{ family: 'Inter', size: 16, weight: 400 }],
      spacing: [8, 16],
      dimensions: { width: 100, height: 100 },
    };

    const result = compareSpecs(design, live);
    expect(result.hasDrift).toBe(false);
  });
});
```

---

## Step 9: Run & Verify

### 9.1 Start backend

```bash
# Terminal 1
cd packages/backend
cp ../../.env.example .env
# Edit .env and add your FIGMA_ACCESS_TOKEN
bun run dev
```

### 9.2 Test CLI

```bash
# Terminal 2
cd packages/cli
bun run dev check \
  --figma "https://www.figma.com/file/YOUR_FILE/Name?node-id=1-2" \
  --live "https://your-staging-site.com" \
  --output diff.png
```

### 9.3 Run tests

```bash
bun test
```

---

## Success Criteria Checklist

Phase 1B is complete when:

- [ ] `bun install` works at root
- [ ] `bun run dev` starts backend on localhost:3000
- [ ] `/health` endpoint returns `{ status: 'ok' }`
- [ ] `/api/compare` accepts figmaUrl + liveUrl
- [ ] CLI `figma-drift check` calls backend and outputs report
- [ ] Tests pass: `bun test`
- [ ] Tested on YOUR OWN Figma frame + staging URL
- [ ] Generates visual diff image
- [ ] Outputs spec comparison (colors, fonts, spacing)

---

## File Creation Order

For AI agents, create files in this order:

1. Root configs: `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`
2. Package configs: `packages/backend/package.json`, `packages/cli/package.json`
3. Types: `packages/backend/src/types.ts`
4. Figma: `packages/backend/src/figma/api.ts`, `extract.ts`
5. Capture: `packages/backend/src/capture/screenshot.ts`
6. Compare: `packages/backend/src/compare/visual.ts`, `specs.ts`, `index.ts`
7. Server: `packages/backend/src/server.ts`
8. CLI: `packages/cli/src/cli.ts`
9. Tests: All test files
10. Install & verify: `bun install && bun test`
