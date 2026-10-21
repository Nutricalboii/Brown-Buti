export const shopifySizeVariantIds: {
  chandini: Record<string, string>;
  chandi: Record<string, string>;
  tamara: Record<string, string>;
};

export function resolveShopifyVariantId(
  product: {
    name?: string;
    id?: string | number;
    sizes?: string[];
    shopifyVariantId?: string;
    shopifyVariantIds?: Record<string, string>;
  } | null | undefined,
  size?: string,
): string | number | undefined;
