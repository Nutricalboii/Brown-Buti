export function createShopifyCartPermalink(
  storeDomain: string,
  items: Array<{ variantId?: string | number; quantity: number }>,
): string;
