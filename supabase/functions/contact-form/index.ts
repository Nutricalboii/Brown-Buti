import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { enforceRateLimit } from '../_shared/rate-limit.mjs';
import { createContactFormHandler } from '../_shared/contact-form.mjs';

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

const apiKey = Deno.env.get('RESEND_API_KEY');
const from = Deno.env.get('CONTACT_FROM_EMAIL') || '';
const to = Deno.env.get('CONTACT_TO_EMAIL') || 'hello.brownbuti@gmail.com';
const validMailbox = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
const configured = Boolean(apiKey && from.length <= 254 && validMailbox.test(from) && validMailbox.test(to));

const handler = createContactFormHandler({
  allowedOrigins,
  configured,
  rateLimit: (request: Request) => enforceRateLimit(request, {
    url: Deno.env.get('UPSTASH_REDIS_REST_URL'),
    token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
    prefix: 'brown-buti:contact:submit',
    limit: 3,
    window: '10 m',
    trustedIpHeaders: ['cf-connecting-ip'],
  }),
  sendEmail: async ({ replyTo, subject, text, html }) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text, html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Email provider rejected the request.');
  },
});

Deno.serve(withSupabase({ auth: ["publishable"] }, (request: Request) => handler(request)));
