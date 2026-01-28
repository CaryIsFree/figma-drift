#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { compare, type DriftReport, type CompareRequest } from '@figma-drift/backend';
import * as FileManager from './file-manager.js';

interface CheckOptions {
  figma: string;
  live: string;
  threshold: string;
  selector?: string;
  delay?: string;
  headers?: string[];
  cookies?: string[];
  token?: string;
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
  .option('--token <string>', 'Figma access token (or set FIGMA_ACCESS_TOKEN in .env)')
  .option('--output <path>', 'Output path for diff image')
  .action(async (options: CheckOptions): Promise<void> => {
    try {
      spinner.start('Processing comparison...');

      const headers: Record<string, string> = (options.headers || []).reduce((acc, h) => {
        const [key, ...rest] = h.split(':');
        if (key) {
          acc[key.trim()] = rest.join(':').trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const token = options.token || process.env.FIGMA_ACCESS_TOKEN;
      if (!token) {
        console.error('❌ Error: Figma access token is required');
        console.error('   Provide --token flag or set FIGMA_ACCESS_TOKEN in .env');
        process.exit(2);
      }

      const request: CompareRequest = {
        figmaUrl: options.figma,
        liveUrl: options.live,
        threshold: parseFloat(options.threshold),
        selector: options.selector,
        delay: options.delay ? parseInt(options.delay) : undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        cookies: options.cookies,
      };

      // Check and install Chromium browser if needed
      try {
        await chromium.launch({ headless: true });
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Executable doesn't exist")) {
          spinner.stop();
          console.log('📦 Chromium browser not found. Installing automatically...');
          try {
            execSync('npx playwright install chromium', { stdio: 'inherit' });
            console.log('✓ Browser installation complete');
            spinner.start('Processing comparison...');
          } catch (_installError) {
            console.error('❌ Failed to install Chromium browser');
            console.error('   Run "npx playwright install chromium" manually');
            process.exit(2);
          }
        } else {
          throw e;
        }
      }

      const report: DriftReport = await compare(request, token, (step) => {
        spinner.update(step);
      });

      const timestamp = FileManager.generateTimestamp();
      await FileManager.saveResults(timestamp, report);

      spinner.stop('✓ Comparison complete');
      console.log(`\n📂 Results saved to: .figma-drift/${timestamp}/`);

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
      process.exit(2);
    }
  });

program.parse();
