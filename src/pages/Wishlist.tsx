import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Wishlist() {
  const { items, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-400 hover:text-mocha-700 transition-colors mb-12"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-baseline gap-4 mb-10">
            <h1 className="font-cinzel text-3xl md:text-4xl tracking-widest text-mocha-900 uppercase">
              Wishlist
            </h1>
            {items.length > 0 && (
              <span className="font-lora text-mocha-400 text-sm">
                {items.length} {items.length === 1 ? 'piece' : 'pieces'} saved
              </span>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty state */
            <div className="text-center py-24">
              <Heart size={48} strokeWidth={1} className="text-mocha-200 mx-auto mb-6" />
              <h2 className="font-cinzel text-xl tracking-widest text-mocha-700 uppercase mb-3">
                Your Wishlist is Empty
              </h2>
              <p className="font-lora text-mocha-400 mb-8 max-w-sm mx-auto leading-relaxed">
                Save the pieces that speak to you. They'll wait here until you're ready.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 font-cinzel text-xs tracking-[0.2em] uppercase bg-mocha-900 text-gold-200 px-8 py-3 hover:bg-mocha-700 transition-colors"
              >
                Explore the Wardrobe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {items.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-white border border-mocha-100 hover:border-mocha-300 transition-colors"
                >
                  {/* Product image */}
                  <div
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => window.location.href = `/shop?product=${product.id}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Remove from wishlist */}
                    <button
                      id={`wishlist-remove-${product.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-mocha-600 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-5">
                    <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.2em] text-mocha-400 uppercase mb-1">
                      {product.motif} · {product.category}
                    </p>
                    <h3
                      className="font-playfair text-base sm:text-lg text-mocha-900 mb-3 cursor-pointer hover:underline"
                      onClick={() => window.location.href = `/shop?product=${product.id}`}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-lora text-mocha-700 font-medium">
                        {formatPrice(product.price, product.priceUsd)}
                      </span>
                      <button
                        id={`wishlist-add-to-cart-${product.id}`}
                        onClick={() => addItem(product)}
                        aria-label={`Add ${product.name} to cart`}
                        className="flex items-center gap-1.5 font-cinzel text-xs tracking-widest uppercase text-mocha-600 hover:text-mocha-900 transition-colors"
                      >
                        <ShoppingBag size={14} />
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
