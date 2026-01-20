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

  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

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
