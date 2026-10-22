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
            Shipping &amp; Delivery
          </h1>
          <p className="font-lora text-mocha-400 text-sm tracking-widest mb-10">
            Information for Brown Buti orders
          </p>

          <div className="font-lora text-mocha-600 space-y-6 leading-relaxed">
            <p>Every {BRAND_NAME} piece is prepared and packed with care before it begins its journey to you.</p>

            <section aria-labelledby="domestic-shipping">
              <h2 id="domestic-shipping" className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">
                Domestic Shipping — India
              </h2>
              <p>We offer shipping across India.</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Shipping charges are ₹99 per order.</li>
                <li>Shipping is complimentary on orders above ₹2,999.</li>
                <li>Estimated delivery is within 15 days. The applicable timeline will be displayed at checkout or communicated after your order is confirmed.</li>
              </ul>
            </section>

            <section aria-labelledby="international-shipping">
              <h2 id="international-shipping" className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">
                International Shipping
              </h2>
              <p>We ship internationally, including to the USA and other eligible destinations.</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>International shipping charges are calculated based on your delivery location and order details.</li>
                <li>Orders typically take around one month to arrive. Delivery timelines vary by destination and customs clearance, and will be confirmed at checkout or after your order is placed.</li>
                <li>Applicable customs duties, import taxes, and other destination charges may be payable by the customer unless explicitly included at checkout.</li>
              </ul>
            </section>

            <section aria-labelledby="made-to-order">
              <h2 id="made-to-order" className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">
                A Little Note
              </h2>
              <p>
                Every Brown Buti piece is prepared with care. Made-to-order products may require additional processing time, which will be communicated on the relevant product page.
              </p>
            </section>

            <section aria-labelledby="shipping-contact">
              <h2 id="shipping-contact" className="font-cinzel text-xl text-mocha-900 tracking-wider uppercase mt-8 mb-4">
                Contact Us
              </h2>
              <p>
                For shipping-related queries, contact us at{' '}
                <a href={`mailto:${CUSTOMER_CARE_EMAIL}`} className="text-mocha-700 underline underline-offset-2">
                  {CUSTOMER_CARE_EMAIL}
                </a>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
