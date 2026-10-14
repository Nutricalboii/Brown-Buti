import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getResponsiveProductImageSrcSet } from '../lib/responsive-product-image';

interface ImageCarouselProps {
  media: string[];
  alt?: string;
  className?: string;
  priority?: boolean;
  fullResolution?: boolean;
  sizes?: string;
}

interface MediaSlideProps {
  src: string;
  alt: string;
  isVideo: boolean;
  priority: boolean;
  poster?: string;
  sizes: string;
  fullResolution: boolean;
}

function isVideoUrl(src?: string): boolean {
  if (!src) return false;
  const normalized = src.toLowerCase();
  return ['.webm', '.mp4', '.mov', '.m4v'].some((extension) => normalized.endsWith(extension));
}

function MediaSlide({ src, alt, isVideo, priority, poster, sizes, fullResolution }: MediaSlideProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const hasWebmFallback = src.toLowerCase().endsWith('.webm');
  const [useMp4Fallback, setUseMp4Fallback] = useState(false);
  const mp4FallbackSrc = hasWebmFallback ? src.replace(/\.webm$/i, '.mp4') : undefined;

  return (
    <div className="relative h-full w-full bg-mocha-50" aria-busy={status === 'loading'}>
      {status === 'loading' && !isVideo && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 animate-pulse bg-mocha-100 motion-reduce:animate-none"
        />
      )}

      {status === 'error' ? (
        <div
          role="img"
          aria-label={`${alt} could not be loaded`}
          className="flex h-full min-h-48 w-full items-center justify-center px-6 text-center font-lora text-sm italic text-mocha-400"
        >
          {isVideo ? 'Video unavailable' : 'Image unavailable'}
        </div>
      ) : isVideo ? (
        <video
          key={useMp4Fallback ? mp4FallbackSrc : src}
          className="h-full w-full object-contain"
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          preload="metadata"
          onCanPlay={(event) => {
            setStatus('ready');
            void event.currentTarget.play().catch(() => undefined);
          }}
          onError={() => {
            if (mp4FallbackSrc && !useMp4Fallback) {
              setStatus('loading');
              setUseMp4Fallback(true);
            } else {
              setStatus('error');
            }
          }}
        >
          <source src={useMp4Fallback && mp4FallbackSrc ? mp4FallbackSrc : src} type={useMp4Fallback || !hasWebmFallback ? 'video/mp4' : 'video/webm'} />
        </video>
      ) : (
        <img
          src={src}
          srcSet={fullResolution ? undefined : getResponsiveProductImageSrcSet(src)}
          sizes={sizes}
          alt={alt}
          className="h-full w-full object-contain"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}

export default function ImageCarousel({ media, alt = 'Product Image', className = '', priority = false, fullResolution = false, sizes = '(max-width: 768px) 100vw, 512px' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const currentMedia = media[currentIndex];
  const isVideo = isVideoUrl(currentMedia);
  const hasAnyVideo = media.some(isVideoUrl);
  const firstVideoIndex = media.findIndex(isVideoUrl);

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      {media.length === 0 ? (
        <div className="w-full h-full min-h-48 flex items-center justify-center bg-mocha-50 px-6 text-center">
          <span className="font-lora text-sm italic text-mocha-400">Images coming soon</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <MediaSlide
              src={currentMedia}
              alt={`${alt} - ${currentIndex + 1}`}
              isVideo={isVideo}
              priority={priority}
              poster={isVideo ? media.find((item) => !isVideoUrl(item)) : undefined}
              sizes={sizes}
              fullResolution={fullResolution}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Top Video Indicator Badge (Myntra / Flipkart style) */}
      {hasAnyVideo && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (firstVideoIndex !== -1) {
              setCurrentIndex(firstVideoIndex);
            }
          }}
          className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-cinzel transition-all shadow-sm ${
            isVideo
              ? 'bg-mocha-900/90 text-gold-300 border border-gold-400/50 backdrop-blur-md'
              : 'bg-black/40 hover:bg-black/60 text-white/90 hover:text-white border border-white/20 backdrop-blur-md'
          }`}
          aria-label={isVideo ? 'Currently viewing video' : 'Watch product video'}
        >
          <Play size={9} className="fill-current" />
          <span>Video</span>
        </button>
      )}

      {media.length > 1 && (
        <>
          {/* Navigation Arrows (visible on hover for desktop) */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/70 hover:bg-white text-mocha-900 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/70 hover:bg-white text-mocha-900 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-sm"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots & Video Indicators (Myntra / Flipkart style) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm pointer-events-auto shadow-sm">
            {media.map((item, i) => {
              const itemIsVideo = isVideoUrl(item);
              const isActive = i === currentIndex;

              if (itemIsVideo) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    className={`p-0.5 flex items-center justify-center transition-all ${
                      isActive
                        ? 'text-white scale-110 drop-shadow'
                        : 'text-white/50 hover:text-white/80'
                    }`}
                    aria-label={`View product video slide ${i + 1}`}
                  >
                    <Play size={10} className="fill-current" />
                  </button>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 transition-all rounded-full ${
                    isActive
                      ? 'w-3 bg-white shadow-sm'
                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`View product image slide ${i + 1}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
