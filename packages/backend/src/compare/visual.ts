import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { PIXELMATCH_THRESHOLD } from '../lib/constants.js';

export interface VisualDiffResult {
  diffPercent: number;
  diffImageBuffer: Buffer | null;
  compositeImageBuffer: Buffer | null;
  matchedPixels: number;
  totalPixels: number;
  severity: 'low' | 'medium' | 'high';
  categories?: {
    alignment?: number; 
    color?: number;
    noise?: number;
  };
}

const LABEL_HEIGHT = 28;
const LABEL_BG_COLOR = { r: 30, g: 30, b: 30, a: 255 };
const LABEL_TEXT_COLOR = { r: 255, g: 255, b: 255, a: 255 };
const PADDING = 8;

export async function compareImages(
  img1Buffer: Buffer,
  img2Buffer: Buffer,
  threshold: number = PIXELMATCH_THRESHOLD
): Promise<VisualDiffResult> {
  const img1 = PNG.sync.read(img1Buffer);
  const img2 = PNG.sync.read(img2Buffer);

  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

  const cropped1 = cropImage(img1, width, height);
  const cropped2 = cropImage(img2, width, height);

  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    cropped1.data,
    cropped2.data,
    diff.data,
    width,
    height,
    { threshold }
  );

  const totalPixels = width * height;
  const matchedPixels = totalPixels - mismatchedPixels;
  const diffPercent = (mismatchedPixels / totalPixels) * 100;

  let severity: 'low' | 'medium' | 'high' = 'low';
  if (diffPercent > 5) severity = 'high';
  else if (diffPercent > 1) severity = 'medium';

  const compositeImageBuffer = createCompositeImage(cropped1, cropped2, diff, diffPercent);

  return {
    diffPercent,
    diffImageBuffer: PNG.sync.write(diff),
    compositeImageBuffer,
    matchedPixels,
    totalPixels,
    severity,
  };
}

function createCompositeImage(figma: PNG, live: PNG, diff: PNG, diffPercent: number): Buffer {
  const panelWidth = figma.width;
  const panelHeight = figma.height;
  
  const totalWidth = (panelWidth * 3) + (PADDING * 4);
  const totalHeight = panelHeight + LABEL_HEIGHT + (PADDING * 2);
  
  const composite = new PNG({ width: totalWidth, height: totalHeight });
  
  fillRect(composite, 0, 0, totalWidth, totalHeight, { r: 24, g: 24, b: 24, a: 255 });
  
  const y = LABEL_HEIGHT + PADDING;
  const x1 = PADDING;
  const x2 = PADDING * 2 + panelWidth;
  const x3 = PADDING * 3 + panelWidth * 2;
  
  drawLabel(composite, x1, 4, panelWidth, 'FIGMA DESIGN');
  drawLabel(composite, x2, 4, panelWidth, 'LIVE IMPLEMENTATION');
  drawLabel(composite, x3, 4, panelWidth, `DIFF (${diffPercent.toFixed(1)}%)`);
  
  copyImage(composite, figma, x1, y);
  copyImage(composite, live, x2, y);
  copyImage(composite, diff, x3, y);
  
  return PNG.sync.write(composite);
}

function fillRect(
  img: PNG, 
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  color: { r: number; g: number; b: number; a: number }
): void {
  for (let py = y; py < y + h && py < img.height; py++) {
    for (let px = x; px < x + w && px < img.width; px++) {
      const idx = (img.width * py + px) << 2;
      img.data[idx] = color.r;
      img.data[idx + 1] = color.g;
      img.data[idx + 2] = color.b;
      img.data[idx + 3] = color.a;
    }
  }
}

function drawLabel(img: PNG, x: number, y: number, width: number, text: string): void {
  fillRect(img, x, y, width, LABEL_HEIGHT - 4, LABEL_BG_COLOR);
  
  const charWidth = 7;
  const charHeight = 11;
  const textWidth = text.length * charWidth;
  const textX = x + Math.floor((width - textWidth) / 2);
  const textY = y + Math.floor((LABEL_HEIGHT - 4 - charHeight) / 2);
  
  drawSimpleText(img, textX, textY, text, LABEL_TEXT_COLOR);
}

