/**
 * WishlistContext — persists wishlist to localStorage
 * Usage: wrap app in <WishlistProvider>, then useWishlist() anywhere
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { products, type Product } from '../data/products';

interface WishlistContextValue {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: number | string) => boolean;
  totalWishlisted: number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = 'mnm_wishlist';

function readSavedWishlist(): Product[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    const ids = new Set(stored.filter((id): id is string | number => typeof id === 'string' || typeof id === 'number'));
    return products.filter((product) => ids.has(product.id));
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(readSavedWishlist);

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((product) => product.id)));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const toggleWishlist = useCallback((product: Product) => {
    const canonicalProduct = products.find((candidate) => candidate.id === product.id);
    if (!canonicalProduct) return;
    setItems((prev) => {
      const exists = prev.some((p) => p.id === canonicalProduct.id);
      return exists ? prev.filter((p) => p.id !== canonicalProduct.id) : [...prev, canonicalProduct];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: number | string) => items.some((p) => p.id === productId),
    [items]
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, isWishlisted, totalWishlisted: items.length, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
