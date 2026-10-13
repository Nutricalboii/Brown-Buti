import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const limiterInstances = new Map();

function resolveClientAddress(request, trustedHeaders) {
  for (const header of trustedHeaders) {
    const value = request.headers.get(header)?.split(',')[0]?.trim();
    if (value && value.length <= 64 && !/[\r\n]/.test(value)) return value;
  }
  return 'unknown';
}

async function createIdentifier(address, token) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(address));
  const digest = Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `ip:${digest}`;
}

function isValidRedisUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname.endsWith('.upstash.io') &&
      !url.username && !url.password &&
      !url.port && url.pathname === '/' && !url.search && !url.hash;
  } catch {
    return false;
  }
}

/**
 * Apply a shared, server-side rate limit. The identifier sent to Redis is a
 * keyed HMAC of the caller address; the raw address is never stored or logged.
 */
export async function enforceRateLimit(request, {
  url,
  token,
  prefix,
  limit,
  window = '1 m',
  trustedIpHeaders = ['x-forwarded-for'],
  RedisClient = Redis,
  RatelimitClient = Ratelimit,
}) {
  if (!url || !token) return { configured: false, success: false };
  if (
    !isValidRedisUrl(url) ||
    typeof prefix !== 'string' || !/^[a-zA-Z0-9:_-]{1,100}$/.test(prefix) ||
    !Number.isSafeInteger(limit) || limit < 1 || limit > 10_000 ||
    typeof window !== 'string' || window.length > 20
  ) {
    return { configured: true, success: false, error: true };
  }

  try {
    const cacheKey = `${url}:${prefix}:${limit}:${window}`;
    let limiter = limiterInstances.get(cacheKey);
    if (!limiter) {
      limiter = new RatelimitClient({
        redis: new RedisClient({ url, token }),
        limiter: RatelimitClient.slidingWindow(limit, window),
        analytics: false,
        prefix,
      });
      limiterInstances.set(cacheKey, limiter);
    }

    const address = resolveClientAddress(request, trustedIpHeaders);
    const identifier = await createIdentifier(address, token);
    const result = await limiter.limit(identifier);
    return { configured: true, success: result.success, reset: result.reset };
  } catch {
    return { configured: true, success: false, error: true };
  }
}
