import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createDirectShopifyCheckout } from '../lib/shopify';
import { useCurrency } from '../context/CurrencyContext';
import type { Product } from '../data/products';
import { useState } from 'react';
import AgePrivacyPopup from './AgePrivacyPopup';

interface AddedToBagDrawerProps {
  product: Product | null;
  size?: string;
  onClose: () => void;
}

export default function AddedToBagDrawer({ product, size, onClose }: AddedToBagDrawerProps) {
  const navigate = useNavigate();
  const { items, totalItems, subtotal } = useCart();
  const { formatPrice } = useCurrency();
  const [showAgePopup, setShowAgePopup] = useState(false);

  const handleCheckout = () => {
    onClose();
    const itemsPayload = items.map((item) => ({
      variantId: item.product.shopifyVariantId || item.product.id,
      quantity: item.quantity,
    }));
    window.location.href = createDirectShopifyCheckout(itemsPayload);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-mocha-900/60 backdrop-blur-sm"
          />

          {/* Slide-over Panel (Right Side) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[75] w-full max-w-md bg-[#FFFEF7] shadow-2xl flex flex-col justify-between border-l border-mocha-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-mocha-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <span className="font-cinzel text-xs tracking-[0.2em] uppercase font-bold text-mocha-900">
                  Added to Your Bag
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 text-mocha-400 hover:text-mocha-900 transition-colors rounded-full hover:bg-mocha-50"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Product Spotlight Card */}
              <div className="flex gap-4 p-4 bg-white border border-mocha-100 rounded-lg shadow-sm">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-32 object-cover rounded-md flex-shrink-0 bg-mocha-50"
                  />
                ) : (
                  <div className="w-24 h-32 flex items-center justify-center rounded-md flex-shrink-0 bg-mocha-50 p-2 text-center">
                    <span className="font-lora text-[10px] italic text-mocha-400">Images coming soon</span>
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <span className="font-cinzel text-[9px] tracking-[0.2em] text-mocha-400 uppercase">
                      {product.category} · {product.motif} Motif
                    </span>
                    <h3 className="font-playfair text-base font-medium text-mocha-900 mt-0.5 line-clamp-2">
                      {product.name}
                    </h3>
                    {size && <span className="block font-lora text-xs text-mocha-500 mt-1">Size: {size}</span>}
                  </div>
                  <div>
                    <span className="font-lora text-sm font-semibold text-mocha-800">
                      {formatPrice(product.price, product.priceUsd)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart Summary Bar */}
              <div className="bg-mocha-50/80 p-4 rounded-lg border border-mocha-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-cinzel tracking-wider text-mocha-600">
                  <span>Shopping Bag Subtotal</span>
                  <span className="font-lora text-sm font-semibold text-mocha-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-lora text-mocha-500">
                  <span>Total Items</span>
                  <span className="font-medium text-mocha-800">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                </div>
                <p className="font-lora text-[11px] text-mocha-400 italic pt-1 border-t border-mocha-200/60">
                  Complimentary luxury packaging &amp; insured shipping included across India.
                </p>
              </div>

              {/* Quick view of items already in bag */}
              {items.length > 1 && (
                <div>
                  <h4 className="font-cinzel text-[10px] tracking-[0.2em] text-mocha-400 uppercase mb-3">
                    Also in your bag ({items.length - 1} other {items.length - 1 === 1 ? 'item' : 'items'})
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {items
                      .filter((i) => i.product.id !== product.id)
                      .slice(0, 4)
                      .map((item) => (
                        item.product.image ? (
                          <img
                            key={item.product.id}
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-16 object-cover rounded border border-mocha-200 flex-shrink-0"
                          />
                        ) : (
                          <div key={item.product.id} className="w-12 h-16 flex items-center justify-center rounded border border-mocha-200 flex-shrink-0 p-1 text-center">
                            <span className="font-lora text-[8px] italic text-mocha-400">Soon</span>
                          </div>
                        )
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="p-6 border-t border-mocha-100 bg-white space-y-2.5">
              <button
                id="drawer-checkout-btn"
                onClick={() => {
                  const hasAccepted = localStorage.getItem('mocha_mogra_policy_accepted');
                  if (!hasAccepted) {
                    setShowAgePopup(true);
                    return;
                  }
                  handleCheckout();
                }}
                className="w-full py-3.5 bg-mocha-900 text-gold-200 font-cinzel text-xs tracking-[0.25em] uppercase hover:bg-mocha-800 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <ArrowRight size={15} /> Checkout Now
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="drawer-view-bag-btn"
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 border border-mocha-300 text-mocha-800 font-cinzel text-[11px] tracking-[0.15em] uppercase hover:border-mocha-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag size={13} /> View Bag ({totalItems})
                </button>

                <button
                  id="drawer-continue-shopping-btn"
                  onClick={onClose}
                  className="w-full py-2.5 border border-mocha-200 text-mocha-500 font-cinzel text-[11px] tracking-[0.15em] uppercase hover:border-mocha-400 hover:text-mocha-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
          <AgePrivacyPopup
            isOpen={showAgePopup}
            onAccept={() => {
              setShowAgePopup(false);
              handleCheckout();
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
