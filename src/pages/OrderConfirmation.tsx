import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Mail, Package, ShieldCheck } from 'lucide-react';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { paymentId?: string; orderId?: string } | null;
  const paymentId = state?.paymentId;
  const orderId = state?.orderId;

  if (!paymentId || !orderId) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto px-6 text-center w-full" role="alert">
          <p className="section-label mb-4">Payment not verified</p>
          <h1 className="font-playfair text-4xl md:text-5xl text-mocha-900 mb-5">No confirmed payment found.</h1>
          <p className="font-lora text-base text-mocha-600 leading-relaxed mb-8">
            This page only confirms payments verified by our checkout. If you have already paid, please contact support before trying again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/cart')} className="btn-primary">
              Return to Cart <ArrowRight size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-500 hover:text-mocha-800 transition-colors py-3"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto px-6 text-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-full bg-mocha-50 border border-mocha-200 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle size={32} className="text-mocha-700" strokeWidth={1.5} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="section-label mb-4"
          >
            Order Confirmed &amp; Paid
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-playfair text-4xl md:text-5xl text-mocha-900 mb-5"
          >
            Thank You.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="font-lora text-base text-mocha-600 leading-relaxed mb-3"
          >
            Your payment has been captured and verified. Keep the Razorpay order ID below for your records.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="font-playfair text-lg italic text-mocha-500 mb-10"
          >
            "A new story is about to begin."
          </motion.p>

          {/* Order detail card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="border border-mocha-200 p-8 mb-10 text-left bg-mocha-50/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-400 mb-1">
                  Razorpay Order ID
                </p>
                <p className="font-playfair text-base text-mocha-900 break-all">{orderId}</p>
              </div>
              {paymentId && (
                <div>
                  <p className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-400 mb-1">
                    Payment ID
                  </p>
                  <p className="font-mono text-xs text-mocha-800 break-all">{paymentId}</p>
                </div>
              )}
              <div>
                <p className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-400 mb-1">
                  Date
                </p>
                <p className="font-lora text-sm text-mocha-700">
                  {new Date().toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-400 mb-1">
                  Payment Verification Status
                </p>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-forest-600" />
                  <p className="font-lora text-sm text-forest-700 font-medium">Captured and verified by Razorpay</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
          >
            <div className="flex items-center gap-3 text-mocha-500">
              <Mail size={16} strokeWidth={1.5} />
              <p className="font-lora text-sm">Payment verified securely</p>
            </div>
            <div className="hidden sm:block w-px h-4 bg-mocha-200" />
            <div className="flex items-center gap-3 text-mocha-500">
              <Package size={16} strokeWidth={1.5} />
              <p className="font-lora text-sm">Keep your order ID for support</p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/shop')}
              className="btn-primary"
            >
              Return to Wardrobe <ArrowRight size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-500 hover:text-mocha-800 transition-colors py-3"
            >
              Need Help? Contact Us
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
