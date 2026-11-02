import { currencyForCountry, normalizeCountryCode } from '../shared/market-display.mjs';

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') {
      return new Response(null, {
        status: 405,
        headers: { Allow: 'GET', 'Cache-Control': 'no-store' },
      });
    }

    // Vercel supplies this trusted edge header; never accept a country code from query/body input.
    const countryCode = normalizeCountryCode(request.headers.get('x-vercel-ip-country'));
    return Response.json(
      {
        countryCode,
        currency: currencyForCountry(countryCode),
      },
      { headers: { 'Cache-Control': 'private, no-store', Vary: 'x-vercel-ip-country' } },
    );
  },
};
