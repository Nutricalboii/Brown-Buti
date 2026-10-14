import { forwardRef, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check, Heart } from 'lucide-react';
import { products as localProducts } from '../data/products';
import type { Product } from '../data/products';
import { ImageCarousel, ProductModal, AddedToBagDrawer } from '../components';
import { useCurrency, useWishlist } from '../context';
import { ShopItemListJsonLd, BreadcrumbJsonLd } from '../lib/jsonld';

const CATEGORIES = ['Blouses', 'Sarees', 'Underskirt'];
const COLLECTIONS = ['The Occasion Edit', 'The Café Collection'];
const PRICE_RANGES = [
  { label: 'Under ₹5,000', min: 0, max: 4999 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10001, max: Infinity },
];
const PERSONALITIES = ['Elegant', 'Refined', 'Confident', 'Intelligent', 'Heritage', 'Regal', 'Playful', 'Romantic', 'Bold', 'Sunny'];

interface Filters {
  categories: string[];
  collections: string[];
  priceRanges: string[];
  personalities: string[];
}

const EMPTY_FILTERS: Filters = { categories: [], collections: [], priceRanges: [], personalities: [] };

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export default function Shop() {
  const products = localProducts;
  const loading = false;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [addedSize, setAddedSize] = useState<string | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const { formatPrice } = useCurrency();
  const { toggleWishlist: wishlistToggle, isWishlisted: checkWishlisted } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId && products.length > 0) {
      const product = products.find((item) => item.id.toString() === productId);
      if (product) setSelectedProduct(product);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('product');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, products, setSearchParams]);
  const activeFilterCount =
    filters.categories.length + filters.collections.length + filters.priceRanges.length + filters.personalities.length;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      if (filters.collections.length > 0 && (!p.collection || !filters.collections.includes(p.collection))) return false;
      if (filters.priceRanges.length > 0) {
        const match = PRICE_RANGES.filter((r) => filters.priceRanges.includes(r.label))
          .some((r) => p.price >= r.min && p.price <= r.max);
        if (!match) return false;
      }
      if (filters.personalities.length > 0) {
        const match = filters.personalities.some((trait) => p.personality.includes(trait));
        if (!match) return false;
      }
      return true;
    });
  }, [filters, products]);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* JSON-LD structured data for SEO */}
      <ShopItemListJsonLd products={filtered} />
      <BreadcrumbJsonLd crumbs={[{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]} />
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-label mb-4"
          >
            Shop
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-cinzel text-4xl md:text-6xl tracking-widest text-mocha-900 uppercase"
          >
            THE WARDROBE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-lora text-sm text-mocha-500 mt-4 italic"
          >
            Each piece carries a personality. Find yours.
          </motion.p>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-mocha-200">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Active filter pills */}
            {filters.categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilters((f) => ({ ...f, categories: toggle(f.categories, c) }))}
                className="flex items-center gap-1.5 bg-mocha-800 text-gold-200 font-cinzel text-[10px] tracking-[0.15em] uppercase px-3 py-1.5"
              >
                {c} <X size={10} strokeWidth={2} />
              </button>
            ))}
            {filters.collections.map((collection) => (
              <button
                key={collection}
                onClick={() => setFilters((f) => ({ ...f, collections: toggle(f.collections, collection) }))}
                className="flex items-center gap-1.5 bg-mocha-800 text-gold-200 font-cinzel text-[10px] tracking-[0.15em] uppercase px-3 py-1.5"
              >
                {collection} <X size={10} strokeWidth={2} />
              </button>
            ))}
            {filters.priceRanges.map((r) => (
              <button
                key={r}
                onClick={() => setFilters((f) => ({ ...f, priceRanges: toggle(f.priceRanges, r) }))}
                className="flex items-center gap-1.5 bg-mocha-800 text-gold-200 font-cinzel text-[10px] tracking-[0.15em] uppercase px-3 py-1.5"
              >
                {r} <X size={10} strokeWidth={2} />
              </button>
            ))}
            {filters.personalities.map((p) => (
              <button
                key={p}
                onClick={() => setFilters((f) => ({ ...f, personalities: toggle(f.personalities, p) }))}
                className="flex items-center gap-1.5 bg-mocha-800 text-gold-200 font-cinzel text-[10px] tracking-[0.15em] uppercase px-3 py-1.5"
              >
                {p} <X size={10} strokeWidth={2} />
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="font-lora text-xs text-mocha-400 hover:text-mocha-700 underline transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 font-cinzel text-xs tracking-[0.15em] uppercase text-mocha-500 hover:text-mocha-800 transition-colors flex-shrink-0 ml-4"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-mocha-800 text-gold-200 font-cinzel text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Count */}
        <p className="font-lora text-sm text-mocha-400 mb-8">
          {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}`}
        </p>

        {/* Product Grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onSelect={setSelectedProduct}
                formatPrice={formatPrice}
                onToggleWishlist={wishlistToggle}
                isWishlisted={checkWishlisted(product.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="font-lora text-mocha-500 italic mb-4">No pieces found for these filters.</p>
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="btn-primary text-xs"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Values strip */}
      <div className="mt-24 py-12 bg-mocha-50 border-y border-mocha-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {['Artisan-Led Craftsmanship', 'Timeless Yet Contemporary', 'Thoughtful Details', 'Made to Be Cherished'].map((v) => (
              <div key={v} className="flex flex-col items-center gap-2">
                <span className="text-gold-500">✦</span>
                <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-mocha-600">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-mocha-900/50 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              key="filter-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-[#FFFEF7] shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-mocha-200">
                <h2 className="font-cinzel text-sm tracking-[0.2em] uppercase text-mocha-900">
                  Filter Pieces
                </h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="text-mocha-500 hover:text-mocha-900 transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="px-8 py-8 space-y-10">
                {/* Category */}
                <div>
                  <h3 className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-4">
                    Category
                  </h3>
                  <div className="space-y-3">
                    {CATEGORIES.map((cat) => (
                      <CheckboxItem
                        key={cat}
                        label={cat}
                        checked={filters.categories.includes(cat)}
                        onChange={() => setFilters((f) => ({ ...f, categories: toggle(f.categories, cat) }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-mocha-200" />

                {/* Saree Collections */}
                <div>
                  <h3 className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-4">
                    Saree Collection
                  </h3>
                  <div className="space-y-3">
                    {COLLECTIONS.map((collection) => (
                      <CheckboxItem
                        key={collection}
                        label={collection}
                        checked={filters.collections.includes(collection)}
                        onChange={() => setFilters((f) => ({ ...f, collections: toggle(f.collections, collection) }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-mocha-200" />

                {/* Price */}
                <div>
                  <h3 className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-4">
                    Price
                  </h3>
                  <div className="space-y-3">
                    {PRICE_RANGES.map((range) => (
                      <CheckboxItem
                        key={range.label}
                        label={range.label}
                        checked={filters.priceRanges.includes(range.label)}
                        onChange={() => setFilters((f) => ({ ...f, priceRanges: toggle(f.priceRanges, range.label) }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-mocha-200" />

                {/* Personality */}
                <div>
                  <h3 className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-4">
                    Personality
                  </h3>
                  <div className="space-y-3">
                    {PERSONALITIES.map((trait) => (
                      <CheckboxItem
                        key={trait}
                        label={trait}
                        checked={filters.personalities.includes(trait)}
                        onChange={() => setFilters((f) => ({ ...f, personalities: toggle(f.personalities, trait) }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-[#FFFEF7] border-t border-mocha-200 px-8 py-5 flex gap-3">
                <button
                  onClick={() => { setFilters(EMPTY_FILTERS); }}
                  className="flex-1 border border-mocha-300 text-mocha-600 font-cinzel text-xs tracking-[0.15em] uppercase py-3 hover:border-mocha-600 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 bg-mocha-800 text-gold-200 font-cinzel text-xs tracking-[0.15em] uppercase py-3 hover:bg-mocha-700 transition-colors"
                >
                  Apply ({filtered.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddedToCart={(prod, size) => { setAddedProduct(prod); setAddedSize(size); }}
      />

      {/* Added to Bag Luxury Slide-Over Drawer */}
      <AddedToBagDrawer
        product={addedProduct}
        size={addedSize}
        onClose={() => setAddedProduct(null)}
      />
    </div>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-3 w-full text-left group"
    >
      <div
        className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
          checked ? 'bg-mocha-800 border-mocha-800' : 'border-mocha-300 group-hover:border-mocha-500'
        }`}
      >
        {checked && <Check size={10} strokeWidth={2.5} className="text-gold-200" />}
      </div>
      <span className={`font-lora text-sm transition-colors ${checked ? 'text-mocha-900' : 'text-mocha-600 group-hover:text-mocha-800'}`}>
        {label}
      </span>
    </button>
  );
}

