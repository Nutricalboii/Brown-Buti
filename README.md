# Brown Buti storefront

Brown Buti is a React, Vite, and TypeScript storefront for a premium Indian occasion-wear collection. It presents the brand and product catalogue, then hands cart checkout to Shopify. This repository contains the website source; it does not by itself prove that Shopify, Vercel, Razorpay, Supabase, email, shipping, or social account settings are complete or approved.

> **Brand line:** Stories women can wear.

## Current brand details

- **Storefront brand:** Brown Buti
- **Customer-care email:** `hello.brownbuti@gmail.com`
- **WhatsApp:** `+91 63632 81541`
- **Instagram:** [@brown.buti](https://www.instagram.com/brown.buti/)
- **GitHub repository:** [Nutricalboii/Brown-Buti](https://github.com/Nutricalboii/Brown-Buti)
- **Shopify store:** `1fieuf-bz.myshopify.com`
- **Current Vercel production storefront:** `https://brown-buti.vercel.app`
- **Brand artwork:** transparent Brown Buti wordmark and emblem in `public/images/brown-buti-logo.webp` and `public/images/brown-buti-mark.webp`.

The Mocha & Mogra name remains in a few infrastructure values and legacy references. Do not rename service IDs, storage keys, product names, Shopify IDs, or domains as part of a visual brand update without a separate migration decision. In particular, product names that include “Mogra” are catalogue names, not necessarily outdated brand text.

## What the app contains

- Responsive home, shop, story, contact, cart, wishlist, sign-in/profile, size guide, and policy pages.
- Catalogue categories for Sarees, Blouses, and Underskirt, with product details, sizing, media, search, and filters.
- Shopify Storefront Cart API checkout with a Shopify cart-permalink fallback. India delivery addresses use Shopify checkout with Razorpay in INR.
- A separate, server-gated international path is implemented for Razorpay USD Payment Links. It validates the cart on the server, stores a pending order, creates a USD link with destination shipping, verifies the Razorpay webhook, and then creates a paid Shopify Admin order. It remains disabled until the required production secrets and approved shipping-rate table are configured.
- Contact and newsletter forms backed by Supabase Edge Functions. If the Supabase client is not configured or online contact delivery fails, the contact page offers a prepared email draft instead of claiming the message was sent.
- Organization/product structured data, Vercel response headers, and analytics hooks for GA4 and Meta where configured.

### Main implementation map

| Path | Responsibility |
|---|---|
| `src/App.tsx` | Routes, shared layout, and context providers |
| `src/components/` | Navigation, footer, product/cart UI, media, and WhatsApp contact |
| `src/pages/` | Home, catalogue, contact, account, and policy views |
| `src/data/products.ts` | Storefront product copy, categories, media references, and variant mappings |
| `src/lib/brand.ts` / `src/lib/contact.ts` | Customer-facing name, logo paths, email, and WhatsApp details |
| `src/lib/shopify.ts` | Shopify Storefront API and checkout URL handling |
| `src/lib/supabase.ts` | Optional Supabase browser client |
| `supabase/functions/contact-form/` | Validated contact-form delivery and rate limiting |
| `supabase/functions/subscribe-mailchimp/` | Newsletter persistence and Mailchimp subscription |
| `vercel.json` | SPA routing, security headers, and cache rules |
| `public/sitemap.xml`, `src/lib/jsonld.tsx` | Sitemap and structured search metadata |

## Shipping policy and Shopify configuration

The current website shipping-policy copy in `src/pages/ShippingPolicy.tsx` states:

| Destination | Customer-facing shipping rule | Delivery timing |
|---|---|---|
| India | ₹99 per order; complimentary on orders above ₹2,999 | Shown at checkout or communicated after confirmation |
| USA and other eligible international destinations | Calculated from delivery location and order details; customs/import charges may apply unless included | Varies by destination and customs clearance |

International availability depends on the destinations supported by the merchant and carrier; “all countries” must not be promised unless the approved USD shipping-rate table and payment account support them. Customs duties, import taxes, and other destination charges may be payable by the customer unless included at checkout. Made-to-order processing can add time and should be disclosed on the relevant product page.

### International price display

India visitors see the India catalogue prices in INR and use Shopify checkout. Visitors detected outside India (including the USA, UK, Japan, Germany, and other supported markets) see a fixed `$200` price per garment and use the separate USD Payment Link flow. The final destination address is collected before the link is created so the server can apply the approved USD shipping rate for that country.

**Important:** website policy text does not create checkout rates. India remains on Shopify/Razorpay INR. International customers use the separate Razorpay USD Payment Link, where the server chooses USD shipping from `INTERNATIONAL_SHIPPING_RATES_USD` using the submitted destination country. The IP-based storefront mode is a display/route hint; the delivery address is authoritative for the payment route. Do not enable the USD path until every supported destination has an approved rate and the webhook has been tested.

## Payments, dual checkout, and the ₹1 test listing

India payment is initiated in Shopify checkout. International USD payment is initiated through a server-created Razorpay Payment Link. The browser never receives a Razorpay secret and never sets a price. The server validates product IDs, size variants, quantity, country, shipping, and the fixed `$200` per-garment international price; the signed Razorpay webhook is the only event that marks the payment paid and creates the corresponding Shopify order.

The USD path is deliberately fail-closed. It returns a clear unavailable message and leaves the Shopify INR fallback available when any of the following are missing: test/live Razorpay credentials, `RAZORPAY_WEBHOOK_SECRET`, Supabase order storage, Shopify Admin `write_orders` access, or the approved shipping-rate JSON. A Razorpay redirect page alone is not treated as proof of payment.

If a test-only listing or test transaction was used, complete these checks before launch:

1. Find the test item in Shopify and remove it from customer-facing channels (archive or unpublish it; delete only if appropriate).
2. Check Shopify Orders and the Razorpay transaction dashboard for any completed test checkout. A Shopify confirmation page is not proof of a test-mode transaction. If a real payment settled unintentionally, the account owner should reconcile and refund it as appropriate.
3. Do not change real product prices for checkout testing.
4. Verify the active Shopify payment provider, checkout methods, order confirmation emails, and refund/fulfilment handling with the store owner.
5. In Razorpay, register and verify stable public site origins—not per-order Shopify checkout URLs. Confirm approval status with the account owner. Do not expose API secrets in the frontend or repository.

## Local development

### Requirements

- Node.js 18 or later
- npm 9 or later

### Install and run

```bash
git clone https://github.com/Nutricalboii/Brown-Buti.git
cd Brown-Buti
npm install
cp .env.example .env
npm run dev
```

The Vite development server normally starts at `http://localhost:5173`.

### Environment variables

Set only the integrations needed for the environment. Keep `.env` out of Git and configure production values in the relevant Vercel or Supabase secret settings.

| Variable | Used for | Notes |
|---|---|---|
| `VITE_SHOPIFY_STORE_DOMAIN` | Public Shopify storefront host | Defaults to `1fieuf-bz.myshopify.com`; use the store domain, not an order checkout URL. |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Browser Storefront API access | Public storefront token only; never put an Admin API token here. |
| `VITE_SUPABASE_URL` | Browser Supabase client | Public project URL. |
| `VITE_SUPABASE_ANON_KEY` | Browser Supabase client | Publishable/anon key only; never use a service-role key in a `VITE_` variable. |
| `VITE_GA4_MEASUREMENT_ID` | Optional GA4 analytics | Configure only when the brand's analytics property is approved. |
| `VITE_META_PIXEL_ID` | Optional Meta Pixel | Configure only when the brand's pixel is approved. |
| `RAZORPAY_MODE`, `RAZORPAY_INTERNATIONAL_ENABLED`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Server-side international Payment Links | Keep `RAZORPAY_MODE=test` and the enable flag `false` until the complete test flow passes. The key ID/secret never belong in the browser or repository. |
| `RAZORPAY_WEBHOOK_SECRET` | Signed webhook verification | Must match the secret configured for the Razorpay `payment_link.paid` webhook. |
| `INTERNATIONAL_SHIPPING_RATES_USD` | Destination-based USD shipping | JSON object with a required `DEFAULT` amount and optional ISO-2 country overrides, e.g. `{"US":35,"GB":40,"DEFAULT":50}`. Values are USD per order; final rates require owner approval. |
| `SHOPIFY_ADMIN_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN` | Paid international order sync | Server-side Shopify Admin token with `write_orders`; never use this token in a `VITE_` variable. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Pending/paid international order state | Server-side only; apply `supabase/migrations/20261104000000_international_orders.sql`. |
| `PUBLIC_SITE_URL` | Razorpay callback URL | Use the canonical production URL `https://brown-buti.vercel.app`. |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Supabase contact function | Sender must be verified with Resend. Recipient defaults to `hello.brownbuti@gmail.com`. |
| `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_DC` | Supabase newsletter function | Server-side Mailchimp credentials. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared Edge Function rate limiting | Server-side only; configure in the function runtime. |
| `ALLOWED_ORIGINS` | Edge Function CORS allowlist | Comma-separated exact website origins; add the approved production/preview origins. |

See `.env.example` for a copyable template. Never commit real credentials, payment secrets, customer data, or private access tokens.

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Build the production frontend into `dist/` |
| `npm run preview` | Serve the built frontend locally |
| `npm run typecheck` | Run TypeScript checks |
| `npm test` | Run Node-based shared utility and Edge Function tests |
| `npm run lint` | Run ESLint |
| `npm run media:responsive` | Generate responsive product media assets |
| `npm run media:video:webm` | Generate browser-ready product videos |

## Supabase and contact/newsletter setup

The local Supabase CLI project slug is `brown-buti` in `supabase/config.toml`. That slug is not the hosted project URL or project reference. Keep the existing hosted project and its data unless the owner explicitly approves a separate migration. Confirm account ownership, deployment, secrets, and function logs in Supabase before treating the integration as production-ready.

The repository includes `contact-form` and `subscribe-mailchimp` Edge Functions. Function secrets are server-side and should be set in Supabase, not in browser variables. The Brown Buti production and preview Vercel origins are configured in source CORS checks. Legacy custom domains remain separate and should only be migrated through an approved DNS cutover. The canonical URL is also reflected in `src/lib/jsonld.tsx` and `public/sitemap.xml`.

`.github/workflows/supabase-deploy.yml` describes automated function deployment from `main` and requires the relevant GitHub Actions secrets. A workflow file alone does not prove that credentials, branch triggers, or the hosted deployment are working.

## Release checklist — repository facts vs. owner verification

The checks below intentionally separate source-code state from external account state. Storefront branding in source must not be presented as proof of live Shopify or payment settings.

### Verify in code / deployment

- [ ] Run `npm run build`, `npm run typecheck`, `npm test`, and `npm run lint` against the release commit.
- [ ] Verify `GET /api/market` returns JSON (not the SPA HTML fallback) and that IP-derived currency is treated as display-only; this endpoint must be included in the Vercel deployment.
- [ ] Confirm production Vercel environment variables are present. A local Storefront API request returned HTTP 401 on 28 October 2026; replace/verify the public Storefront token in Vercel before relying on customer sign-in or profile/order-history API calls. Shopify cart-permalink fallback can still hand off checkout.
- [ ] Confirm Vercel has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if contact/newsletter forms should submit online; otherwise contact falls back to an email draft and newsletter submission is unavailable.
- [ ] Confirm every referenced product image/video exists in the deployed build and that the correct product, size, price, and Shopify variant are shown.
- [ ] Configure the USD flow in test mode only: apply the international-orders migration, add approved shipping rates, set the Razorpay webhook to `POST /api/razorpay-webhook`, and add the Shopify Admin token with `write_orders`.
- [ ] Test an international Payment Link end to end: verify the link is in USD, the destination shipping amount is correct, the signed webhook is accepted once, a paid Shopify order is created once, and a duplicate webhook does not duplicate the order.
- [ ] Check the Vercel deployment and every route on mobile and desktop; inspect browser console/network errors and the deployed security headers.
- [ ] Confirm the canonical URL, redirects, SEO metadata, CSP, and exact CORS origins use `https://brown-buti.vercel.app`; legacy `mochamogra.com` references remain only in allowlists and should be removed only after any domain cutover is approved.
- [ ] Verify SEO title/description, structured data, sitemap, favicon, and social previews refer to Brown Buti and the selected public URL.
- [ ] Review untracked media before release. Product photography/video under `public/product-media/` and some additional launch assets are local untracked files in this checkout; they are not automatically included in a Git push or deployment. Approve, optimize, and add only the intended files—do not stage the entire media folder blindly.

### Verify with the store/account owner

- [ ] In Shopify, confirm the Atelier theme is the intended published theme (not just a draft), Brown Buti logo and brand details are correct, intended product listings are active, and any test-only listing is not customer-facing.
- [ ] Reconcile any test checkout against Shopify Orders and Razorpay transactions before launch. Preserve accounting records and handle any unintended live charge appropriately; remove test listings without deleting transaction records.
- [ ] Configure and test Shopify shipping profiles: India ₹99 / free above ₹2,999; international rates based on destination and order details for eligible destinations. Ensure checkout results match the policy copy.
- [ ] Complete a full checkout-path test for representative India and international addresses using a payment provider's test mode or Shopify checkout preview. Confirm payment method, total/tax/shipping, order creation, inventory behavior, notification emails, and fulfillment flow. Never run a live charge as a connectivity check.
- [ ] Verify the customer-care email and reply-to in Shopify notifications, test delivery to `hello.brownbuti@gmail.com`, and confirm contact/newsletter function delivery from the deployed site.
- [ ] Confirm Razorpay website approvals and account access with the account owner. The stable storefront URL is what should be registered; checkout URLs vary by order. Never share API secrets or OTPs.
- [ ] Confirm Vercel project/repository/production branch/domain, Supabase hosted project and function deployment, social links, and the correct production environment variables.
- [ ] Obtain owner approval for customer-facing policy and legal seller details. A public brand rename does not itself change the registered legal entity, tax, invoice, bank, or payment-account identity.

**Launch status:** this README documents the implementation and open verification points as of 27 October 2026. It is not a live audit of Shopify, Vercel, Razorpay, Supabase, email, inventory, or shipping accounts. Only mark a checklist item complete after checking the corresponding live service.
