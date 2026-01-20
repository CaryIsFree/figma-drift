#!/usr/bin/env node

import { Command } from 'commander';

interface FontSpec {
  family: string;
  size: number;
  weight: number;
}

interface DriftReport {
  figmaUrl: string;
  liveUrl: string;
  timestamp: string;
  visual: {
    diffPercent: number;
    diffImageBase64: string | null;
  };
  specs: {
    colorDrift: string[];
    fontDrift: FontSpec[];
    spacingDrift: number[];
  };
  passed: boolean;
}

interface CompareResponse {
  success: boolean;
  report?: DriftReport;
  error?: string;
}

interface CheckOptions {
  figma: string;
  live: string;
  threshold: string;
  server: string;
  output?: string;
}

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
  .action(async (options: CheckOptions): Promise<void> => {
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

      const data: CompareResponse = await response.json();

      if (!data.success || !data.report) {
        console.error('❌ Error:', data.error ?? 'Unknown error');
        process.exit(1);
      }

      const report: DriftReport = data.report;

      console.log('\n📊 Drift Report');
      console.log('================');
      console.log(`Figma:  ${report.figmaUrl}`);
      console.log(`Live:   ${report.liveUrl}`);
      console.log(`Time:   ${report.timestamp}`);
      console.log('');

      console.log('🖼️  Visual Diff');
      console.log(`   Difference: ${report.visual.diffPercent.toFixed(2)}%`);

      console.log('');
      console.log('📐 Spec Diff');

      if (report.specs.colorDrift.length > 0) {
        console.log(`   Colors missing: ${report.specs.colorDrift.join(', ')}`);
      }

      if (report.specs.fontDrift.length > 0) {
        console.log(`   Fonts missing: ${report.specs.fontDrift.map((f: FontSpec) => `${f.family} ${f.size}px`).join(', ')}`);
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

      if (options.output && report.visual.diffImageBase64) {
        const fs = await import('fs');
        const buffer = Buffer.from(report.visual.diffImageBase64, 'base64');
        fs.writeFileSync(options.output, buffer);
        console.log(`\n💾 Diff image saved to: ${options.output}`);
      }

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
