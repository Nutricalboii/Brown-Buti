import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Enter the Wardrobe', path: '/shop' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'Contact', path: '/contact' },
];

interface NavbarProps {
  onSearchOpen: () => void;
}

export default function Navbar({ onSearchOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { totalWishlisted } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FFFEF7]/95 backdrop-blur-md shadow-sm border-b border-mocha-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/xtrw55ut/image/upload/mnmlogo-Photoroom.webp"
                alt="Mocha & Mogra"
                className="h-10 w-10 object-contain"
              />
              <span className="font-playfair text-lg font-bold text-mocha-900 tracking-wide hidden sm:block">
                Mocha &amp; Mogra
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `nav-link text-sm font-lora tracking-wide ${
                      isActive ? 'text-mocha-900 font-medium' : 'text-mocha-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="relative">
                      {link.label}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-mocha-700" />
                      )}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Currency Toggle */}
              {location.pathname === '/shop' && (
                <div className="flex items-center gap-1 font-cinzel text-[10px] tracking-[0.1em] text-mocha-600 bg-mocha-50/50 rounded-full px-2 py-1 border border-mocha-200">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-2 py-1 rounded-full transition-colors ${currency === 'INR' ? 'bg-mocha-800 text-gold-200' : 'hover:bg-mocha-100'}`}
                >
                  INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-1 rounded-full transition-colors ${currency === 'USD' ? 'bg-mocha-800 text-gold-200' : 'hover:bg-mocha-100'}`}
                >
                  USD
                </button>
              </div>
              )}

              <button
                onClick={onSearchOpen}
                aria-label="Search"
                className="text-mocha-600 hover:text-mocha-900 transition-colors ml-1 sm:ml-2"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              


              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                aria-label="Wishlist"
                className="relative text-mocha-600 hover:text-mocha-900 transition-colors"
              >
                <Heart size={18} strokeWidth={1.5} />
                {totalWishlisted > 0 && (
                  <span className="absolute -top-2 -right-2 bg-mocha-800 text-gold-200 font-cinzel text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalWishlisted > 9 ? '9+' : totalWishlisted}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/cart')}
                aria-label="Shopping bag"
                className="relative text-mocha-600 hover:text-mocha-900 transition-colors"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-mocha-800 text-gold-200 font-cinzel text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
              <button
                aria-label="Toggle menu"
                className="md:hidden text-mocha-700 hover:text-mocha-900 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[#FFFEF7] pt-20 px-8 md:hidden"
          >
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `font-cinzel text-lg md:text-xl tracking-widest uppercase ${
                      isActive ? 'text-mocha-900' : 'text-mocha-500'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-12 flex items-center justify-center gap-2 font-cinzel text-xs tracking-[0.15em] text-mocha-600">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-2 border transition-colors ${currency === 'INR' ? 'border-mocha-800 bg-mocha-800 text-gold-200' : 'border-mocha-200 hover:border-mocha-400'}`}
              >
                INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 border transition-colors ${currency === 'USD' ? 'border-mocha-800 bg-mocha-800 text-gold-200' : 'border-mocha-200 hover:border-mocha-400'}`}
              >
                USD
              </button>
            </div>
            <div className="mt-8 border-t border-mocha-100 pt-8 text-mocha-500 font-lora text-sm">
              labelmochanmogra@gmail.com
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
