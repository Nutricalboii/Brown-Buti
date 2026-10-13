// Shopify Headless Integration Helper
import { createShopifyCartPermalink } from '../../shared/shopify-cart-permalink.mjs';

const DEFAULT_SHOPIFY_DOMAIN = '1fieuf-bz.myshopify.com';
const CUSTOM_SHOPIFY_DOMAINS = new Set(['mochamogra.com', 'www.mochamogra.com']);

function resolveShopifyDomain(configuredDomain?: string): string {
  try {
    const candidate = configuredDomain?.trim() || DEFAULT_SHOPIFY_DOMAIN;
    const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
    const domain = url.hostname.toLowerCase();
    const isShopifyDomain = domain.endsWith('.myshopify.com') || CUSTOM_SHOPIFY_DOMAINS.has(domain);
    if (url.protocol === 'https:' && isShopifyDomain && url.pathname === '/' && !url.port && !url.username && !url.password) {
      return domain;
    }
  } catch {
    // Use the known store domain when deployment configuration is malformed.
  }
  return DEFAULT_SHOPIFY_DOMAIN;
}

export const SHOPIFY_STORE_DOMAIN = resolveShopifyDomain(import.meta.env.VITE_SHOPIFY_STORE_DOMAIN);
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const SHOPIFY_API_VERSION = '2026-10';

/**
 * Executes a GraphQL query against the Shopify Storefront API.
 */
export async function shopifyFetch({ query, variables = {} }: { query: string; variables?: Record<string, unknown> }) {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.error('Missing VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
    return { status: 500, body: { data: null } };
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const body = await response.json();

    if (body.errors) {
      console.error('Shopify GraphQL request failed.');
      return { status: 500, body: { errors: [{ message: 'Shopify request failed.' }] }, error: 'Shopify request failed.' };
    }

    return { status: response.status, body };
  } catch {
    console.error('Shopify network request failed.');
    return { status: 500, body: { data: null }, error: 'Network error' };
  }
}

/**
 * Creates a Shopify checkout using the supported Storefront Cart API.
 */
export async function createShopifyCheckout(items: { variantId?: string | number; quantity: number }[]) {
  if (!items || items.length === 0) {
    throw new Error('Your cart is empty. Add an item before checkout.');
  }

  const lines = items.map((item) => {
    const rawId = String(item.variantId ?? '');
    const match = rawId.match(/^(?:gid:\/\/shopify\/ProductVariant\/)?(\d{8,})$/);
    if (!match || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error('Shopify checkout is not configured for one or more items in your cart. Please contact us for help.');
    }
    return { merchandiseId: `gid://shopify/ProductVariant/${match[1]}`, quantity: item.quantity };
  });

  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  if (SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    const response = await shopifyFetch({ query, variables: { input: { lines } } });
    const payload = response.body?.data?.cartCreate;
    const checkoutUrl = payload?.cart?.checkoutUrl;

    if (checkoutUrl) {
      const url = new URL(checkoutUrl);
      const checkoutHost = url.hostname.toLowerCase();
      const isShopifyHost = checkoutHost === SHOPIFY_STORE_DOMAIN ||
        checkoutHost.endsWith('.myshopify.com') || checkoutHost.endsWith('.shopify.com') ||
        CUSTOM_SHOPIFY_DOMAINS.has(checkoutHost);
      if (url.protocol !== 'https:' || !isShopifyHost) {
        throw new Error('Shopify returned an invalid checkout link. Please contact support.');
      }
      return url.toString();
    }

    const userError = payload?.userErrors?.[0]?.message;
    if (userError) console.warn('Shopify could not create the cart:', payload.userErrors[0].code || 'cart_error');
  }

  // A direct permalink keeps checkout available if the public Storefront API is unavailable.
  return createDirectShopifyCheckout(items);
}

/**
 * Creates a direct Shopify checkout URL using standard cart permalink format.
 * (Fallback method)
 */
export function createDirectShopifyCheckout(items: { variantId?: string | number; quantity: number }[]) {
  return createShopifyCartPermalink(SHOPIFY_STORE_DOMAIN, items);
}

export const getProductsQuery = `{ products(first: 10) { edges { node { id title } } } }`;
