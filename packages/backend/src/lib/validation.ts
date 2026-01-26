/**
 * URL validation utilities for SSRF protection
 * Prevents Server-Side Request Forgery by validating URLs before use
 */

import { ALLOWED_URL_SCHEMES, FORBIDDEN_HOSTS, ENV } from './constants';
import { ValidationError } from './errors';

/**
 * Validates a URL is safe for the system to access
 * Prevents SSRF attacks by blocking internal network access
 *
 * @param url - URL to validate
 * @throws ValidationError if URL is invalid or unsafe
 */
export function validateUrl(url: string): void {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    throw new ValidationError(`Invalid URL format: ${url}`, { url, error });
  }

  // Check scheme is allowed (http/https only - no file://, etc.)
  if (!ALLOWED_URL_SCHEMES.includes(parsedUrl.protocol as 'http:' | 'https:')) {
    throw new ValidationError(
      `Invalid URL scheme: ${parsedUrl.protocol}. Only http and https are allowed`,
      { url, scheme: parsedUrl.protocol }
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Allow localhost in non-production environments (for testing)
  const isDev = process.env[ENV.NODE_ENV] !== 'production';
  const allowLocalhost = process.env[ENV.ALLOW_LOCALHOST] === 'true';

  // Block localhost and local loopback addresses (unless allowed)
  if (!isDev && !allowLocalhost && FORBIDDEN_HOSTS.includes(hostname as 'localhost' | '127.0.0.1' | '0.0.0.0' | '::1')) {
    throw new ValidationError(
      `Access to localhost/loopback is not allowed: ${hostname}`,
      { url, hostname }
    );
  }

  // Skip SSRF validation for localhost in testing
  if (isDev && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return;
  }

  // Block private IP ranges (IPv4)
  if (isPrivateIPv4(hostname)) {
    throw new ValidationError(
      `Access to private IP address is not allowed: ${hostname}`,
      { url, hostname }
    );
  }

  // Block private IP ranges (IPv6)
  if (isPrivateIPv6(hostname)) {
    throw new ValidationError(
      `Access to private IPv6 address is not allowed: ${hostname}`,
      { url, hostname }
    );
  }
}

/**
 * Checks if hostname is a private IPv4 address
 * Blocks: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
 */
function isPrivateIPv4(hostname: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);

  if (!match) {
    return false;
  }

  const first = match[1] ? Number(match[1]) : 0;
  const second = match[2] ? Number(match[2]) : 0;

  // 10.0.0.0/8
  if (first === 10) return true;

  // 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
  if (first === 172 && second >= 16 && second <= 31) return true;

  // 192.168.0.0/16
  if (first === 192 && second === 168) return true;

  // 169.254.0.0/16 (link-local)
  if (first === 169 && second === 254) return true;

  return false;
}

/**
 * Checks if hostname is a private IPv6 address
 * Blocks: fc00::/7 (unique local), fe80::/10 (link-local), ::1 (loopback)
 */
function isPrivateIPv6(hostname: string): boolean {
  // IPv6 loopback
  if (hostname === '::1' || hostname === '0:0:0:0:0:0:0:1') return true;

  // Expand IPv6 shorthand to full form for easier checking
  const expanded = expandIPv6(hostname);

  // Link-local fe80::/10
  if (expanded.startsWith('fe80')) return true;

  // Unique local fc00::/7
  if (expanded.startsWith('fc00') || expanded.startsWith('fd00')) return true;

  return false;
}

/**
 * Expands compressed IPv6 address to full form
 * Example: ::1 -> 0000:0000:0000:0000:0000:0000:0000:0001
 */
function expandIPv6(hostname: string): string {
  const parts = hostname.split(':');

  // Handle :: compression
  const compressedIndex = parts.indexOf('');
  if (compressedIndex !== -1) {
    const missing = 8 - parts.length + 1;
    const zeros = Array(missing).fill('0000');
    parts.splice(compressedIndex, 1, ...zeros);
  }



  // Pad each hextet to 4 digits
  return parts.map(p => p.padStart(4, '0')).join('').toLowerCase();
}
