const subjects = new Set([
  'Product Enquiry',
  'Order Information',
  'Styling Consultation',
  'Wholesale / Collaboration',
  'Other',
]);

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M} '.-]*$/u;

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(status, body, origin, additionalHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), ...additionalHeaders },
  });
}

function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return allowedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
}

async function readBoundedJson(request, maxBytes = 4096) {
  if (!request.body) throw { status: 400 };
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw { status: 413 };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw { status: 400 };
  }
}

function validate(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (
    name.length < 2 || name.length > 50 || !namePattern.test(name) ||
    email.length > 254 || !emailPattern.test(email) ||
    !subjects.has(subject) ||
    message.length < 10 || message.length > 1000
  ) return null;
  return { name, email, subject, message };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function createContactFormHandler({
  allowedOrigins = new Set(),
  rateLimit,
  sendEmail,
  configured = true,
}) {
  return async function handle(request) {
    const origin = request.headers.get('origin');
    if (!isAllowedOrigin(origin, allowedOrigins)) return json(403, { error: 'Origin not allowed.' }, null);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' }, origin);
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return json(415, { error: 'Content-Type must be application/json.' }, origin);
    }
    const contentLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > 4096) return json(413, { error: 'Request too large.' }, origin);

    let input;
    try {
      input = await readBoundedJson(request);
    } catch (error) {
      const status = error?.status === 413 ? 413 : 400;
      return json(status, { error: status === 413 ? 'Request too large.' : 'Invalid request.' }, origin);
    }

    // Quietly accept honeypot submissions without sending mail or revealing the trap.
    if (typeof input?.website === 'string' && input.website.trim()) {
      return json(200, { success: true }, origin);
    }
    const submission = validate(input);
    if (!submission) return json(400, { error: 'Please check the form fields and try again.' }, origin);
    if (!configured) return json(503, { error: 'The contact form is temporarily unavailable. Please email us directly.' }, origin);

    const limited = await rateLimit(request);
    if (!limited.configured || limited.error) {
      return json(503, { error: 'The contact form is temporarily unavailable. Please email us directly.' }, origin);
    }
    if (!limited.success) {
      const retryAfter = Number.isFinite(limited.reset) ? Math.max(1, Math.ceil((limited.reset - Date.now()) / 1000)) : 600;
      return json(429, { error: 'Too many messages. Please wait before trying again.' }, origin, { 'Retry-After': String(retryAfter) });
    }

    try {
      await sendEmail({
        replyTo: submission.email,
        subject: `Website enquiry: ${submission.subject}`,
        text: `Name: ${submission.name}\nEmail: ${submission.email}\nSubject: ${submission.subject}\n\n${submission.message}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(submission.name)}</p><p><strong>Email:</strong> ${escapeHtml(submission.email)}</p><p><strong>Subject:</strong> ${escapeHtml(submission.subject)}</p><p>${escapeHtml(submission.message).replace(/\n/g, '<br>')}</p>`,
      });
      return json(200, { success: true, message: 'Message sent.' }, origin);
    } catch {
      console.error('Contact email delivery failed.');
      return json(502, { error: 'We could not send your message just now. Please email us directly.' }, origin);
    }
  };
}
