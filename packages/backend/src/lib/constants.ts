/**
 * Application constants
 */

// Default server port
export const DEFAULT_PORT = 3000;

// Environment variable keys
export const ENV = {
  FIGMA_ACCESS_TOKEN: 'FIGMA_ACCESS_TOKEN',
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  CORS_ALLOWED_ORIGINS: 'CORS_ALLOWED_ORIGINS',
  ALLOW_LOCALHOST: 'ALLOW_LOCALHOST',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FIGMA_TOKEN_MISSING: 'FIGMA_ACCESS_TOKEN environment variable is not set',
  INVALID_FIGMA_URL: 'Invalid Figma URL',
  INVALID_LIVE_URL: 'figmaUrl and liveUrl are required',
} as const;

// URL validation constants
export const ALLOWED_URL_SCHEMES = ['http:', 'https:'] as const;
export const FORBIDDEN_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1'] as const;