function drawSimpleText(
  img: PNG, 
  x: number, 
  y: number, 
  text: string, 
  color: { r: number; g: number; b: number; a: number }
): void {
  const font: Record<string, number[][]> = {
    'F': [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
    'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
    'G': [[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,0]],
    'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    'A': [[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
    'D': [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
    'E': [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
    'S': [[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
    'N': [[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
    'L': [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
    'V': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0]],
    'P': [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
    'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'O': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
    'R': [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
    'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
    'H': [[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
    ' ': [[0,0],[0,0],[0,0],[0,0],[0,0]],
    '(': [[0,1],[1,0],[1,0],[1,0],[0,1]],
    ')': [[1,0],[0,1],[0,1],[0,1],[1,0]],
    '%': [[1,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,1],[0,0,0,0]],
    '.': [[0],[0],[0],[0],[1]],
    '0': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
    '1': [[0,1],[1,1],[0,1],[0,1],[1,1]],
    '2': [[1,1,1,0],[0,0,0,1],[0,1,1,0],[1,0,0,0],[1,1,1,1]],
    '3': [[1,1,1,0],[0,0,0,1],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
    '4': [[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1]],
    '5': [[1,1,1,1],[1,0,0,0],[1,1,1,0],[0,0,0,1],[1,1,1,0]],
    '6': [[0,1,1,0],[1,0,0,0],[1,1,1,0],[1,0,0,1],[0,1,1,0]],
    '7': [[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0]],
    '8': [[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0]],
    '9': [[0,1,1,0],[1,0,0,1],[0,1,1,1],[0,0,0,1],[0,1,1,0]],
  };
  
  let offsetX = 0;
  for (const char of text) {
    const glyph = font[char];
    if (glyph) {
      for (let row = 0; row < glyph.length; row++) {
        const glyphRow = glyph[row];
        if (!glyphRow) continue;
        for (let col = 0; col < glyphRow.length; col++) {
          if (glyphRow[col] === 1) {
            const px = x + offsetX + col;
            const py = y + row * 2;
            if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
              const idx = (img.width * py + px) << 2;
              img.data[idx] = color.r;
              img.data[idx + 1] = color.g;
              img.data[idx + 2] = color.b;
              img.data[idx + 3] = color.a;
              const idx2 = (img.width * (py + 1) + px) << 2;
              img.data[idx2] = color.r;
              img.data[idx2 + 1] = color.g;
              img.data[idx2 + 2] = color.b;
              img.data[idx2 + 3] = color.a;
            }
          }
        }
      }
      offsetX += (glyph[0]?.length ?? 4) + 2;
    } else {
      offsetX += 6;
    }
  }
}

function copyImage(dest: PNG, src: PNG, destX: number, destY: number): void {
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const srcIdx = (src.width * y + x) << 2;
      const dstX = destX + x;
      const dstY = destY + y;
      if (dstX >= 0 && dstX < dest.width && dstY >= 0 && dstY < dest.height) {
        const dstIdx = (dest.width * dstY + dstX) << 2;
        dest.data[dstIdx] = src.data[srcIdx] ?? 0;
        dest.data[dstIdx + 1] = src.data[srcIdx + 1] ?? 0;
        dest.data[dstIdx + 2] = src.data[srcIdx + 2] ?? 0;
        dest.data[dstIdx + 3] = src.data[srcIdx + 3] ?? 255;
      }
    }
  }
}

function cropImage(img: PNG, targetWidth: number, targetHeight: number): PNG {
  if (img.width === targetWidth && img.height === targetHeight) {
    return img;
  }

  const cropped = new PNG({ width: targetWidth, height: targetHeight });

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcIdx = (img.width * y + x) << 2;
      const dstIdx = (targetWidth * y + x) << 2;
      cropped.data[dstIdx] = img.data[srcIdx] ?? 0;
      cropped.data[dstIdx + 1] = img.data[srcIdx + 1] ?? 0;
      cropped.data[dstIdx + 2] = img.data[srcIdx + 2] ?? 0;
      cropped.data[dstIdx + 3] = img.data[srcIdx + 3] ?? 255;
    }
  }

  return cropped;
}
