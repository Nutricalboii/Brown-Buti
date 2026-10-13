import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getResponsiveProductImageSrcSet } from '../lib/responsive-product-image';

interface ImageCarouselProps {
  media: string[];
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

interface MediaSlideProps {
  src: string;
  alt: string;
  isVideo: boolean;
  priority: boolean;
  poster?: string;
  sizes: string;
}

function MediaSlide({ src, alt, isVideo, priority, poster, sizes }: MediaSlideProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const hasWebmFallback = src.toLowerCase().endsWith('.webm');

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
          className="h-full w-full object-contain"
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setStatus('ready')}
          onError={() => setStatus('error')}
        >
          <source src={src} type={hasWebmFallback ? 'video/webm' : 'video/mp4'} />
          {hasWebmFallback && (
            <source src={src.replace(/\.webm$/i, '.mp4')} type="video/mp4" />
          )}
        </video>
      ) : (
        <img
          src={src}
          srcSet={getResponsiveProductImageSrcSet(src)}
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

export default function ImageCarousel({ media, alt = 'Product Image', className = '', priority = false, sizes = '(max-width: 768px) 100vw, 512px' }: ImageCarouselProps) {
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
  const normalizedMedia = currentMedia?.toLowerCase() ?? '';
  const isVideo = ['.webm', '.mp4', '.mov', '.m4v'].some((extension) => normalizedMedia.endsWith(extension));

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
              poster={isVideo ? media.find((item) => !['.webm', '.mp4', '.mov', '.m4v'].some((extension) => item.toLowerCase().endsWith(extension))) : undefined}
              sizes={sizes}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {media.length > 1 && (
        <>
          {/* Navigation Arrows (visible on hover for desktop) */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/60 hover:bg-white text-mocha-900 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/60 hover:bg-white text-mocha-900 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-sm"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {media.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
