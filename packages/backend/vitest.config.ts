import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globals: false,
    testTimeout: 60000, // 60s default timeout for Playwright tests
    hookTimeout: 120000, // 120s for beforeAll/afterAll hooks
  },
});
