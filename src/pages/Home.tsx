import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Feather } from 'lucide-react';
import { products } from '../data/products';
import { OrganizationJsonLd } from '../lib/jsonld';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';
import { getResponsiveProductImageSrcSet } from '../lib/responsive-product-image';
import { configureAutoplayVideo, playWithAutoplayFallback } from '../lib/video-autoplay';

interface TeaserVideoProps {
  webmSrc: string;
  mp4Src: string;
  poster: string;
  className?: string;
  style?: React.CSSProperties;
}

function TeaserVideo({ webmSrc, mp4Src, poster, className, style }: TeaserVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    return playWithAutoplayFallback(videoRef.current);
  }, []);

  return (
    <video
      ref={(node) => {
        videoRef.current = node;
        configureAutoplayVideo(node);
      }}
      poster={poster}
      className={className}
      style={style}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      onCanPlay={(e) => {
        configureAutoplayVideo(e.currentTarget);
        void e.currentTarget.play().catch(() => {});
      }}
      onLoadedMetadata={(e) => {
        configureAutoplayVideo(e.currentTarget);
        void e.currentTarget.play().catch(() => {});
      }}
    >
      <source src={webmSrc} type="video/webm" />
      <source src={mp4Src} type="video/mp4" />
    </video>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function Home() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const featured = products.slice(0, 3);
  const [teaserInView, setTeaserInView] = useState(false);
  
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error' | 'unavailable'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!supabase) {
      // Safe fallback if .env is missing
      setSubscribeStatus('unavailable');
      return;
    }

    setIsSubscribing(true);
    setSubscribeStatus('idle');

    try {
      const { error } = await supabase.functions.invoke('subscribe-mailchimp', {
        body: { email }
      });

      if (error) throw error;
      
      setSubscribeStatus('success');
      setEmail('');
    } catch {
      // Avoid logging provider details or request data in the browser console.
      console.error('Newsletter signup failed.');
      setSubscribeStatus('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="pt-20">
      <OrganizationJsonLd />
      {/* Hero */}
      <section className="min-h-[92vh] flex items-center py-16 lg:py-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1 pb-16 lg:pb-0">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-8 h-px bg-mocha-400" />
                <span className="section-label text-[10px]">The saree, with a little more you.</span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="font-playfair text-5xl md:text-6xl lg:text-7xl text-mocha-900 leading-[1.1] mb-8"
              >
                A Wardrobe<br />
                of Stories,<br />
                <em className="not-italic text-mocha-600">Stitched in Silk.</em>
              </motion.h1>

              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-4 mb-10"
              >
                <div className="w-12 h-px bg-mocha-300" />
                <Feather size={12} className="text-gold-600" strokeWidth={1.5} />
                <div className="w-12 h-px bg-mocha-300" />
              </motion.div>

              <motion.p
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="font-lora text-lg text-mocha-600 leading-relaxed mb-12 max-w-md"
              >
                Each piece carries a mood, a motif, and a moment.
              </motion.p>

              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={() => navigate('/shop')}
                  className="btn-primary"
                >
                  Enter the Wardrobe
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </motion.div>
            </div>

            {/* Hero Image — arch */}
            <motion.div
              className="order-1 lg:order-2 flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="relative w-full max-w-md lg:max-w-xl">
                <div
                  className="rounded-md w-full overflow-hidden bg-mocha-100 shadow-2xl relative"
                  style={{ aspectRatio: '4/3' }}
                >
                  <img
                    src="/images/covermain.webp"
                    alt="Hero Saree"
                    className="absolute inset-0 w-full h-full object-cover"
                    fetchPriority="high"
                  />
                </div>
                {/* Floating tag */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -right-6 bottom-24 bg-mocha-900 text-gold-200 px-4 py-3 shadow-lg"
                >
                  <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase">New Arrivals</p>
                  <p className="font-playfair text-sm mt-0.5">8 Pieces</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Motif Strip */}
      <section className="border-y border-mocha-200 overflow-hidden py-8 md:py-0">
        <div className="flex items-center w-max">
          {[...Array(4)].map((_, i) => (
            <img
              key={i}
              src="/images/motifs.webp"
              alt="Brand Motifs"
              className="h-20 md:h-28 lg:h-32 w-auto object-contain"
            />
          ))}
        </div>
      </section>

      {/* Brand Teaser */}
      <section className="py-24 lg:py-36">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            {/* Image grid */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-2 md:gap-4 lg:gap-6 w-full items-center">
              {/* Left Column - coverreel2 (Symmetrical to Right) */}
              <div className="flex flex-col">
                <motion.div
                  className="rounded-md overflow-hidden bg-mocha-100 relative w-full"
                  style={{ aspectRatio: '9/16' }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "200px" }}
                  onViewportEnter={() => setTeaserInView(true)}
                  transition={{ duration: 0.7 }}
                >
                  {teaserInView && (
                    <TeaserVideo
                      webmSrc="https://res.cloudinary.com/xtrw55ut/video/upload/coverreel2.webm"
                      mp4Src="https://res.cloudinary.com/xtrw55ut/video/upload/coverreel2.mp4"
                      poster="https://res.cloudinary.com/xtrw55ut/video/upload/so_0/coverreel2.jpg"
                      className="absolute top-1/2 left-1/2 max-w-none"
                      style={{ width: '177.77%', height: '56.25%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
                    />
                  )}
                </motion.div>
              </div>

              {/* Middle Column - coverreel1 (Highest) */}
              <div className="flex flex-col">
                <motion.div
                  className="rounded-md overflow-hidden bg-mocha-100 relative w-full"
                  style={{ aspectRatio: '3/4' }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "200px" }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  {teaserInView && (
                    <TeaserVideo
                      webmSrc="https://res.cloudinary.com/xtrw55ut/video/upload/a_-90,so_3,eo_7/coverreel1.webm"
                      mp4Src="https://res.cloudinary.com/xtrw55ut/video/upload/a_-90,so_3,eo_7/coverreel1.mp4"
                      poster="https://res.cloudinary.com/xtrw55ut/video/upload/a_-90,so_3/coverreel1.jpg"
                      className="absolute inset-0 w-full h-full object-cover object-[center_80%]"
                    />
                  )}
                </motion.div>
              </div>

              {/* Right Column - coverreel3 (Symmetrical to Left) */}
              <div className="flex flex-col">
                <motion.div
                  className="rounded-md overflow-hidden bg-mocha-50 relative w-full"
                  style={{ aspectRatio: '9/16' }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "200px" }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  {teaserInView && (
                    <TeaserVideo
                      webmSrc="https://res.cloudinary.com/xtrw55ut/video/upload/eo_4/coverreel3.webm"
                      mp4Src="https://res.cloudinary.com/xtrw55ut/video/upload/eo_4/coverreel3.mp4"
                      poster="https://res.cloudinary.com/xtrw55ut/video/upload/so_0/coverreel3.jpg"
                      className="absolute top-1/2 left-1/2 max-w-none"
                      style={{ width: '177.77%', height: '56.25%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Text */}
            <motion.div
              className="lg:col-span-5 lg:pl-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="section-label mb-6">The Brand</p>
              <h2 className="font-playfair text-4xl lg:text-5xl text-mocha-900 leading-tight mb-8">
                Inspired by Heritage.<br />
                <em>Designed for Today.</em>
              </h2>
              <p className="font-lora text-base text-mocha-600 leading-relaxed mb-6">
                Mocha & Mogra is a contemporary premium saree label that celebrates storytelling through design. Every saree is crafted in premium silk and brought to life with artisan-led machine embroidery.
              </p>
              <p className="font-lora text-base text-mocha-600 leading-relaxed mb-10">
                We aren&apos;t creating seasonal collections. We are creating stories women can wear.
              </p>
              <button
                onClick={() => navigate('/our-story')}
                className="btn-primary"
              >
                Our Story <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-28 bg-mocha-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-4">
              The Wardrobe
            </p>
            <h2 className="font-playfair text-4xl lg:text-5xl text-gold-200">
              Stories Worth Wearing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="group cursor-pointer"
                onClick={() => navigate('/shop')}
              >
                <div
                  className="rounded-md overflow-hidden bg-mocha-700 mb-5 transition-transform duration-500 group-hover:-translate-y-1"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img
                    src={product.image}
                    srcSet={getResponsiveProductImageSrcSet(product.image)}
                    sizes="(max-width: 767px) 90vw, 30vw"
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="font-cinzel text-xs tracking-[0.2em] uppercase text-gold-400 mb-1">
                  {product.name}
                </p>
                <p className="font-lora text-sm text-mocha-400">{formatPrice(product.price, product.priceUsd)}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 border border-gold-500 text-gold-300 font-cinzel text-xs tracking-[0.2em] uppercase px-8 py-3 hover:bg-gold-500 hover:text-mocha-900 transition-all duration-300"
            >
              See the Full Edit <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {/* Values Strip */}
      <section className="py-20 bg-[#FFFEF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Artisan-Led\nCraftsmanship', icon: '✦' },
              { label: 'Timeless\nYet Contemporary', icon: '✦' },
              { label: 'Thoughtful\nDetails', icon: '✦' },
              { label: 'Made to Be\nCherished', icon: '✦' },
            ].map(({ label, icon }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex flex-col items-center gap-3"
              >
                <span className="text-gold-500 text-lg">{icon}</span>
                <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-mocha-600 whitespace-pre-line leading-5">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-px h-16 bg-mocha-300 mx-auto mb-10" />
            <blockquote className="font-playfair text-2xl md:text-3xl lg:text-4xl italic text-mocha-800 leading-relaxed mb-10">
              "Luxury, for me, has never been about loud logos. It is about thoughtful design. Beautiful craftsmanship."
            </blockquote>
            <p className="section-label">— Founder, Mocha & Mogra</p>
            <div className="w-px h-16 bg-mocha-300 mx-auto mt-10" />
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 border-t border-mocha-200">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="section-label mb-4">Stay in the Story</p>
          <h3 className="font-playfair text-3xl text-mocha-900 mb-6">
            Be the first to know.
          </h3>
          <p className="font-lora text-sm text-mocha-600 mb-8 leading-relaxed">
            New pieces, behind-the-scenes stories, and quiet moments from the atelier — delivered thoughtfully.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-0 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 input-field border-b border-r-0 border-mocha-300 px-0 pr-4"
              required
              disabled={isSubscribing}
            />
            <button 
              type="submit"
              disabled={isSubscribing}
              className="btn-primary-filled text-xs px-6 py-3 disabled:opacity-70"
            >
              {isSubscribing ? 'Wait...' : 'Subscribe'}
            </button>
          </form>
          {subscribeStatus === 'success' && (
            <p className="text-green-600 text-sm mt-3 font-lora">Thank you for subscribing!</p>
          )}
          {subscribeStatus === 'error' && (
            <p className="text-red-600 text-sm mt-3 font-lora">Something went wrong. Please try again.</p>
          )}
          {subscribeStatus === 'unavailable' && (
            <p className="text-mocha-500 text-sm mt-3 font-lora italic">Newsletter is currently unavailable.</p>
          )}
        </div>
      </section>
    </div>
  );
}
