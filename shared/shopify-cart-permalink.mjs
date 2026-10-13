const CUSTOM_SHOPIFY_DOMAINS = new Set(['mochamogra.com', 'www.mochamogra.com']);

export function createShopifyCartPermalink(storeDomain, items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty. Add an item before checkout.');
  }

  const cartItems = items.map((item) => {
    const rawId = String(item?.variantId ?? '');
    const match = rawId.match(/^(?:gid:\/\/shopify\/ProductVariant\/)?(\d{8,})$/);
    if (!match || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error('Shopify checkout is not configured for one or more items in your cart. Please contact us for help.');
    }
    return `${match[1]}:${item.quantity}`;
  });

  try {
    const url = new URL(`https://${storeDomain}/cart/${cartItems.join(',')}`);
    const hostname = url.hostname.toLowerCase();
    const isShopifyHost = hostname.endsWith('.myshopify.com') || CUSTOM_SHOPIFY_DOMAINS.has(hostname);
    if (url.protocol !== 'https:' || !isShopifyHost || url.hostname !== storeDomain.toLowerCase()) {
      throw new Error('Invalid Shopify checkout host');
    }
    return url.toString();
  } catch {
    throw new Error('Shopify checkout is unavailable. Please try again later.');
  }
}
