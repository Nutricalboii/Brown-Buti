import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { configureAutoplayVideo, playWithAutoplayFallback } from '../lib/video-autoplay';
import { BRAND_LOGO, BRAND_NAME } from '../lib/brand';

export default function SplashLanding() {
  const [visible, setVisible] = useState(() => {
    return sessionStorage.getItem('splashShown') !== 'true';
  });
  const navigate = useNavigate();
  const scrollPosRef = useRef(0);
  const isDismissing = useRef(false);

  const [videosReady, setVideosReady] = useState(0);
  const leftVidRef = useRef<HTMLVideoElement | null>(null);
  const midVidRef = useRef<HTMLVideoElement | null>(null);
  const rightVidRef = useRef<HTMLVideoElement | null>(null);
  const mobileVidRef = useRef<HTMLVideoElement | null>(null);

  const handleLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    configureAutoplayVideo(e.currentTarget);
    void e.currentTarget.play().catch(() => {});
    setVideosReady((prev) => prev + 1);
  };

  useEffect(() => {
    if (!visible) return;
    const cleanups = [
      playWithAutoplayFallback(mobileVidRef.current),
      playWithAutoplayFallback(leftVidRef.current),
      playWithAutoplayFallback(midVidRef.current),
      playWithAutoplayFallback(rightVidRef.current),
    ];
    return () => {
      cleanups.forEach((c) => c());
    };
  }, [visible]);

  useEffect(() => {
    // Wait until at least 1 video is ready, then after a brief timeout, sync their current times.
    // We keep `autoPlay` on the video elements so the browser handles playing automatically,
    // avoiding autoplay-block restrictions. We just seek them to their offsets simultaneously.
    if (videosReady > 0) {
      const timer = setTimeout(() => {
        if (leftVidRef.current && leftVidRef.current.duration) {
          leftVidRef.current.currentTime = leftVidRef.current.duration * 0.33;
        }
        if (rightVidRef.current && rightVidRef.current.duration) {
          rightVidRef.current.currentTime = rightVidRef.current.duration * 0.66;
        }
        if (midVidRef.current) midVidRef.current.currentTime = 0;
        if (mobileVidRef.current) mobileVidRef.current.currentTime = 0;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videosReady]);

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
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[100] bg-mocha-900 flex flex-col justify-end cursor-pointer"
          onClick={dismissSplash}
        >
          {/* Background Media */}
          <div className="absolute inset-0 w-full h-full bg-mocha-900">
            {/* Mobile Video */}
            <video
              ref={(node) => {
                mobileVidRef.current = node;
                configureAutoplayVideo(node);
              }}
              poster="https://res.cloudinary.com/xtrw55ut/video/upload/so_0/splash.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              onLoadedMetadata={handleLoaded}
              className="absolute inset-0 w-full h-full object-cover opacity-70 md:hidden"
            >
              <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.webm" type="video/webm" />
              <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.mp4" type="video/mp4" />
            </video>
            
            {/* Desktop Collage */}
            <div className="absolute inset-0 hidden md:grid grid-cols-3 w-full h-full">
              <video
                ref={(node) => {
                  leftVidRef.current = node;
                  configureAutoplayVideo(node);
                }}
                poster="https://res.cloudinary.com/xtrw55ut/video/upload/so_0/splash.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                controls={false}
                onLoadedMetadata={handleLoaded}
                className="w-full h-full object-cover opacity-70"
              >
                <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.webm" type="video/webm" />
                <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.mp4" type="video/mp4" />
              </video>
              
              <video
                ref={(node) => {
                  midVidRef.current = node;
                  configureAutoplayVideo(node);
                }}
                poster="https://res.cloudinary.com/xtrw55ut/video/upload/so_0/splash.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                controls={false}
                onLoadedMetadata={handleLoaded}
                className="w-full h-full object-cover opacity-80 border-x border-mocha-900/20 shadow-2xl z-10"
              >
                <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.webm" type="video/webm" />
                <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.mp4" type="video/mp4" />
              </video>
              
              <video
                ref={(node) => {
                  rightVidRef.current = node;
                  configureAutoplayVideo(node);
                }}
                poster="https://res.cloudinary.com/xtrw55ut/video/upload/so_0/splash.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                controls={false}
                onLoadedMetadata={handleLoaded}
                className="w-full h-full object-cover opacity-70"
              >
                <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.webm" type="video/webm" />
                <source src="https://res.cloudinary.com/xtrw55ut/video/upload/q_auto,f_auto/splash.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-mocha-900/90 via-transparent to-mocha-900/30 z-20 pointer-events-none" />
          </div>

          {/* Logo */}
          <div className="absolute top-8 left-8 z-10">
            <img
              src={BRAND_LOGO}
              alt={`${BRAND_NAME} logo`}
              className="h-16 w-16 rounded-sm object-cover shadow-lg md:h-20 md:w-20"
            />
          </div>

          {/* Hint text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10 text-center px-4"
          >
            <p className="font-cinzel text-white/70 text-xs tracking-[0.3em] uppercase animate-pulse">
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
