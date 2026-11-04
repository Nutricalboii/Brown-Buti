import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function InternationalPaymentComplete() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('razorpay_payment_link_reference_id');
  return (
    <div className="pt-32 pb-24 min-h-[70vh] px-6 flex items-center justify-center">
      <div className="max-w-xl text-center border border-mocha-200 bg-[#FFFEF7] p-8 md:p-12">
        <CheckCircle2 size={42} className="mx-auto text-mocha-700 mb-6" strokeWidth={1.2} />
        <p className="section-label mb-3">Payment link returned</p>
        <h1 className="font-playfair text-4xl text-mocha-900 mb-5">Thank you for choosing Brown Buti.</h1>
        <p className="font-lora text-sm leading-relaxed text-mocha-600">
          Razorpay has returned you to Brown Buti. Your order is confirmed only after the secure webhook verifies payment; we will send the order confirmation to your email after Shopify synchronization.
        </p>
        {reference && <p className="font-cinzel text-[10px] tracking-[0.16em] text-mocha-500 mt-5">Reference: {reference}</p>}
        <Link to="/" className="btn-primary-filled justify-center mt-8">Continue shopping <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}
