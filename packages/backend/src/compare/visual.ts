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

  return {
    diffPercent,
    diffImageBuffer: PNG.sync.write(diff),
    matchedPixels,
    totalPixels,
  };
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
