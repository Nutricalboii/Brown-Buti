import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { enforceRateLimit } from '../_shared/rate-limit.mjs';

const configuredOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'https://mochamogra.com',
  'https://www.mochamogra.com',
  'https://mocha-and-mogra-website.vercel.app',
  'https://mocha-and-mogra-preview.vercel.app',
  ...configuredOrigins,
]);

function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return allowedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
}

function response(status: number, body: Record<string, unknown>, origin: string | null, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

async function readBoundedJson(req: Request): Promise<unknown> {
  if (!req.body) throw Object.assign(new Error('Invalid JSON.'), { status: 400 });
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > 2048) {
      await reader.cancel();
      throw Object.assign(new Error('Request too large.'), { status: 413 });
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    const origin = req.headers.get('origin');
    if (!isAllowedOrigin(origin)) {
      return response(403, { error: 'Origin not allowed.' }, null);
    }
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (req.method !== 'POST') {
      return response(405, { error: 'Method not allowed.' }, origin);
    }

    const rateLimit = await enforceRateLimit(req, {
      url: Deno.env.get('UPSTASH_REDIS_REST_URL'),
      token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
      prefix: 'mnm:newsletter:subscribe',
      limit: 5,
      window: '1 m',
      trustedIpHeaders: ['cf-connecting-ip'],
    });
    if (!rateLimit.configured || rateLimit.error) {
      return response(503, { error: 'Newsletter signup is temporarily unavailable.' }, origin);
    }
    if (!rateLimit.success) {
      const retryAfter = Number.isFinite(rateLimit.reset)
        ? Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000))
        : 60;
      return response(429, { error: 'Too many signup attempts. Please wait and try again.' }, origin, {
        'Retry-After': String(retryAfter),
      });
    }

    if (!req.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return response(415, { error: 'Content-Type must be application/json.' }, origin);
    }

    const contentLength = Number(req.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > 2048) {
      return response(413, { error: 'Request too large.' }, origin);
    }

    let input: unknown;
    try {
      input = await readBoundedJson(req);
    } catch (error) {
      const status = error instanceof Error && 'status' in error ? Number(error.status) : 400;
      return response(status === 413 ? 413 : 400, { error: status === 413 ? 'Request too large.' : 'Invalid JSON.' }, origin);
    }

    const email = input && typeof input === 'object' && !Array.isArray(input)
      ? (input as { email?: unknown }).email
      : undefined;
    if (typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return response(400, { error: 'Enter a valid email address.' }, origin);
    }
    const normalizedEmail = email.trim().toLowerCase();

    const apiKey = Deno.env.get('MAILCHIMP_API_KEY');
    const listId = Deno.env.get('MAILCHIMP_LIST_ID');
    const dataCenter = Deno.env.get('MAILCHIMP_DC');
    if (!apiKey || !listId || !/^[A-Za-z0-9_-]+$/.test(listId) || !/^[a-z]{2,10}\d?$/i.test(dataCenter || '')) {
      console.error('Newsletter provider configuration is unavailable.');
      return response(503, { error: 'Newsletter signup is temporarily unavailable.' }, origin);
    }

    try {
      const { error: dbError } = await ctx.supabase.from('newsletter_subscribers').insert([
        { email: normalizedEmail, status: 'subscribed' },
      ]);
      if (dbError) console.error('Newsletter subscriber persistence failed.');

      const mailchimpResponse = await fetch(
        `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email_address: normalizedEmail, status: 'subscribed' }),
          signal: AbortSignal.timeout(8000),
        },
      );
      const providerResult = await mailchimpResponse.json().catch(() => null);
      if (!mailchimpResponse.ok && providerResult?.title !== 'Member Exists') {
        console.error('Newsletter provider rejected the subscription.');
        return response(502, { error: 'Unable to subscribe right now. Please try again later.' }, origin);
      }

      return response(200, { success: true, message: 'Subscribed successfully.' }, origin);
    } catch {
      console.error('Newsletter subscription request failed.');
      return response(502, { error: 'Unable to subscribe right now. Please try again later.' }, origin);
    }
  }),
};
