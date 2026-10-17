import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
const SearchOverlay = lazy(() => import('./components/SearchOverlay'));
const ProductModal = lazy(() => import('./components/ProductModal'));
const AddedToBagDrawer = lazy(() => import('./components/AddedToBagDrawer'));
const SplashLanding = lazy(() => import('./components/SplashLanding'));

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const WishlistPage = lazy(() => import('./pages/Wishlist'));

import type { Product } from './data/products';
import { trackPageView } from './lib/analytics';
import { WHATSAPP_NUMBER } from './lib/contact';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    trackPageView(pathname);
  }, [pathname]);
  return null;
}

function RouteLoading() {
  return (
    <div className="min-h-[44vh] flex items-center justify-center" role="status" aria-live="polite">
      <span className="font-lora text-sm italic text-mocha-400">Opening the collection…</span>
    </div>
  );
}

function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [addedSize, setAddedSize] = useState<string | undefined>();
  const location = useLocation();

  const isCheckoutFlow = location.pathname === '/auth';

  return (
    <div className="flex flex-col min-h-screen">
      {location.pathname === '/' && (
        <Suspense fallback={null}>
          <SplashLanding />
        </Suspense>
      )}
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1 overflow-x-clip">
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      {!isCheckoutFlow && <Footer />}
      {!isCheckoutFlow && <WhatsAppButton phoneNumber={WHATSAPP_NUMBER} />}


      {/* Global Search Overlay */}
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSelectProduct={(product) => {
              setSelectedProduct(product);
              setSearchOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* Global Product Modal (from search) */}
      {selectedProduct && (
        <Suspense fallback={null}>
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddedToCart={(prod, size) => { setAddedProduct(prod); setAddedSize(size); }}
          />
        </Suspense>
      )}

      {/* Global Added To Bag Luxury Slide-Over Drawer */}
      {addedProduct && (
        <Suspense fallback={null}>
          <AddedToBagDrawer
            product={addedProduct}
            size={addedSize}
            onClose={() => setAddedProduct(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <WishlistProvider>
            <CartProvider>
              <ScrollToTop />
              <Layout />
            </CartProvider>
          </WishlistProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
