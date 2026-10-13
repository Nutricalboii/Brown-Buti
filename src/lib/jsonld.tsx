/**
 * JSON-LD Structured Data helpers for SEO
 * Injects <script type="application/ld+json"> into <head>
 * — helps Google show rich results (price, availability, brand) for products
 */
import { useEffect } from 'react';
import type { Product } from '../data/products';

const BRAND = 'Mocha & Mogra';
const BASE_URL = 'https://mocha-and-mogra-website.vercel.app';

/** Inject/update a JSON-LD block by a unique ID */
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
      // Clean up when component unmounts
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    };
  }, [id, JSON.stringify(data)]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Organization schema (add to Home page) ──────────────────────────────────

export function OrganizationJsonLd() {
  useJsonLd('ld-organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: BASE_URL,
    logo: `${BASE_URL}/images/mnmlogo-Photoroom.webp`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'labelmochanmogra@gmail.com',
      contactType: 'customer service',
    },
    sameAs: ['https://www.instagram.com/mocha.n.mogra/'],
  });
  return null;
}

// ─── Product schema (add to Shop page / product modal) ───────────────────────

export function ProductJsonLd({ product }: { product: Product }) {
  useJsonLd(`ld-product-${product.id}`, {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.join(' ') || product.story,
    image: product.image || undefined,
    brand: {
      '@type': 'Brand',
      name: BRAND,
    },
    category:
      product.category === 'Sarees'
        ? 'Clothing > Ethnic Wear > Sarees'
        : product.category === 'Blouses'
          ? 'Clothing > Ethnic Wear > Blouses'
          : 'Clothing > Ethnic Wear > Underskirts',
    keywords: product.keywords.join(', '),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/shop`,
      seller: {
        '@type': 'Organization',
        name: BRAND,
      },
    },
  });
  return null;
}

// ─── BreadcrumbList (add to any page) ────────────────────────────────────────

interface Crumb { name: string; path: string }

export function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  useJsonLd('ld-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${BASE_URL}${c.path}`,
    })),
  });
  return null;
}

// ─── ItemList for Shop page (collection of products) ─────────────────────────

export function ShopItemListJsonLd({ products }: { products: Product[] }) {
  useJsonLd('ld-item-list', {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${BRAND} — Silk Saree Collection`,
    url: `${BASE_URL}/shop`,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${BASE_URL}/shop`,
      image: p.image,
    })),
  });
  return null;
}
