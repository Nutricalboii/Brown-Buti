import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { products } from '../data/products';
import type { Product } from '../data/products';
import { useCurrency } from '../context/CurrencyContext';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function SearchOverlay({ open, onClose, onSelectProduct }: SearchOverlayProps) {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 0
    ? products.filter((p) => {
        const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
        return searchTerms.every((term) =>
          p.name.toLowerCase().includes(term) ||
          p.motif.toLowerCase().includes(term) ||
          p.personality.some((t) => t.toLowerCase().includes(term)) ||
          p.category.toLowerCase().includes(term) ||
          p.keywords.some((k) => k.toLowerCase().includes(term))
        );
      })
    : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-mocha-900/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#FFFEF7] shadow-2xl"
          >
            {/* Search Input */}
            <div className="max-w-4xl mx-auto px-6 lg:px-10">
              <div className="flex items-center gap-4 py-6 border-b border-mocha-200">
                <Search size={20} className="text-mocha-500 flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sarees, motifs, personalities..."
                  className="flex-1 bg-transparent font-lora text-lg text-mocha-800 placeholder-mocha-400 outline-none"
                />
                <button
                  onClick={onClose}
                  className="text-mocha-500 hover:text-mocha-900 transition-colors p-1"
                  aria-label="Close search"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Results */}
              <div className="py-6 max-h-[60vh] overflow-y-auto">
                {query.trim().length === 0 && (
                  <div>
                    <p className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-400 mb-5">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Silk Saree', 'Seahorse', 'Owl Motif', 'Heritage', 'Contemporary', 'Underskirt'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="border border-mocha-200 text-mocha-600 font-lora text-sm px-4 py-2 hover:border-mocha-500 hover:text-mocha-900 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {query.trim().length > 0 && results.length === 0 && (
                  <div className="text-center py-10">
                    <p className="font-lora text-mocha-500 italic">
                      No pieces found for "{query}".
                    </p>
                    <p className="font-lora text-sm text-mocha-400 mt-2">
                      Try searching for a motif, personality, or collection name.
                    </p>
                  </div>
                )}

                {results.length > 0 && (
                  <>
                    <p className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-400 mb-5">
                      {results.length} {results.length === 1 ? 'Result' : 'Results'}
                    </p>
                    <div className="space-y-1">
                      {results.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelect(product)}
                          className="w-full flex items-center gap-5 p-4 hover:bg-mocha-50 transition-colors group text-left"
                        >
                          {/* Thumbnail */}
                          <div
                            className="flex-shrink-0 w-14 overflow-hidden bg-mocha-100"
                            style={{ borderRadius: '6px', aspectRatio: '3/4' }}
                          >
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center p-2 text-center">
                                <span className="font-lora text-[10px] italic text-mocha-400">Coming soon</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-cinzel text-xs tracking-[0.15em] uppercase text-mocha-800 mb-0.5">
                              {product.name}
                            </p>
                            <p className="font-lora text-sm text-mocha-500">
                              {product.motif} Motif · {formatPrice(product.price, product.priceUsd)}
                            </p>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {product.personality.slice(0, 2).map((t) => (
                                <span key={t} className="font-lora text-xs text-mocha-400 italic">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ArrowRight
                            size={16}
                            className="text-mocha-300 group-hover:text-mocha-700 transition-colors flex-shrink-0"
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
