import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BRAND_NAME } from '../lib/brand';

export default function Terms() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-400 hover:text-mocha-700 transition-colors mb-12"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-cinzel text-3xl md:text-4xl tracking-widest text-mocha-900 uppercase mb-8">
            Terms of Service
          </h1>
          <div className="font-lora text-mocha-600 space-y-6 leading-relaxed">
            <p>
              Welcome to {BRAND_NAME}. By accessing or using our website and services, you agree to comply with and be bound by the following Terms of Service.
            </p>
            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to designs, images, text, and logos, is the exclusive property of {BRAND_NAME} and its rights holders. Any unauthorized reproduction or use of this intellectual property is strictly prohibited.
            </p>
            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Purchases and Returns</h2>
            <p>
              Every saree is crafted with artisan-led embroidery. Slight variations in craftsmanship are a hallmark of our premium, handcrafted process. Returns and exchanges are handled on a case-by-case basis as detailed in our return policy.
            </p>
            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Limitation of Liability</h2>
            <p>
              {BRAND_NAME} shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our website or products.
            </p>
            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the site constitutes acceptance of the updated terms.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
