# 📑 Technical Dependencies, Deep-Dive Architecture & Production Readiness Audit

> **Mocha & Mogra E-Commerce Platform**  
> *Technical Reference & Systems Architectural Manual*

---

## 📖 Table of Contents
1. [Comprehensive Dependency & Technology Inventory](#1-comprehensive-dependency--technology-inventory)
2. [Deep-Dive Architectural Subsystems](#2-deep-dive-architectural-subsystems)
   - [2.1 React Context State Management Hierarchy](#21-react-context-state-management-hierarchy)
   - [2.2 Analytics & Dual Conversion Engine (`analytics.ts`)](#22-analytics--dual-conversion-engine-analyticsts)
   - [2.3 Structured Data & SEO Engine (`jsonld.tsx`)](#23-structured-data--seo-engine-jsonldtsx)
   - [2.4 Headless Shopify Integration Strategy (`shopify.ts`)](#24-headless-shopify-integration-strategy-shopifyts)
   - [2.5 Supabase Edge Functions & Mailchimp Pipeline](#25-supabase-edge-functions--mailchimp-pipeline)
   - [2.6 Content Security Policy (CSP) & Web Security](#26-content-security-policy-csp--web-security)
3. [Production Readiness Audit: What is Done vs. What is Left](#3-production-readiness-audit-what-is-done-vs-what-is-left)

---

## 1. Comprehensive Dependency & Technology Inventory

### 1.1 Production Dependencies (`dependencies`)

| Package Name | Version | Primary Role & Purpose | Key Integration Files | Impact & Architectural Notes |
|---|---|---|---|---|
| **`react`** | `^18.3.1` | Core UI library for component rendering and hooks (`useState`, `useEffect`, `useCallback`, `useContext`). | Entire `src/` codebase | Essential core dependency. Implements React 18 concurrent rendering features. |
| **`react-dom`** | `^18.3.1` | DOM-specific rendering adapter for React. | `src/main.tsx` | Provides `createRoot` entry point for web application mounting. |
| **`react-router-dom`** | `^7.18.1` | Client-side routing framework for SPA navigation. | `src/App.tsx`, `Navbar.tsx`, `Cart.tsx`, `Shop.tsx` | Handles declarative route rendering (`/`, `/shop`, `/cart`, `/our-story`, `/contact`, `/wishlist`, etc.) and `useNavigate` / `useLocation` hooks. Checkout is hosted by Shopify, not a local route. |
| **`framer-motion`** | `^12.42.2` | Production-grade animation library for smooth UI transitions. | `SplashLanding.tsx`, `ProductModal.tsx`, `AddedToBagDrawer.tsx`, `Navbar.tsx`, `Cart.tsx` | Powers backdrop blurs, slide-over drawers, page transitions, accordion collapse/expand effects, and modal entry/exit sequences. |
| **`lucide-react`** | `^0.344.0` | Lightweight SVG icon library. | Used across all components and pages | Renders clean, scalable luxury UI icons (`ShoppingBag`, `X`, `Check`, `ArrowRight`, `Globe`, `ChevronDown`, `Tag`, `Minus`, `Plus`, `Search`, `Heart`, `Filter`, `Sparkles`, `Lock`, etc.). |
| **`zod`** | `^4.4.3` | TypeScript-first schema declaration and data validation library. | `src/lib/` data layer & future form validation | Used for runtime input validation and type safety. |
| **`@supabase/supabase-js`** | `^2.112.4` | Isomorphic JavaScript client for Supabase backend. | `src/lib/supabase.ts` | Handles optional authentication and serverless function calls. Safe initialization prevents app crashes if environment variables are omitted. |

---

### 1.2 Development Dependencies (`devDependencies`)

| Package Name | Version | Purpose & Build Pipeline Role |
|---|---|---|
| **`vite`** | `^5.4.2` | Next-generation frontend build tool and local dev server with Hot Module Replacement (HMR). |
| **`typescript`** | `^5.5.3` | Static type checking and compiler. Ensures strict type safety across all components and data structures. |
| **`tailwindcss`** | `^3.4.1` | Utility-first CSS framework configured with custom luxury colors, fonts, and arch borders. |
| **`autoprefixer`** | `^10.4.18` | PostCSS plugin to parse CSS and add vendor prefixes to CSS rules automatically. |
| **`postcss`** | `^8.4.35` | Tool for transforming styles with JS plugins. Processes Tailwind directives in `src/index.css`. |
| **`@vitejs/plugin-react`** | `^4.3.1` | Enables Fast Refresh and JSX transformation in Vite using Babel. |
| **`eslint`** | `^9.9.1` | Linter for identifying and reporting patterns found in JavaScript/TypeScript code. |
| **`typescript-eslint`** | `^8.3.0` | Tooling for ESLint to analyze TypeScript code. |
| **`eslint-plugin-react-hooks`** | `^5.1.0-rc.0` | Enforces Rules of Hooks in React components. |
| **`eslint-plugin-react-refresh`** | `^0.4.11` | Ensures components export correctly for Vite HMR. |

---

### 1.3 External Fonts, Asset Pipelines & CDN Networks

- **Google Fonts CDN**:
  - `Cinzel` (`400`, `500`, `600`, `700`): Used for primary luxury headers, navigation labels, product titles, and uppercase tracking elements.
  - `Playfair Display` (`400`, `500`, `600`, `700`, italics): Used for hero titles, product names, and high-contrast editorial headings.
  - `Lora` (`400`, `500`, `600`, italics): Used for body text, story descriptions, and pricing indicators.
- **Cloudinary CDN**:
  - Hosts high-performance WebP photography (`q_auto,f_auto,w_800`) and WebM responsive video loops (`smmodelposing.webm`, `smmodelwall.webm`, `smsareefall.webm`) embedded inside `ImageCarousel.tsx`.

---

## 2. Deep-Dive Architectural Subsystems

### 2.1 React Context State Management Hierarchy

The application avoids complex state bloat (like Redux or Zustand) by utilizing three decoupled, single-responsibility React Context Providers wrapped at the `<App />` root level.

```
                          +-------------------------------+
                          |     <CurrencyProvider>        |
                          |  - currency: 'INR' | 'USD'    |
                          |  - usdRate: 0.012             |
                          |  - formatPrice(inrAmount)     |
                          +---------------+---------------+
                                          |
                                          v
                          +---------------+---------------+
                          |       <CartProvider>          |
                          |  - items: CartItem[]          |
                          |  - addItem(), removeItem()    |
                          |  - updateQuantity()           |
                          |  - subtotal                   |
                          +---------------+---------------+
                                          |
                                          v
                          +---------------+---------------+
                          |     <WishlistProvider>        |
                          |  - items: Product[]           |
                          |  - toggleWishlist()           |
                          |  - isWishlisted()             |
                          +-------------------------------+
```

#### 1. `CartContext.tsx`
- **State Structure**: `CartItem[]` where each item contains `{ product: Product; quantity: number }`.
- **Calculated Properties**: `totalItems` (sum of quantities), `subtotal` (sum of `price * quantity`).
- **Methods**: `addItem(product)`, `removeItem(productId)`, `updateQuantity(productId, quantity)`, `clearCart()`.
- **Persistence**: Automatically synchronizes state changes with `localStorage.getItem('cart')` / `localStorage.setItem('cart', ...)`.

#### 2. `WishlistContext.tsx`
- **State Structure**: `Product[]` representing saved luxury pieces.
- **Methods**: `toggleWishlist(product)`, `isWishlisted(productId)`, `clearWishlist()`.
- **Persistence**: Synchronized with `localStorage.getItem('wishlist')`.

#### 3. `CurrencyContext.tsx`
- **State Structure**: `currency: 'INR' | 'USD'`.
- **Conversion Rate**: Configurable `usdRate` multiplier (default `0.012`).
- **Formatting Helper**: `formatPrice(inrAmount)` dynamically formats currency strings using `Intl.NumberFormat`:
  - `INR` Mode: `₹9,500`
  - `USD` Mode: `$114`
- **Shipping Threshold Utility**: Dynamically computes free shipping eligibility across domestic (₹5,000 threshold) vs international ($200 USD equivalent threshold).

---

### 2.2 Analytics & Dual Conversion Engine (`analytics.ts`)

The `src/lib/analytics.ts` module provides a unified, cross-platform e-commerce tracking system supporting both **Google Analytics 4 (GA4)** and **Meta Pixel (Facebook)** simultaneously without runtime overhead or third-party bundle bloat.

#### Window Safety Guards
To prevent runtime exceptions during server-side static checks or before external tracking scripts load, every method inspects window object availability:

```typescript
// Safe GA4 Event Dispatcher
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params ?? {});
}

// Safe Meta Pixel Event Dispatcher
export function trackPixelEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', eventName, params ?? {});
}
```

#### Supported E-Commerce Tracking Events
1. `trackPageView(path, title)`: Fired on every route transition via `<ScrollToTop />` in `App.tsx`.
2. `trackViewContent(productName, value, currency)`: Fired when a customer opens the `ProductModal`.
3. `trackAddToCart(productName, value, currency)`: Fired when adding an item to the shopping bag.
4. `trackInitiateCheckout(value, currency)`: Fired when clicking "Proceed to Checkout" or "Buy Now".
5. Purchase confirmation tracking must be configured on the Shopify-hosted checkout/thank-you flow; the storefront no longer has a local order-confirmation route.

---

### 2.3 Structured Data & SEO Engine (`jsonld.tsx`)

To maximize organic search visibility and enable Google Rich Results (displaying price, stock status, and brand metadata directly in SERP snippets), `src/lib/jsonld.tsx` provides reusable React components that inject Schema.org JSON-LD scripts into document `<head>`.

```typescript
function useJsonLd(id: string, data: object) {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);

    return () => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    };
  }, [id, JSON.stringify(data)]);
}
```

#### Implemented Schema Types
- `<OrganizationJsonLd />`: Standard corporate entity metadata, logo URL, customer service email, and Instagram profile links.
- `<ProductJsonLd product={p} />`: Product schema containing price, currency (`INR`), availability (`InStock`), category (`Clothing > Ethnic Wear > Sarees`), and Cloudinary image URLs.
- `<ShopItemListJsonLd products={list} />`: Collection catalog listing schema injected on `/shop`.
- `<BreadcrumbJsonLd crumbs={crumbs} />`: Hierarchical site navigation metadata for Google search crawlers.

---

### 2.4 Headless Shopify Integration Strategy (`shopify.ts`)

The platform utilizes a **Headless Shopify Architecture**. The custom React frontend handles product discovery, storytelling, and cart interactions, while checkout, payment processing, and order management are handled by Shopify. There is no custom payment API or payment gateway running on the website.

#### Shopify-hosted Checkout Handoff
The cart calls `createShopifyCheckout()` from `src/lib/shopify.ts`. When the Storefront API is configured, the helper creates a Shopify cart and validates that the returned checkout URL is HTTPS and belongs to Shopify or the approved store domains. If the Storefront API is unavailable, it falls back to a validated Shopify cart permalink. Empty or invalid carts are rejected. The website does not collect payment details, run a payment SDK, or expose a custom payment API; gateway configuration and payment completion remain in Shopify Admin and Shopify Checkout.

---

### 2.5 Supabase Edge Functions & Mailchimp Pipeline

Newsletter subscriptions collected in `Footer.tsx` execute an HTTP POST request to a serverless Deno Edge Function hosted on Supabase:

```
[Customer Email Input] -> [Footer.tsx]
                               |
                               v
           [HTTP POST: /functions/v1/subscribe-mailchimp]
                               |
                               +---> 1. Insert into Supabase DB ('newsletter_subscribers')
                               |
                               +---> 2. Authenticated Fetch to Mailchimp API v3.0
                                        Headers: Authorization: Bearer {MAILCHIMP_API_KEY}
                                        URL: https://{DC}.api.mailchimp.com/3.0/lists/{LIST_ID}/members
                               |
                               v
                 [Returns { success: true } to React UI]
```

#### Edge Function Key Implementation Details (`supabase/functions/subscribe-mailchimp/index.ts`)
- Implements CORS preflight headers (`Access-Control-Allow-Origin: *`).
- Uses `@supabase/server` `withSupabase` middleware for request authentication.
- Automatically handles existing subscribers without throwing error alerts if Mailchimp responds with `"Member Exists"`.

---

### 2.6 Content Security Policy (CSP) & Web Security

To protect customers against cross-site scripting (XSS), data injection, and malicious script execution, `index.html` implements strict Content Security Policy meta directives:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https://res.cloudinary.com https://www.facebook.com https://www.google-analytics.com;
  media-src 'self' https://res.cloudinary.com;
  connect-src 'self' https://*.myshopify.com https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com;
" />
```

#### Vercel SPA Routing Configuration (`vercel.json`)
Configures universal single-page application route rewrites so deep page links (`/shop`, `/cart`, `/our-story`) render `index.html` seamlessly without HTTP 404 errors. Checkout is an external Shopify URL, not a local SPA route:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 3. Production Readiness Audit: What is Done vs. What is Left

### 3.1 Completed Capabilities (100% Production Ready)

- [x] **Luxury Aesthetics & Brand Identity**: Custom warm cream/mocha color tokens, Cinzel/Playfair Display typography, silk background gradients, and arch-shaped product borders.
- [x] **Catalog Discovery & Modals**: Arch image carousels, video loop media controls, motif category filters, search overlay, and detailed product story drawers.
- [x] **Global State Engines**: Synchronized `CartContext`, `WishlistContext`, and `CurrencyContext` with automatic `localStorage` state persistence.
- [x] **Dual Currency & Dynamic Shipping**: Real-time price formatting (`₹` INR vs. `$` USD) and dynamic threshold shipping rules across domestic and international regions.
- [x] **Direct Headless Shopify Permalinks**: Permastructure cart URL generator built and integrated across `ProductModal`, `AddedToBagDrawer`, and `Cart` pages.
- [x] **Shopify-hosted Checkout**: The storefront securely hands the cart to Shopify; all payment collection and payment gateways stay on Shopify.
- [x] **SEO Schema.org Microdata**: Automated JSON-LD structured data generators for Organization, Product, Shop ItemList, and Breadcrumb List.
- [x] **Analytics Integration Layer**: Dual event dispatchers for GA4 and Meta Pixel initialized with safety window checks.
- [x] **Serverless Newsletter Subsystem**: Deno Edge Function script created and configured for Supabase & Mailchimp API integration.
- [x] **Production Build Verification**: Clean compilation (`vite build`) with zero TypeScript errors (`tsc --noEmit`).
- [x] **Pull Request #7**: PR #7 submitted on upstream repository (`Anushka130126/Mocha_And_Mogra_Website`) incorporating all recent checkout and Shopify updates.

---

### 3.2 Outstanding Tasks for Production Launch (Action Plan)

| Task Description | Responsible Party | Action Instructions | Priority |
|---|---|---|---|
| **1. Merge Pull Request #7** | Repository Owner / Lead Dev | Open **[PR #7 on GitHub](https://github.com/Anushka130126/Mocha_And_Mogra_Website/pull/7)** and click **"Merge pull request"**. This will trigger automatic Vercel deployment. | **High (Immediate)** |
| **2. Disable Shopify Store Password** | Store Administrator | Log into Shopify Admin (`1fieuf-bz.myshopify.com`) -> **Online Store** -> **Preferences** -> **Password Protection**. Uncheck *"Restrict access to visitors with the password"* and click **Save**. | **High (Immediate)** |
| **3. Activate Shopify Payment Gateway** | Store Administrator | Go to Shopify Admin -> **Settings** -> **Payments**. Activate **Razorpay**, **Shopify Payments**, or **Stripe** to process Indian UPI/Cards & international payments. | **High (Pre-Launch)** |
| **4. Configure Custom Domain DNS** | Store Administrator | Purchase domain (e.g. `mochanmogra.com`). In Vercel Project Settings, add domain `mochanmogra.com` and update DNS CNAME / A records in registrar dashboard. | **Medium** |
| **5. Add Real Shopify Numeric Variant IDs** | Developer / Catalog Manager | Update `src/data/products.ts` with real numeric Shopify Variant IDs (e.g. `id: 4589230192`) matching products created in Shopify Admin. | **Medium** |
| **6. Set Supabase Edge Function Secrets** | Developer | Set Deno secrets in Supabase CLI or dashboard: `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_DC`. | **Low** |
| **7. Add Live Analytics Tracking IDs** | Developer / Store Owner | Set `VITE_GA4_MEASUREMENT_ID` and `VITE_META_PIXEL_ID` environment variables in Vercel project environment settings. | **Low** |

---

*Technical specification manual prepared for Mocha & Mogra.*
