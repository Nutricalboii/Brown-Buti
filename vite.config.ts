import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://www.facebook.com https://www.google-analytics.com",
  "media-src 'self' https://res.cloudinary.com",
  "connect-src 'self' https://*.myshopify.com https://mochamogra.com https://www.mochamogra.com https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com",
  "frame-src 'self'",
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export default defineConfig(() => ({
  plugins: [react()],
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
}));
