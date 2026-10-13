const PRODUCT_MEDIA_PREFIX = '/product-media/';
const RESPONSIVE_WIDTHS = [640, 960] as const;

// All catalog photos are normalized to 1600px wide, except this portrait cover.
const ORIGINAL_WIDTH_OVERRIDES: Record<string, number> = {
  '/product-media/pistachio/model-cover.webp': 1350,
};

export function getResponsiveProductImageSrcSet(src: string): string | undefined {
  if (!src.startsWith(PRODUCT_MEDIA_PREFIX) || !src.toLowerCase().endsWith('.webp')) {
    return undefined;
  }

  const originalWidth = ORIGINAL_WIDTH_OVERRIDES[src] ?? 1600;
  const stem = src.slice(0, -'.webp'.length);
  const responsiveSources = RESPONSIVE_WIDTHS.map((width) => `${stem}.${width}.webp ${width}w`);

  return [...responsiveSources, `${src} ${originalWidth}w`].join(', ');
}
