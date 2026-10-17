import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Instagram, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BRAND_LOGO, BRAND_NAME } from '../lib/brand';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error' | 'unavailable'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!supabase) {
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
    <footer className="border-t border-mocha-200 bg-mocha-900 text-gold-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={BRAND_LOGO}
                alt={`${BRAND_NAME} logo`}
                className="h-11 w-11 object-contain"
              />
              <span className="font-playfair text-xl font-bold text-gold-200">
                {BRAND_NAME}
              </span>
            </div>
            <p className="font-lora text-sm text-mocha-300 leading-relaxed max-w-xs">
              Bridging ancient Indian textile heritage with contemporary minimalist luxury. Slow fashion for the discerning soul.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="mailto:labelmochanmogra@gmail.com"
                aria-label="Email"
                className="text-mocha-400 hover:text-gold-300 transition-colors"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://www.instagram.com/mocha.n.mogra/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-mocha-400 hover:text-gold-300 transition-colors"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-cinzel text-xs tracking-[0.25em] uppercase text-gold-500 mb-5">
              Discover
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Enter the Wardrobe', path: '/shop' },
                { label: 'Our Story', path: '/our-story' },
                { label: 'Size Guide', path: '/size-guide' },
                { label: 'Wishlist', path: '/wishlist' },
                { label: 'Contact', path: '/contact' },
              ].map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className="font-lora text-sm text-mocha-400 hover:text-gold-300 transition-colors"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Ethics & Legal */}
          <div>
            <h4 className="font-cinzel text-xs tracking-[0.25em] uppercase text-gold-500 mb-5">
              Ethics &amp; Craft
            </h4>
            <ul className="space-y-3 mb-8">
              {['Artisan-led', 'Timeless Design', 'Ethical Sourcing', 'Sustainability'].map(
                (item) => (
                  <li key={item}>
                    <span className="font-lora text-sm text-mocha-400">{item}</span>
                  </li>
                )
              )}
            </ul>
            <h4 className="font-cinzel text-xs tracking-[0.25em] uppercase text-gold-500 mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="font-lora text-sm text-mocha-400 hover:text-gold-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="font-lora text-sm text-mocha-400 hover:text-gold-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="font-lora text-sm text-mocha-400 hover:text-gold-300 transition-colors">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="font-lora text-sm text-mocha-400 hover:text-gold-300 transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter (Footer) */}
          <div className="md:col-span-1">
            <h4 className="font-cinzel text-xs tracking-[0.25em] uppercase text-gold-500 mb-5">
              Newsletter
            </h4>
            <p className="font-lora text-sm text-mocha-400 mb-4 max-w-xs leading-relaxed">
              Join our list to receive updates on new arrivals, special offers and other discount information.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex max-w-xs">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                disabled={isSubscribing}
                className="w-full bg-transparent border-b border-mocha-700 pb-2 text-sm text-gold-200 placeholder-mocha-500 focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button 
                type="submit" 
                disabled={isSubscribing}
                className="absolute right-0 bottom-2 text-mocha-400 hover:text-gold-400 transition-colors disabled:opacity-50"
              >
                <ArrowRight size={16} />
              </button>
            </form>
            {subscribeStatus === 'success' && (
              <p className="text-green-500 text-xs mt-2 font-lora">Thank you for subscribing!</p>
            )}
            {subscribeStatus === 'error' && (
              <p className="text-red-500 text-xs mt-2 font-lora">Something went wrong.</p>
            )}
            {subscribeStatus === 'unavailable' && (
              <p className="text-mocha-500 text-xs mt-2 font-lora italic">Newsletter is currently unavailable.</p>
            )}
          </div>
        </div>

        <div className="border-t border-mocha-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-lora text-xs text-mocha-500">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. Handcrafted with Grace.
          </p>
          <p className="font-cinzel text-xs tracking-[0.2em] text-mocha-500 uppercase">
            Story Before Trend
          </p>
        </div>
      </div>
    </footer>
  );
}
