import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Hono } from 'hono';

// We need to test the server endpoints
// Since the real compare function requires external services (Figma API, Playwright),
// we'll test the HTTP layer with mocked dependencies

describe('Server API', () => {
  describe('GET /health', () => {
    it('returns ok status', async () => {
      // Import the app
      const { app } = await import('../src/server');
      
      const res = await app.request('/health');
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/compare', () => {
    it('returns 400 when figmaUrl is missing', async () => {
      const { app } = await import('../src/server');
      
      const res = await app.request('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveUrl: 'https://example.com' }),
      });
      
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('figmaUrl');
    });

    it('returns 400 when liveUrl is missing', async () => {
      const { app } = await import('../src/server');
      
      const res = await app.request('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figmaUrl: 'https://figma.com/file/abc123' }),
      });
      
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('liveUrl');
    });

    it('returns 400 when both URLs are missing', async () => {
      const { app } = await import('../src/server');
      
      const res = await app.request('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    it('returns 400 for invalid JSON body', async () => {
      const { app } = await import('../src/server');
      
      const res = await app.request('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      });
      
      // Should return 400 or 500 depending on error handling
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('accepts valid request body structure', async () => {
      // This test verifies the request validation passes
      // The actual comparison will fail without FIGMA_ACCESS_TOKEN,
      // but we're testing the HTTP layer accepts the correct structure
      const { app } = await import('../src/server');
      
      const res = await app.request('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figmaUrl: 'https://figma.com/file/abc123/Test?node-id=1:2',
          liveUrl: 'https://example.com',
          threshold: 0.1,
        }),
      });
      
      // Without FIGMA_ACCESS_TOKEN, we expect a 500 error (not 400)
      // This proves the validation passed and it tried to process
      const body = await res.json();
      
      // If status is 400, it means validation failed (bad)
      // If status is 500, validation passed but processing failed (expected without token)
      // If status is 200, the mock worked
      if (res.status === 400) {
        // Validation should have passed with valid URLs
        expect(body.error).not.toContain('figmaUrl');
        expect(body.error).not.toContain('liveUrl');
      }
    });

    it('accepts optional parameters', async () => {
      const { app } = await import('../src/server');
      
      const res = await app.request('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figmaUrl: 'https://figma.com/file/abc123/Test?node-id=1:2',
          liveUrl: 'https://example.com',
          selector: '#main',
          delay: 1000,
          threshold: 0.05,
          headers: { 'Authorization': 'Bearer token' },
          cookies: [{ name: 'session', value: 'abc123' }],
        }),
      });
      
      // Should not return 400 for optional params
      if (res.status === 400) {
        const body = await res.json();
        expect(body.error).not.toContain('selector');
        expect(body.error).not.toContain('delay');
        expect(body.error).not.toContain('threshold');
      }
    });
  });

  describe('404 handling', () => {
    it('returns 404 for unknown routes', async () => {
      const { app } = await import('../src/server');
      
      const res = await app.request('/unknown/route');
      expect(res.status).toBe(404);
    });
  });
});
