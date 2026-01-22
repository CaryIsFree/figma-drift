#!/usr/bin/env node

import { Command } from 'commander';

interface FontSpec {
  family: string;
  size: number;
  weight: number;
}

interface SpecItem<T> {
  value: T;
  nodes: { id: string; name: string }[];
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
    colorDrift: SpecItem<string>[];
    fontDrift: SpecItem<FontSpec>[];
    spacingDrift: SpecItem<number>[];
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
  selector?: string;
  delay?: string;
  headers?: string[];
  cookies?: string[];
  server: string;
  output?: string;
}

const spinner = {
  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  index: 0,
  interval: null as ReturnType<typeof setInterval> | null,
  message: '',

  start(msg: string): void {
    this.message = msg;
    this.index = 0;
    process.stdout.write(`${this.frames[0]} ${msg}`);
    this.interval = setInterval(() => {
      this.index = (this.index + 1) % this.frames.length;
      process.stdout.write(`\r${this.frames[this.index]} ${this.message}`);
    }, 80);
  },

  update(msg: string): void {
    this.message = msg;
    process.stdout.write(`\r${this.frames[this.index]} ${this.message}   `);
  },

  stop(finalMsg?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r${finalMsg ?? this.message}   \n`);
  },
};

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
  .option('--selector <selector>', 'CSS selector to target specific element')
  .option('--delay <ms>', 'Wait for dynamic content (milliseconds)')
  .option('--header <string>', 'HTTP header (can be used multiple times)', [])
  .option('--cookie <string>', 'HTTP cookie (can be used multiple times)', [])
  .option('--server <url>', 'Backend server URL', 'http://localhost:3000')
  .option('--output <path>', 'Output path for diff image')
  .action(async (options: CheckOptions): Promise<void> => {
    try {
      spinner.start('Connecting to backend...');

      const headers: Record<string, string> = (options.headers || []).reduce((acc, h) => {
      const [key, ...rest] = h.split(':');
      acc[key.trim()] = rest.join(':').trim();
      return acc;
    }, {});
    
    const response = await fetch(`${options.server}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          figmaUrl: options.figma,
          liveUrl: options.live,
          threshold: parseFloat(options.threshold),
          selector: options.selector,
          delay: options.delay ? parseInt(options.delay) : undefined,
          headers: Object.keys(headers).length > 0 ? headers : undefined,
          cookies: options.cookies,
        }),
      });

      spinner.update('Processing comparison...');

      const data: CompareResponse = await response.json();

      spinner.stop('✓ Comparison complete');

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
        console.log('   Colors missing:');
        report.specs.colorDrift.forEach(item => {
          const nodes = item.nodes.map(n => n.name).join(', ');
          console.log(`     - ${item.value} (used in: ${nodes})`);
        });
      }

      if (report.specs.fontDrift.length > 0) {
        console.log('   Fonts missing:');
        report.specs.fontDrift.forEach(item => {
          const f = item.value;
          const nodes = item.nodes.map(n => n.name).join(', ');
          console.log(`     - ${f.family} ${f.size}px ${f.weight} (used in: ${nodes})`);
        });
      }

      if (report.specs.spacingDrift.length > 0) {
        console.log('   Spacing missing:');
        report.specs.spacingDrift.forEach(item => {
          const nodes = item.nodes.map(n => n.name).join(', ');
          console.log(`     - ${item.value}px (used in: ${nodes})`);
        });
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
      spinner.stop('✗ Failed');
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
