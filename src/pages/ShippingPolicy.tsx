import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BRAND_NAME } from '../lib/brand';
import { CUSTOMER_CARE_EMAIL } from '../lib/contact';

export default function ShippingPolicy() {
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
            Shipping Policy
          </h1>
          <p className="font-lora text-mocha-400 text-sm tracking-widest mb-10">
            Effective Date: August 2025
          </p>

          <div className="font-lora text-mocha-600 space-y-6 leading-relaxed">
            <p>
              At {BRAND_NAME}, we take great care in packaging and dispatching every order. Each piece is wrapped with love before it reaches you.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Processing Time</h2>
            <p>
              All orders are processed within <strong>2–4 business days</strong> of payment confirmation (excluding weekends and public holidays). You will receive a confirmation email with tracking information once your order is dispatched.
            </p>
            <p>
              For custom or bespoke orders, processing time may extend to <strong>7–14 business days</strong>. We will communicate any delays directly.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Domestic Shipping (India)</h2>
            <table className="w-full border-collapse text-sm mt-4">
              <thead>
                <tr className="border-b border-mocha-200">
                  <th className="text-left py-3 pr-4 font-cinzel text-mocha-900 uppercase tracking-wider text-xs">Order Value</th>
                  <th className="text-left py-3 pr-4 font-cinzel text-mocha-900 uppercase tracking-wider text-xs">Shipping Charge</th>
                  <th className="text-left py-3 font-cinzel text-mocha-900 uppercase tracking-wider text-xs">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100">
                <tr>
                  <td className="py-3 pr-4">Below ₹5,000</td>
                  <td className="py-3 pr-4">₹150</td>
                  <td className="py-3">5–7 business days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">₹5,000 &amp; above</td>
                  <td className="py-3 pr-4 font-semibold text-mocha-700">FREE</td>
                  <td className="py-3">5–7 business days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Express delivery</td>
                  <td className="py-3 pr-4">₹350</td>
                  <td className="py-3">2–3 business days</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-mocha-400 mt-2">
              * Delivery timelines are estimates and may vary depending on your location.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">International Shipping</h2>
            <table className="w-full border-collapse text-sm mt-4">
              <thead>
                <tr className="border-b border-mocha-200">
                  <th className="text-left py-3 pr-4 font-cinzel text-mocha-900 uppercase tracking-wider text-xs">Region</th>
                  <th className="text-left py-3 pr-4 font-cinzel text-mocha-900 uppercase tracking-wider text-xs">Shipping Charge</th>
                  <th className="text-left py-3 font-cinzel text-mocha-900 uppercase tracking-wider text-xs">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100">
                <tr>
                  <td className="py-3 pr-4">USA / Canada</td>
                  <td className="py-3 pr-4">₹2,500 (~$30)</td>
                  <td className="py-3">10–15 business days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">UK / Europe</td>
                  <td className="py-3 pr-4">₹2,000 (~£20)</td>
                  <td className="py-3">10–15 business days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Middle East / UAE</td>
                  <td className="py-3 pr-4">₹1,500</td>
                  <td className="py-3">7–10 business days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Other Countries</td>
                  <td className="py-3 pr-4">Calculated at checkout</td>
                  <td className="py-3">12–20 business days</td>
                </tr>
              </tbody>
            </table>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Customs &amp; Import Duties</h2>
            <p>
              For international orders, customs duties, taxes, and import fees may apply depending on your country's regulations. These charges are the responsibility of the customer and are not included in the product or shipping price.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Order Tracking</h2>
            <p>
              Once your order is shipped, you will receive an email with your tracking number and courier details. You can use this to track your package in real time.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Packaging</h2>
            <p>
              Every {BRAND_NAME} order is carefully packaged in tissue paper and sealed with our signature label. We use eco-friendly packaging materials wherever possible.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Issues with Delivery</h2>
            <p>
              If your order is significantly delayed, lost in transit, or arrives damaged, please contact us immediately at{' '}
              <a href={`mailto:${CUSTOMER_CARE_EMAIL}`} className="text-mocha-700 underline underline-offset-2">
                {CUSTOMER_CARE_EMAIL}
              </a>{' '}
              with your order number and we will resolve it promptly.
            </p>

            <h2 className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">Contact Us</h2>
            <p>
              For shipping-related queries:<br />
              <strong>Email:</strong>{' '}
              <a href={`mailto:${CUSTOMER_CARE_EMAIL}`} className="text-mocha-700 underline underline-offset-2">
                {CUSTOMER_CARE_EMAIL}
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
