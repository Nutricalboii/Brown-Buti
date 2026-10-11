import { defineConfig, loadEnv } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createOrderHandler, verifyPaymentHandler } from './server/razorpay.js';

const MAX_API_BODY_BYTES = 16 * 1024;
const API_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

function razorpayDevApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'razorpay-dev-api-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        let pathname: string;
        try {
          const hostHeader = req.headers.host;
          const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader || 'localhost';
          pathname = new URL(req.url || '/', `http://${host}`).pathname;
        } catch {
          return next();
        }

        const handler = pathname === '/api/create-order'
          ? createOrderHandler
          : pathname === '/api/verify-payment'
            ? verifyPaymentHandler
            : null;
        if (!handler) return next();

        let byteLength = 0;
        let responded = false;
        const chunks: Buffer[] = [];
        const respond = (status: number, body: string) => {
          if (responded) return;
          responded = true;
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          for (const [name, value] of Object.entries(API_SECURITY_HEADERS)) res.setHeader(name, value);
          res.end(body);
        };

        const declaredLength = Number(req.headers['content-length']);
        if (Number.isFinite(declaredLength) && declaredLength > MAX_API_BODY_BYTES) {
          return respond(413, JSON.stringify({ error: 'Request too large.' }));
        }

        req.on('data', (chunk: Buffer) => {
          byteLength += chunk.byteLength;
          if (byteLength > MAX_API_BODY_BYTES) {
            respond(413, JSON.stringify({ error: 'Request too large.' }));
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', async () => {
          if (responded) return;
          try {
            const requestHeaders = new Headers();
            for (const [name, value] of Object.entries(req.headers)) {
              if (value !== undefined) requestHeaders.set(name, Array.isArray(value) ? value.join(', ') : value);
            }
            requestHeaders.set('x-forwarded-for', req.socket?.remoteAddress || '127.0.0.1');
            const hostHeader = req.headers.host;
            const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader || 'localhost';
            const request = new Request(new URL(req.url || '/', `http://${host}`), {
              method: req.method,
              headers: requestHeaders,
              body: byteLength ? new Uint8Array(Buffer.concat(chunks)) : undefined,
            });
            const response = await handler(request, { env });
            respond(response.status, await response.text());
          } catch {
            respond(500, JSON.stringify({ error: 'Internal server error.' }));
          }
        });

        req.on('error', () => respond(400, JSON.stringify({ error: 'Invalid request.' })));
      });
    },
  };
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.razorpay.com",
  "script-src 'self' https://checkout.razorpay.com https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://www.facebook.com https://www.google-analytics.com https://*.razorpay.com",
  "media-src 'self' https://res.cloudinary.com",
  "connect-src 'self' https://lumberjack.razorpay.com https://api.razorpay.com https://*.myshopify.com https://mochamogra.com https://www.mochamogra.com https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), razorpayDevApiPlugin(env)],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: '127.0.0.1',
    },
    preview: {
      host: '127.0.0.1',
      headers: securityHeaders,
    },
  };
});
