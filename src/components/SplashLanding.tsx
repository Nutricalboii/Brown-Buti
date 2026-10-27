import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGO, BRAND_NAME } from '../lib/brand';

export default function SplashLanding() {
  const [visible, setVisible] = useState(() => {
    return sessionStorage.getItem('splashShown') !== 'true';
  });
  const navigate = useNavigate();
  const scrollPosRef = useRef(0);
  const isDismissing = useRef(false);
  const coverVideoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!visible || prefersReducedMotion) return;

    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
      return;
    }

    const video = coverVideoRef.current;
    if (!video) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || document.visibilityState === 'hidden') return;
      video.src = '/videos/brown-buti-splash.mp4';
      video.load();
      void video.play().catch(() => {
        // Keep the poster visible if autoplay is unavailable.
      });
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [visible, prefersReducedMotion]);

  // Lock scroll position while splash is visible so the home page
  // never "moves" underneath — instead we fix the body in place.
  useEffect(() => {
    if (visible) {
      // Capture & freeze the scroll position
      scrollPosRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        if (!isDismissing.current) {
          // Restore body position if unmounted unexpectedly
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.overflow = '';
        }
      };
    } else if (isDismissing.current) {
      // Delay restoring body until exit animation completes
      const timer = setTimeout(() => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        isDismissing.current = false;
      }, 800);

      return () => {
        clearTimeout(timer);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
      };
    }
  }, [visible]);

  const dismissSplash = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    setVisible(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  useEffect(() => {
    if (!visible) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 20) {
        dismissSplash();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].screenY;
      if (Math.abs(touchStartY - touchEndY) > 40) {
        dismissSplash();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [visible]);

  const handleExplore = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissSplash();
    navigate('/shop');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: '-100%' }}
          transition={{ duration: prefersReducedMotion ? 0.18 : 0.8, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[100] bg-mocha-900 flex flex-col justify-end cursor-pointer"
          onClick={dismissSplash}
        >
          {/* Background Media */}
          <div className="absolute inset-0 h-full w-full overflow-hidden bg-mocha-900">
            <div
              aria-hidden="true"
              className="absolute inset-0 scale-105 bg-cover bg-center opacity-55 blur-sm"
              style={{ backgroundImage: 'url(/images/brown-buti-splash-poster.webp)' }}
            />
            <video
              ref={coverVideoRef}
              poster="/images/brown-buti-splash-poster.webp"
              muted
              playsInline
              loop
              preload="none"
              controls={false}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-80 md:left-1/3 md:w-1/3 md:border-x md:border-mocha-900/20"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-mocha-900/90 via-mocha-900/15 to-mocha-900/30 pointer-events-none" />
          </div>

          {/* Logo */}
          <div className="absolute top-8 left-8 z-10">
            <img
              src={BRAND_LOGO}
              alt={`${BRAND_NAME} logo`}
              className="h-16 w-16 object-contain md:h-20 md:w-20"
            />
          </div>

          {/* Hint text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10 text-center px-4"
          >
            <p className="font-cinzel text-white/80 text-xs tracking-[0.3em] uppercase">
              Click, Swipe or Scroll to Enter
            </p>
          </motion.div>

          {/* CTA */}
          <div className="relative z-10 px-6 pb-12 md:pb-16 flex justify-center max-w-lg mx-auto w-full">
            <button
              onClick={handleExplore}
              className="w-full sm:w-auto bg-gold-500 hover:bg-gold-400 text-mocha-900 font-cinzel text-xs tracking-[0.2em] uppercase py-4 px-10 transition-colors flex items-center justify-center gap-2"
            >
              Enter the Wardrobe <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
