import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { products, type Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, size?: string) => void;
  removeItem: (productId: number | string, size?: string) => void;
  updateQuantity: (productId: number | string, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = 'mnm_cart';
const MAX_ITEM_QUANTITY = 99;

function readSavedCart(): CartItem[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];

    return stored.flatMap((entry): CartItem[] => {
      if (!entry || typeof entry !== 'object') return [];
      const { productId, quantity, size } = entry as { productId?: unknown; quantity?: unknown; size?: unknown };
      const product = products.find((candidate) => candidate.id === productId);
      if (!product || !Number.isSafeInteger(quantity) || Number(quantity) < 1 || Number(quantity) > MAX_ITEM_QUANTITY) return [];
      if (size !== undefined && (typeof size !== 'string' || !product.sizes?.includes(size))) return [];
      return [{ product, quantity: Number(quantity), ...(typeof size === 'string' ? { size } : {}) }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readSavedCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.map(({ product, quantity, size }) => ({
        productId: product.id,
        quantity,
        ...(size ? { size } : {}),
      }))));
    } catch {
      // The cart remains usable when browser storage is disabled or full.
    }
  }, [items]);

  const addItem = useCallback((product: Product, size?: string) => {
    const canonicalProduct = products.find((candidate) => candidate.id === product.id);
    if (!canonicalProduct || (size !== undefined && !canonicalProduct.sizes?.includes(size))) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === canonicalProduct.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.product.id === canonicalProduct.id && i.size === size
            ? { ...i, quantity: Math.min(i.quantity + 1, MAX_ITEM_QUANTITY) }
            : i
        );
      }
      return [...prev, { product: canonicalProduct, quantity: 1, size }];
    });
  }, []);

  const removeItem = useCallback((productId: number | string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback((productId: number | string, quantity: number, size?: string) => {
    if (!Number.isSafeInteger(quantity)) return;
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
    } else {
      setItems((prev) =>
        prev.map((i) => i.product.id === productId && i.size === size
          ? { ...i, quantity: Math.min(quantity, MAX_ITEM_QUANTITY) }
          : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
