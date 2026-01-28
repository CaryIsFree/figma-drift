import type { DriftReport } from '@figma-drift/backend';
import fs from 'node:fs/promises';
import path from 'node:path';

export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}_${hour}-${minute}-${second}-${ms}`;
}

export async function createResultStructure(timestamp: string): Promise<string> {
  const resultPath = path.join(process.cwd(), '.figma-drift', timestamp, 'outputs');
  await fs.mkdir(resultPath, { recursive: true });
  return resultPath;
}

export async function saveResults(
  timestamp: string,
  report: DriftReport
): Promise<void> {
  const outputPath = path.join(process.cwd(), '.figma-drift', timestamp, 'outputs');
  await fs.mkdir(outputPath, { recursive: true });
  
  // Save images if they exist
  if (report.visual.figmaImageBase64) {
    const figmaBuffer = Buffer.from(report.visual.figmaImageBase64, 'base64');
    await fs.writeFile(path.join(outputPath, 'figma.png'), figmaBuffer);
  }
  
  if (report.visual.liveImageBase64) {
    const liveBuffer = Buffer.from(report.visual.liveImageBase64, 'base64');
    await fs.writeFile(path.join(outputPath, 'live.png'), liveBuffer);
  }
  
  if (report.visual.diffImageBase64) {
    const diffBuffer = Buffer.from(report.visual.diffImageBase64, 'base64');
    await fs.writeFile(path.join(outputPath, 'diff.png'), diffBuffer);
  }
  
  // Save report.json with metadata only (no binary strings)
  // We omit figmaImageBase64, liveImageBase64, and diffImageBase64
  const reportData = {
    figmaUrl: report.figmaUrl,
    liveUrl: report.liveUrl,
    timestamp: report.timestamp,
    passed: report.passed,
    visual: {
      diffPercent: report.visual.diffPercent,
      diffPixels: report.visual.diffPixels,
      totalPixels: report.visual.totalPixels,
    },
    specs: report.specs
  };
  
  await fs.writeFile(
    path.join(outputPath, 'report.json'),
    JSON.stringify(reportData, null, 2)
  );
}
