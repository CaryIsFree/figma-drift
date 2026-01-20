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

  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  if (!nodeId) {
    throw new Error('Figma URL must include node-id parameter');
  }

  const figmaNode = await fetchFigmaNode(fileKey, nodeId, figmaToken);
  const designSpecs = extractDesignSpecs(figmaNode);

  const figmaImageUrl = await fetchFigmaImage(fileKey, nodeId, figmaToken);
  const figmaImageResponse = await fetch(figmaImageUrl);
  const figmaImageBuffer = Buffer.from(await figmaImageResponse.arrayBuffer());

  const liveScreenshot = await captureScreenshot(
    liveUrl,
    designSpecs.dimensions.width,
    designSpecs.dimensions.height
  );

  const liveSpecs = await extractLiveSpecs(liveUrl);

  const visualDiff = await compareImages(figmaImageBuffer, liveScreenshot, threshold);

  const specDiff = compareSpecs(designSpecs, liveSpecs);

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
