import express from 'express';
import dotenv from 'dotenv';
import { createOrderHandler, verifyPaymentHandler } from './razorpay.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
});
app.use(express.json({ limit: '16kb', strict: true, type: 'application/json' }));

const adaptHandler = (handler) => async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  headers.set('x-forwarded-for', req.socket.remoteAddress || '127.0.0.1');

  try {
    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    const webResponse = await handler(webRequest);
    webResponse.headers.forEach((value, name) => res.setHeader(name, value));
    return res.status(webResponse.status).send(await webResponse.text());
  } catch {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

app.post('/api/create-order', adaptHandler(createOrderHandler));
app.post('/api/verify-payment', adaptHandler(verifyPaymentHandler));
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request too large.' });
  }
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON.' });
  }
  return res.status(500).json({ error: 'Internal server error.' });
});

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => {
  console.log(`Razorpay API server listening on http://${host}:${port}`);
});
