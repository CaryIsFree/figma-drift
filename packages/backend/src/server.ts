import { config } from 'dotenv';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { compare } from './compare';
import { closeBrowser } from './capture/screenshot';
import type { CompareRequest, CompareResponse } from './types';
import { DEFAULT_PORT, ERROR_MESSAGES, ENV } from './lib/constants';
import { createLogger } from './lib/logger';

// Load backend environment variables (needed for validation)
import 'dotenv/config';

const result = config({ path: '.env' });
 
const logger = createLogger('server');

function getAllowedOrigins(): string[] {
  const allowed = result.parsed?.[ENV.CORS_ALLOWED_ORIGINS];
  if (!allowed) {
    return [];
  }
  return allowed.split(',').map((o: string) => o.trim()).filter((o: string) => o);
}

// Create and configure Hono app
export const app = new Hono();

const isDev = result.parsed?.[ENV.NODE_ENV] !== 'production';
const allowedOrigins = getAllowedOrigins();

const corsOptions: { origin: string | string[]; credentials: boolean } = {
  origin: isDev && allowedOrigins.length === 0 ? '*' : allowedOrigins,
  credentials: true,
};

app.use('*', cors(corsOptions));
 
app.get('/health', (c): Response => c.json({ status: 'ok' }));
 
app.post('/api/compare', async (c): Promise<Response> => {
  const figmaToken = process.env[ENV.FIGMA_ACCESS_TOKEN];
 
  if (!figmaToken) {
    return c.json<CompareResponse>(
      { success: false, error: ERROR_MESSAGES.FIGMA_TOKEN_MISSING },
      500
    );
  }
 
  try {
    const body = await c.req.json<CompareRequest>();
 
    if (!body.figmaUrl || !body.liveUrl) {
      return c.json<CompareResponse>(
        { success: false, error: ERROR_MESSAGES.INVALID_LIVE_URL },
        400
      );
    }
 
    const report = await compare(body, figmaToken, (step) => {
      logger.info(`⏳ ${step}`);
    });
 
    return c.json<CompareResponse>({ success: true, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Comparison failed', error);
    return c.json<CompareResponse>({ success: false, error: message }, 500);
  }
});

// Only start server if this file is run directly (not imported for testing)
const isMainModule = typeof require !== 'undefined' 
  ? require.main === module 
  : process.argv[1]?.includes('server');

if (isMainModule) {
  process.on('SIGTERM', async (): Promise<void> => {
    await closeBrowser();
    process.exit(0);
  });

  const port = parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10);

  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
  });
}
