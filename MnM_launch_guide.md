# Mocha & Mogra — Full Launch Guide

---

## ✅ What Was Just Done
- **Riwaayat video** — `coverreel3.webm` added as the first media item
- **Splash screen scroll bug fixed** — body is now `position:fixed` while splash is active, so the home page never drifts underneath; it snaps to top on dismiss
- **Apple/Mobile optimisations** — `viewport-fit=cover`, safe-area insets, momentum scrolling, 44px minimum tap targets, double-tap zoom prevention, high-DPI rendering

---

## 🔧 What Still Needs to Be Done

### Priority 1 — Functional (Must-Haves)
| Item | Status | Notes |
|------|--------|-------|
| Hosted checkout payments | Configure in Shopify | The website hands off to Shopify checkout; no payment processor runs on the storefront. |
| Shopify backend connected | ❌ | See guide below |
| Order management system | ❌ | Comes with Shopify |
| Email confirmation on order | ❌ | Shopify handles automatically |
| Inventory tracking | ❌ | Shopify admin |
| Return/refund policy page | ❌ | Required legally for Indian e-commerce |
| Shipping policy page | ❌ | Required for international shipping |
| Privacy policy page | ❌ | Required by GDPR & Indian IT Act |
| Terms & Conditions page | ❌ | Required |
| WhatsApp chat button | ❌ | Easy to add — very popular for Indian fashion |
| Instagram feed embed | ❌ | Social proof, easy win |

### Priority 2 — Growth
| Item | Status |
|------|--------|
| Google Analytics 4 | ❌ |
| Meta Pixel (Facebook/Instagram ads) | ❌ |
| SEO — product structured data (JSON-LD) | ❌ |
| Sitemap.xml | ❌ |
| Blog / editorial section | ❌ |
| Wishlist feature | ❌ |
| Size guide page | ❌ |
| Customer reviews | ❌ |

---

## 🛒 Shopify Integration — Step by Step

### Step 1 — Create Your Shopify Store
1. Go to **shopify.com** → Start free trial
2. Choose plan: **Basic ($29/month)** is enough to start
3. Set store name: `mochamogra` → Your store URL will be `mochamogra.myshopify.com`
4. Complete store setup (currency: INR + USD if international)

### Step 2 — Add Products in Shopify
1. In Shopify Admin → **Products → Add product**
2. For each saree:
   - Title = product name (e.g., "Sapphire Mogra")
   - Description = the story text
   - Price = ₹9,500
   - Upload all images + videos (Shopify supports video)
   - Add tags like `saree`, `silk`, personality traits
3. Set **inventory quantity** for each product

### Step 3 — Get Your API Credentials
1. Shopify Admin → **Settings → Apps and sales channels → Develop apps**
2. Click **Create an app** → Name it "MnM Website"
3. Go to **API credentials** → Configure **Storefront API** access
4. Enable scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
5. Copy your **Storefront Access Token**

### Step 4 — Add to Your Website
Create a `.env` file in your project root (never commit this!):
```
VITE_SHOPIFY_STORE_DOMAIN=mochamogra.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
```

> [!IMPORTANT]
> Add `.env` to your `.gitignore` immediately. **Never push API keys to GitHub.**

### Step 5 — Connect Custom Domain
1. Buy domain from GoDaddy/Namecheap: `mochamogra.com` (~₹800/year)
2. Shopify Admin → **Settings → Domains → Connect existing domain**
3. Update DNS records at your registrar:
   - `A record` → Shopify's IP
   - `CNAME www` → `shops.myshopify.com`
4. Your website (hosted on Netlify/Vercel) and Shopify checkout can share the same domain

### Step 6 — Payment Setup (India)
1. Shopify Admin → **Settings → Payments**
2. Enable **Shopify Payments** (if available in India — currently limited)
3. **Better option for India**: Use **Razorpay** or **CCAvenue**
   - Install Razorpay app from Shopify App Store
   - Accepts UPI, cards, net banking, EMI
   - Settlement in 1–3 business days to your bank account

### Step 7 — Shipping Setup
1. Shopify Admin → **Settings → Shipping and delivery**
2. Set up:
   - **Domestic** (India): ₹0 free shipping above ₹5,000, else ₹150
   - **International** (USA, UK, etc.): Flat rate or carrier-calculated