interface ProductCardProps {
  product: Product;
  index: number;
  onSelect: (p: Product) => void;
  formatPrice: (price: number, priceUsd?: number) => string;
  onToggleWishlist: (p: Product) => void;
  isWishlisted: boolean;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  { product, index, onSelect, formatPrice, onToggleWishlist, isWishlisted },
  ref,
) {
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px" }}
      onViewportEnter={() => setInView(true)}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product)}
    >
      <div
        className="rounded-md overflow-hidden bg-mocha-100 mb-4 relative"
        style={{ aspectRatio: '3/4' }}
      >
        {inView && (
          <ImageCarousel 
            media={product.images || [product.image]} 
            alt={product.name} 
            priority={index === 0}
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {/* Wishlist button */}
        <button
          id={`wishlist-btn-${product.id}`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            className={`transition-colors ${isWishlisted ? 'text-red-400 fill-red-400' : 'text-mocha-500'}`}
          />
        </button>
        <motion.div
          initial={false}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-mocha-900/30 flex items-end pb-6 justify-center"
        >
          <span className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-gold-200 border border-gold-400/50 px-4 py-2">
            View Details
          </span>
        </motion.div>
      </div>
      <div className="text-center">
        <p className="font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-800 mb-1">
          {product.name}
        </p>
        <p className="font-lora text-sm text-mocha-500">{formatPrice(product.price, product.priceUsd)}</p>
        <p className="font-lora text-xs italic text-mocha-400 mt-1">
          {product.collection || `${product.motif} Motif`}
        </p>
      </div>
    </motion.div>
  );
});
