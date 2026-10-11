import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createShopifyCheckout } from '../lib/shopify';
import { useCurrency } from '../context/CurrencyContext';
import { initiateRazorpayPayment } from '../lib/razorpay';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { currency, formatPrice, usdRate } = useCurrency();
  const { user } = useAuth();
  const razorpayEnabled = import.meta.env.VITE_RAZORPAY_CHECKOUT_ENABLED === 'true';

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotalUsd = items.reduce(
    (sum, i) => sum + (i.product.priceUsd ?? (i.product.category === 'Sarees' ? 200 : 50)) * i.quantity,
    0
  );
  const threshold = currency === 'USD' ? 200 : 5000;
  const shippingFee = currency === 'USD' ? 25 : 500;
  const isFreeShipping = (currency === 'USD' ? subtotalUsd : subtotal) >= threshold;
  const shipping = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + (currency === 'USD' ? shipping * usdRate : shipping);
  const totalUsd = subtotalUsd + shipping;

  // Razorpay Standard Checkout Handler
  const handleRazorpayCheckout = async () => {
    if (currency !== 'INR') {
      setErrorMessage('Razorpay checkout is available for INR orders. Use Shopify checkout for international orders.');
      return;
    }
    setErrorMessage(null);
    setIsCheckingOut(true);

    await initiateRazorpayPayment({
      items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      name: 'Mocha & Mogra',
      description: `Purchase of ${items.reduce((acc, item) => acc + item.quantity, 0)} item(s)`,
      prefill: {
        name: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
        email: user?.email || '',
      },
      onSuccess: (response) => {
        setIsCheckingOut(false);
        clearCart();
        navigate('/order-confirmation', {
          state: {
            paymentId: response.payment_id,
            orderId: response.order_id,
          },
        });
      },
      onError: (err) => {
        setIsCheckingOut(false);
        setErrorMessage(err);
      },
      onDismiss: () => {
        setIsCheckingOut(false);
      },
    });
  };

  // Optional Shopify Checkout fallback
  const handleShopifyCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const itemsPayload = items.map((item) => ({
        variantId: item.product.shopifyVariantId || item.product.id,
        quantity: item.quantity,
      }));
      const checkoutUrl = await createShopifyCheckout(itemsPayload);
      window.location.href = checkoutUrl;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Shopify checkout is unavailable. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-3">Your Curated Selection</p>
          <h1 className="font-cinzel text-4xl md:text-5xl tracking-widest text-mocha-900 uppercase">
            Cart
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyCart onShop={() => navigate('/shop')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Items */}
            <div className="lg:col-span-2 space-y-0">
              <div className="border-t border-mocha-200">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.size ?? 'default'}`}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-mocha-200 py-8 flex gap-6"
                    >
                      {/* Arch image */}
                      <div
                        className="flex-shrink-0 w-28 overflow-hidden bg-mocha-100 cursor-pointer"
                        style={{ borderRadius: '6px', aspectRatio: '3/4' }}
                        onClick={() => navigate('/shop')}
                      >
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-3 text-center">
                            <span className="font-lora text-xs italic text-mocha-400">Images coming soon</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-500 mb-1">
                              {item.product.category} · {item.product.motif} Motif
                            </p>
                            <h3 className="font-playfair text-xl text-mocha-900 mb-1">
                              {item.product.name}
                            </h3>
                            <p className="font-lora text-sm text-mocha-500 italic">
                              {item.product.personality.join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="text-mocha-400 hover:text-mocha-800 transition-colors flex-shrink-0 p-1"
                            aria-label="Remove item"
                          >
                            <X size={16} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          {/* Quantity */}
                          <div className="flex items-center border border-mocha-200">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                              className="w-9 h-9 flex items-center justify-center text-mocha-600 hover:text-mocha-900 hover:bg-mocha-50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} strokeWidth={1.5} />
                            </button>
                            <span className="w-10 text-center font-lora text-sm text-mocha-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                              className="w-9 h-9 flex items-center justify-center text-mocha-600 hover:text-mocha-900 hover:bg-mocha-50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} strokeWidth={1.5} />
                            </button>
                          </div>

                          {item.size && <span className="font-lora text-sm text-mocha-500">Size: {item.size}</span>}

                          {/* Price */}
                          <p className="font-playfair text-lg text-mocha-900">
                            {formatPrice(
                              item.product.price * item.quantity,
                              (item.product.priceUsd ?? (item.product.category === 'Sarees' ? 200 : 50)) * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Continue Shopping */}
              <div className="pt-6">
                <button
                  onClick={() => navigate('/shop')}
                  className="flex items-center gap-2 font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-500 hover:text-mocha-800 transition-colors"
                >
                  ← Return to Wardrobe
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-mocha-200 p-8 sticky top-28">
                <h2 className="font-cinzel text-sm tracking-[0.2em] uppercase text-mocha-900 mb-8">
                  Order Summary
                </h2>

                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-lora rounded">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between font-lora text-sm text-mocha-700">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>{formatPrice(subtotal, subtotalUsd)}</span>
                  </div>
                  <div className="flex justify-between font-lora text-sm text-mocha-700">
                    <span>Artisanal Packaging</span>
                    <span className="text-forest-600 font-medium">Complimentary</span>
                  </div>
                  <div className="flex justify-between font-lora text-sm text-mocha-700">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-forest-600 font-medium">Free</span>
                      ) : (
                        currency === 'USD'
                          ? formatPrice(shipping * usdRate, shipping)
                          : formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="font-lora text-xs text-mocha-400 italic">
                      Add {formatPrice(
                        currency === 'USD' ? (threshold - subtotalUsd) * usdRate : threshold - subtotal,
                        currency === 'USD' ? threshold - subtotalUsd : Math.round((threshold - subtotal) / usdRate)
                      )} more for free shipping
                    </p>
                  )}
                </div>

                <p className="font-lora text-xs text-mocha-400 mb-8">
                  Gift cards and discount codes can be entered at Shopify checkout.
                </p>

                <div className="border-t border-mocha-200 pt-6 mb-8">
                  <div className="flex justify-between">
                    <span className="font-cinzel text-sm tracking-[0.15em] uppercase text-mocha-900">
                      Estimated Total
                    </span>
                    <span className="font-playfair text-xl text-mocha-900">
                      {formatPrice(total, totalUsd)}
                    </span>
                  </div>
                </div>

                {/* Razorpay prices and settles INR only; USD carts go through Shopify. */}
                {currency === 'INR' && razorpayEnabled && (
                  <button
                    onClick={handleRazorpayCheckout}
                    disabled={isCheckingOut}
                    className="w-full btn-primary-filled justify-center py-4 text-sm flex items-center gap-2 mb-3"
                  >
                    {isCheckingOut ? (
                      <>
                        Processing Payment...
                        <Loader2 size={14} className="animate-spin" strokeWidth={1.5} />
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} strokeWidth={1.5} />
                        Pay with Razorpay
                        <ArrowRight size={14} strokeWidth={1.5} />
                      </>
                    )}
                  </button>
                )}
                {currency === 'INR' && !razorpayEnabled && (
                  <p role="status" className="font-lora text-xs text-mocha-500 mb-3">
                    Razorpay checkout is temporarily unavailable. Continue securely with Shopify checkout.
                  </p>
                )}

                {/* Secondary Button: Shopify Checkout */}
                <button
                  onClick={handleShopifyCheckout}
                  disabled={isCheckingOut}
                  className="w-full border border-mocha-300 text-mocha-800 hover:bg-mocha-50 font-cinzel text-xs tracking-[0.15em] uppercase justify-center py-3 text-center transition-colors block"
                >
                  Checkout via Shopify
                </button>

                {currency === 'INR' && (
                  <div className="flex items-center justify-center gap-2 text-mocha-400 mt-5">
                    <ShieldCheck size={14} strokeWidth={1.5} />
                    <p className="font-cinzel text-[9px] tracking-[0.2em] uppercase">
                      Secure Razorpay Checkout
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <ShoppingBag size={40} className="text-mocha-300 mb-6" strokeWidth={1} />
      <h2 className="font-playfair text-3xl text-mocha-900 mb-4">Your cart is empty.</h2>
      <p className="font-lora text-sm text-mocha-500 leading-relaxed mb-10 max-w-sm">
        Every great wardrobe begins with a single piece. Browse the wardrobe and find the story that speaks to you.
      </p>
      <button onClick={onShop} className="btn-primary">
        Enter the Wardrobe <ArrowRight size={14} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}
