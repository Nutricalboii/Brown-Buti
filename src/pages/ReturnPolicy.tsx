import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BRAND_NAME } from '../lib/brand';

export default function ReturnPolicy() {
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
          <h1 className="font-cinzel text-3xl md:text-4xl tracking-widest text-mocha-900 uppercase mb-4">
            Return &amp; Refund Policy
          </h1>
          <p className="font-lora text-mocha-400 text-sm tracking-widest mb-10">
            Effective Date: August 2025
          </p>

          <div className="font-lora text-mocha-600 space-y-6 leading-relaxed">
            <p>
              At {BRAND_NAME}, each piece is crafted with care and intention. We want you to love what you receive. Please read our return and refund policy carefully before placing your order.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Our Return Window</h2>
            <p>
              We accept return requests within <strong>7 days</strong> of delivery for eligible items. To initiate a return, please contact us at{' '}
              <a href="mailto:labelmochanmogra@gmail.com" className="text-mocha-700 underline underline-offset-2">
                labelmochanmogra@gmail.com
              </a>{' '}
              within this window.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Eligible Items for Return</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Items must be unused, unworn, and unwashed.</li>
              <li>All original tags and packaging must be intact.</li>
              <li>The item must be in the same condition as received.</li>
              <li>Sale items and custom/bespoke orders are not eligible for return.</li>
            </ul>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Non-Returnable Items</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Items marked as final sale or clearance.</li>
              <li>Custom-made or personalised orders.</li>
              <li>Items that show signs of use, alteration, or damage caused by the customer.</li>
              <li>Items returned after the 7-day window.</li>
            </ul>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Refund Process</h2>
            <p>
              Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund within <strong>3–5 business days</strong>.
            </p>
            <p>
              Approved refunds will be processed to your original payment method within <strong>7–10 business days</strong> after approval. Shipping charges are non-refundable. If the return is due to a defect or error on our part, we will cover the return shipping cost.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Exchange Policy</h2>
            <p>
              We are happy to offer exchanges for a different size or colour (subject to availability). Please mention your preferred exchange item when writing to us.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Damaged or Wrong Item Received</h2>
            <p>
              If you received a damaged, defective, or incorrect item, please contact us within <strong>48 hours</strong> of delivery with photographs of the item and packaging. We will arrange a replacement or full refund at no additional cost to you.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">How to Initiate a Return</h2>
            <ol className="list-decimal list-outside ml-5 space-y-2">
              <li>Email us at <a href="mailto:labelmochanmogra@gmail.com" className="text-mocha-700 underline underline-offset-2">labelmochanmogra@gmail.com</a> with your order number, reason for return, and photos if applicable.</li>
              <li>Our team will respond within 1–2 business days with return instructions.</li>
              <li>Pack the item securely and ship it to the address provided.</li>
              <li>Once received and approved, your refund or exchange will be processed.</li>
            </ol>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Contact Us</h2>
            <p>
              For any questions about returns or refunds, please reach out to us:<br />
              <strong>Email:</strong>{' '}
              <a href="mailto:labelmochanmogra@gmail.com" className="text-mocha-700 underline underline-offset-2">
                labelmochanmogra@gmail.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
