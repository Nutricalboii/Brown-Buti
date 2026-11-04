import { FormEvent, useState } from 'react';
import { Loader2, X, ArrowRight, ShieldCheck } from 'lucide-react';
import type { CartItem } from '../context/CartContext';

interface InternationalCheckoutFormProps {
  items: CartItem[];
  onClose: () => void;
  onError: (message: string) => void;
}

const countries = [
  ['US', 'United States'], ['GB', 'United Kingdom'], ['CA', 'Canada'], ['AU', 'Australia'],
  ['DE', 'Germany'], ['FR', 'France'], ['IT', 'Italy'], ['ES', 'Spain'], ['NL', 'Netherlands'],
  ['CH', 'Switzerland'], ['AT', 'Austria'], ['BE', 'Belgium'], ['DK', 'Denmark'], ['SE', 'Sweden'],
  ['NO', 'Norway'], ['FI', 'Finland'], ['IE', 'Ireland'], ['JP', 'Japan'], ['SG', 'Singapore'],
  ['AE', 'United Arab Emirates'], ['NZ', 'New Zealand'], ['ZA', 'South Africa'], ['OTHER', 'Other destination'],
] as const;

const initialForm = {
  countryCode: 'US', name: '', email: '', address1: '', address2: '', city: '', provinceCode: '', postalCode: '', phone: '',
};

export default function InternationalCheckoutForm({ items, onClose, onError }: InternationalCheckoutFormProps) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.countryCode === 'OTHER') {
      onError('Please choose your delivery country so the correct USD shipping rate can be applied.');
      return;
    }
    setIsSubmitting(true);
    onError('');
    try {
      const response = await fetch('/api/international-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, size: item.size })),
          shippingAddress: form,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.paymentUrl !== 'string') {
        throw new Error(data.error || 'The USD checkout is not available yet. Please use Shopify checkout or try again later.');
      }
      window.location.assign(data.paymentUrl);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'International checkout could not be started.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border border-mocha-200 bg-[#FFFEF7] p-5 md:p-6" aria-labelledby="international-checkout-title">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="section-label mb-2">Secure international payment</p>
          <h3 id="international-checkout-title" className="font-playfair text-2xl text-mocha-900">Pay in USD</h3>
          <p className="font-lora text-sm leading-relaxed text-mocha-600 mt-2">
            Your garments are priced at $200 each. Shipping is added in USD from the destination rate configured for your country.
          </p>
        </div>
        <button type="button" onClick={onClose} className="min-h-11 min-w-11 inline-flex items-center justify-center text-mocha-500 hover:text-mocha-900" aria-label="Close international checkout form">
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="international-country" className="block font-cinzel text-[10px] tracking-[0.16em] uppercase text-mocha-700 mb-1.5">Delivery country</label>
          <select id="international-country" required value={form.countryCode} onChange={(event) => setField('countryCode', event.target.value)} className="input-field min-h-11 border border-mocha-300 px-3 bg-[#FFFEF7]">
            {countries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Field id="international-name" label="Full name" value={form.name} onChange={(value) => setField('name', value)} required autoComplete="name" />
          <Field id="international-email" label="Email" type="email" value={form.email} onChange={(value) => setField('email', value)} required autoComplete="email" />
          <Field id="international-address1" label="Address" value={form.address1} onChange={(value) => setField('address1', value)} required autoComplete="address-line1" />
          <Field id="international-address2" label="Apartment, suite, etc. (optional)" value={form.address2} onChange={(value) => setField('address2', value)} autoComplete="address-line2" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field id="international-city" label="City" value={form.city} onChange={(value) => setField('city', value)} required autoComplete="address-level2" />
            <Field id="international-province" label="State / province" value={form.provinceCode} onChange={(value) => setField('provinceCode', value)} autoComplete="address-level1" />
            <Field id="international-postal" label="ZIP / postal code" value={form.postalCode} onChange={(value) => setField('postalCode', value)} required autoComplete="postal-code" />
          </div>
          <Field id="international-phone" label="Phone (optional)" type="tel" value={form.phone} onChange={(value) => setField('phone', value)} autoComplete="tel" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full btn-primary-filled justify-center py-4 text-sm flex items-center gap-2 disabled:opacity-60">
          {isSubmitting ? <>Opening USD checkout <Loader2 size={15} className="animate-spin" /></> : <>Continue to secure USD checkout <ArrowRight size={15} strokeWidth={1.5} /></>}
        </button>
        <div className="flex items-center justify-center gap-2 text-mocha-400">
          <ShieldCheck size={14} strokeWidth={1.5} />
          <p className="font-cinzel text-[9px] tracking-[0.16em] uppercase">Razorpay secure payment link · test mode until launch</p>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange, type = 'text', required = false, autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block font-cinzel text-[10px] tracking-[0.16em] uppercase text-mocha-700 mb-1.5">{label}{required ? ' *' : ''}</label>
      <input id={id} type={type} value={value} required={required} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} className="input-field min-h-11 border border-mocha-300 px-3 bg-[#FFFEF7]" />
    </div>
  );
}
