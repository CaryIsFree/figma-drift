import { parseFigmaUrl, fetchFigmaNode, fetchFigmaImage } from '../figma/api.js';
import { extractDesignSpecs } from '../figma/extract.js';
import { capturePageData } from '../capture/screenshot.js';
import { compareImages } from './visual.js';
import { compareSpecs } from './specs.js';
import { PIXELMATCH_THRESHOLD } from '../lib/constants.js';
import type { CompareRequest, DriftReport } from '../types.js';

type ProgressCallback = (_step: string, _ms?: number) => void;

export async function compare(
  request: CompareRequest,
  figmaToken: string,
  onProgress?: ProgressCallback
): Promise<DriftReport> {
  const { figmaUrl, liveUrl, selector, delay, headers, cookies, threshold = PIXELMATCH_THRESHOLD } = request;
  const log = (step: string, ms?: number) => {
    onProgress?.(ms ? `${step} (${ms}ms)` : step);
  };
  const time = () => Date.now();

  let t = time();
  log('Parsing Figma URL...');
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  if (!nodeId) {
    throw new Error('Figma URL must include node-id parameter');
  }

  t = time();
  log('Fetching Figma data...');
  const [figmaNode, figmaImageUrl] = await Promise.all([
    fetchFigmaNode(fileKey, nodeId, figmaToken),
    fetchFigmaImage(fileKey, nodeId, figmaToken, 2),
  ]);
  log('Fetched Figma data', time() - t);

  const designSpecs = extractDesignSpecs(figmaNode);

  t = time();
  log('Downloading Figma image...');
  const figmaImageResponse = await fetch(figmaImageUrl);
  const figmaImageBuffer = Buffer.from(await figmaImageResponse.arrayBuffer());
  log('Downloaded Figma image', time() - t);

  t = time();
  log('Capturing live page...');
  const { screenshot: liveScreenshot, specs: liveSpecs } = await capturePageData(
    liveUrl,
    designSpecs.dimensions.width,
    designSpecs.dimensions.height,
    selector,
    delay,
    headers,
    cookies,
    designSpecs
  );
  log('Captured live page', time() - t);

  t = time();
  log('Comparing...');
  const [visualDiff, specDiff] = await Promise.all([
    compareImages(figmaImageBuffer, liveScreenshot, threshold),
    Promise.resolve(compareSpecs(designSpecs, liveSpecs)),
  ]);
  log('Compared', time() - t);

  const report: DriftReport = {
    figmaUrl,
    liveUrl,
    timestamp: new Date().toISOString(),
    visual: {
      diffPercent: visualDiff.diffPercent,
      diffPixels: visualDiff.matchedPixels,
      totalPixels: visualDiff.totalPixels,
      diffImageBase64: visualDiff.diffImageBuffer
        ? visualDiff.diffImageBuffer.toString('base64')
        : null,
      figmaImageBase64: figmaImageBuffer ? figmaImageBuffer.toString('base64') : undefined,
      liveImageBase64: liveScreenshot ? liveScreenshot.toString('base64') : undefined,
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
