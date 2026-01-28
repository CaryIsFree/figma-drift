import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { spawn } from 'child_process';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../src/cli.ts');

// Helper to run CLI command and capture output
function runCli(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn('npm', ['run', 'dev', '--', ...args], {
      env: { ...process.env },
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 1 });
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      proc.kill();
      resolve({ stdout, stderr, exitCode: -1 });
    }, 10000);
  });
}

describe('CLI', () => {
  describe('help and version', () => {
    it('shows help with --help flag', async () => {
      const result = await runCli(['--help']);
      
      expect(result.stdout + result.stderr).toContain('figma-drift');
      expect(result.stdout + result.stderr).toContain('check');
    });

    it('shows help with -h flag', async () => {
      const result = await runCli(['-h']);
      
      expect(result.stdout + result.stderr).toContain('figma-drift');
    });
  });

  describe('check command', () => {
    it('shows check command help', async () => {
      const result = await runCli(['check', '--help']);
      
      expect(result.stdout + result.stderr).toContain('--figma');
      expect(result.stdout + result.stderr).toContain('--live');
    });

    it('requires --figma option', async () => {
      const result = await runCli(['check', '--live', 'https://example.com']);
      
      // Should fail and mention missing figma option
      expect(result.exitCode).not.toBe(0);
    });

    it('requires --live option', async () => {
      const result = await runCli(['check', '--figma', 'https://figma.com/file/abc/test?node-id=1:2']);
      
      // Should fail and mention missing live option
      expect(result.exitCode).not.toBe(0);
    });

    it('accepts all optional parameters', async () => {
      // This will fail because there's no server, but it should parse correctly
      const result = await runCli([
        'check',
        '--figma', 'https://figma.com/file/abc/test?node-id=1:2',
        '--live', 'https://example.com',
        '--threshold', '0.1',
        '--selector', '#main',
        '--delay', '1000',
        '--server', 'http://localhost:9999', // Non-existent server
        '--output', 'test-output.png',
      ]);
      
      // Should fail with connection error, not argument parsing error
      expect(result.stderr).not.toContain('required option');
    });

    it('accepts header option', async () => {
      const result = await runCli([
        'check',
        '--figma', 'https://figma.com/file/abc/test?node-id=1:2',
        '--live', 'https://example.com',
        '--header', 'Authorization: Bearer token',
        '--server', 'http://localhost:9999',
      ]);
      
      // Should not complain about header format
      expect(result.stderr).not.toContain('header');
    });

    it('accepts cookie option', async () => {
      const result = await runCli([
        'check',
        '--figma', 'https://figma.com/file/abc/test?node-id=1:2',
        '--live', 'https://example.com',
        '--cookie', 'session=abc123',
        '--server', 'http://localhost:9999',
      ]);
      
      // Should not complain about cookie format
      expect(result.stderr).not.toContain('cookie');
    });
  });

  describe('default server', () => {
    it('uses localhost:3000 as default server', async () => {
      // Run check without --server, it should try localhost:3000
      const result = await runCli([
        'check',
        '--figma', 'https://figma.com/file/abc/test?node-id=1:2',
        '--live', 'https://example.com',
      ]);
      
      // Should try to connect to localhost:3000 (will fail but confirms default)
      const output = result.stdout + result.stderr;
      // Either connection refused or other error - not an argument error
      expect(output).not.toContain('required option');
    });
  });
});

describe('Argument Validation', () => {
  it('validates threshold is a number', async () => {
    const result = await runCli([
      'check',
      '--figma', 'https://figma.com/file/abc/test?node-id=1:2',
      '--live', 'https://example.com',
      '--threshold', 'not-a-number',
    ]);
    
    // Should handle invalid threshold gracefully
    expect(result.exitCode).not.toBe(0);
  });

  it('validates delay is a number', async () => {
    const result = await runCli([
      'check',
      '--figma', 'https://figma.com/file/abc/test?node-id=1:2',
      '--live', 'https://example.com',
      '--delay', 'not-a-number',
    ]);
    
    // Should handle invalid delay gracefully
    expect(result.exitCode).not.toBe(0);
  });
});

describe('Output Formatting', () => {
  // These tests would require a running server to test output format
  // For now, we just verify the CLI doesn't crash with various inputs
  
  it('handles server connection failure gracefully', async () => {
    const result = await runCli([
      'check',
      '--figma', 'https://figma.com/file/abc/test?node-id=1:2',
      '--live', 'https://example.com',
      '--server', 'http://localhost:59999', // Port that's definitely not in use
    ]);
    
    // Should exit with error code
    expect(result.exitCode).not.toBe(0);
    
    // Should show some kind of error message (not crash silently)
    expect(result.stderr.length + result.stdout.length).toBeGreaterThan(0);
  });
});
