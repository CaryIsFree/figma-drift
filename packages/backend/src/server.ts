import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { compare } from './compare';
import { closeBrowser } from './capture/screenshot';
import type { CompareRequest, CompareResponse } from './types';

const app = new Hono();

app.use('*', cors());

app.get('/health', (c): Response => c.json({ status: 'ok' }));

app.post('/api/compare', async (c): Promise<Response> => {
  const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!figmaToken) {
    return c.json<CompareResponse>(
      { success: false, error: 'FIGMA_ACCESS_TOKEN not configured' },
      500
    );
  }

  try {
    const body = await c.req.json<CompareRequest>();

    if (!body.figmaUrl || !body.liveUrl) {
      return c.json<CompareResponse>(
        { success: false, error: 'figmaUrl and liveUrl are required' },
        400
      );
    }

    const report = await compare(body, figmaToken);

    return c.json<CompareResponse>({ success: true, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<CompareResponse>({ success: false, error: message }, 500);
  }
});

process.on('SIGTERM', async (): Promise<void> => {
  await closeBrowser();
  process.exit(0);
});

const port = parseInt(process.env.PORT ?? '3000');
console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