3. Integrate with **Shiprocket** or **Delhivery** for auto label generation

---

## 🔐 Security Features to Add

### Already Implemented ✅
- Content Security Policy (CSP) header in `index.html`
- Input validation with Zod on Contact form
- HTTPS (via Cloudinary + hosting platform)
- No sensitive credentials in code

### To Add

#### 1. Environment Variables (Immediate)
```bash
# .env (never commit)
VITE_SHOPIFY_STORE_DOMAIN=...
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
```

#### 2. Rate Limiting on Contact Form
Add a simple submission cooldown (already partially done). For production, use a service like **Formspree** or **Netlify Forms** which have built-in spam protection and reCAPTCHA.

#### 3. HTTPS Everywhere
When you host on **Netlify** or **Vercel**:
- Free SSL certificate auto-provisioned
- Force HTTPS redirect (set in platform settings)

#### 4. Security Headers (Add via Netlify `_headers` file)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains
```

#### 5. Bot Protection for Checkout
Shopify handles this natively — it has built-in fraud analysis and bot detection for all checkouts.

---

## 🏪 Myntra & Nykaa Fashion — How It Works

> [!NOTE]
> Both platforms are **marketplace models** — you list products, they drive traffic, you ship, they take a commission (typically 25–35%).

### Myntra

**Eligibility Requirements:**
- Registered business (GST number mandatory)
- MSME/Udyam registration (preferred)
- Minimum 10–15 SKUs to start
- Professional product photography (white background + lifestyle shots)
- Barcode/EAN codes for each product

**Process:**
1. Go to **partner.myntra.com** → Apply as a seller
2. Fill in brand details, category (Ethnic Wear → Sarees)
3. Submit: GST certificate, PAN, Bank details, Brand trademark (if any)
4. Myntra team reviews (takes 2–4 weeks)
5. If approved → Onboarding call + catalogue upload
6. Myntra does **quality check** of first shipment
7. Go live!

**Commission:** ~25–35% of selling price
**Payments:** 7–15 days after delivery confirmation
**Fulfillment:** You ship to customer OR use Myntra's warehouse (FMW)

**Tips for Mocha & Mogra:**
- Lead with Riwaayat (your bestseller) as hero product
- Strong lifestyle photography is NON-NEGOTIABLE on Myntra
- Myntra strongly prefers established/branded sellers — having your own website helps the application

---

### Nykaa Fashion

**More accessible than Myntra for new/indie brands.**

**Eligibility:**
- GST registration
- Minimum 5 SKUs
- Brand story + unique positioning (✅ MnM has this)

**Process:**
1. Go to **seller.nykaafashion.com** → Register as vendor
2. Submit: GST, PAN, Cancelled cheque, Brand logo + description
3. Approval: 1–3 weeks
4. Upload catalogue via their seller portal
5. Photography: Nykaa provides guidelines (white BG + model shots)

**Commission:** ~30–40% of MRP
**Payments:** 15–30 days cycle
**Fulfillment:** Self-ship (courier to customer) or Nykaa warehouse

**Nykaa Fashion Advantage for MnM:**
- Nykaa Fashion actively supports indie/boutique labels
- Strong customer base of urban women who love premium ethnic wear
- Good fit with MnM's target audience

---

## 📦 Recommended Launch Order

```
Month 1  →  Shopify live + Shopify-hosted checkout + your own website
Month 2  →  Add legal pages, Google Analytics, Meta Pixel
Month 2  →  Apply to Nykaa Fashion (easier entry)
Month 3  →  Apply to Myntra (needs more inventory + photos)
Month 4  →  Instagram Shopping (link products to IG posts)
Month 6  →  WhatsApp Business API for order updates
```

---

## 📸 Photography Checklist for Marketplaces

Myntra and Nykaa both require specific formats:

- **White background shots**: Full saree on model (front + back)
- **Lifestyle shots**: Same saree in a real setting (you already have these ✅)
- **Fabric close-up**: Motif detail shot
- **Resolution**: Min 1000×1500 px
- **Format**: JPEG, sRGB colour space

> [!TIP]
> Your existing Cloudinary assets (the model shoots) are already excellent for lifestyle. You'll additionally need white-background shots for marketplace listings.
