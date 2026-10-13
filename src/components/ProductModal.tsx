import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Phone,
  Scissors,
  Send,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { createDirectShopifyCheckout } from '../lib/shopify';
import ImageCarousel from './ImageCarousel';
import { useCurrency } from '../context/CurrencyContext';
import { SizeChartModal } from './SizeChart';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddedToCart?: (product: Product, size?: string) => void;
}

const DELIVERY_RETURN = [
  'Shipping: It takes about 10-12 working days for domestic orders and 12-15 working days for international orders to be shipped from our end.',
  'Return: As a company policy, we do not provide a refund/return on any product once sold. Once the Mocha & Mogra pieces are sold they can be exchanged either with a different product or the replacement in a bigger or smaller size, for the same product (provided the aforementioned terms and conditions are met).',
  'We issue a credit note for our customers, only when the desired size of the product is not in stock. If the product is eligible for size exchange, you may write to us at labelmochanmogra@gmail.com strictly within 48 hours of delivery to request an exchange.',
];

// These are deliberately left blank until the final M&M contact details are confirmed.
const MNM_CONTACTS = {
  whatsapp: '',
  phone: '',
  email: 'labelmochanmogra@gmail.com',
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

export default function ProductModal({ product, onClose, onAddedToCart }: ProductModalProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [added, setAdded] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      setAdded(false);
      setCustomizeOpen(false);
      setSizeChartOpen(false);
      setSelectedSize(product?.sizes?.length === 1 ? product.sizes[0] : undefined);
      setSizeError(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (customizeOpen) {
        setCustomizeOpen(false);
      } else if (sizeChartOpen) {
        setSizeChartOpen(false);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [customizeOpen, onClose, sizeChartOpen]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      setSizeError(true);
      return;
    }
    addItem(product, selectedSize);
    setAdded(true);
    onClose();
    onAddedToCart?.(product, selectedSize);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      setSizeError(true);
      return;
    }
    addItem(product, selectedSize);
    onClose();
    window.location.href = createDirectShopifyCheckout([
      { variantId: product.shopifyVariantId || product.id, quantity: 1 },
    ]);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 bg-mocha-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-[#FFFEF7] shadow-2xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} product details`}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 text-mocha-600 hover:text-mocha-900 transition-colors p-2"
              aria-label="Close product details"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="relative px-10 pt-10">
              <div className="rounded-md w-full overflow-hidden bg-mocha-100" style={{ aspectRatio: '3/4' }}>
                <ImageCarousel media={product.images} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="px-10 py-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-mocha-500">{product.category}</span>
                {product.collection && (
                  <>
                    <span className="text-mocha-300">·</span>
                    <span className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-mocha-500">{product.collection}</span>
                  </>
                )}
              </div>

              <h2 className="font-playfair text-3xl text-mocha-900 mb-1">{product.name}</h2>
              <p className="font-lora text-xl text-mocha-600 mb-5">{formatPrice(product.price, product.priceUsd)}</p>

              {product.sizes?.length ? (
                <fieldset className="mb-5" aria-describedby={sizeError ? `size-error-${product.id}` : undefined}>
                  <legend className="mb-3 font-cinzel text-[11px] tracking-[0.16em] uppercase text-mocha-700">Select Size</legend>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <label key={size} className={`cursor-pointer border px-4 py-2.5 font-lora text-sm transition-colors ${selectedSize === size ? 'border-mocha-900 bg-mocha-900 text-gold-200' : 'border-mocha-200 text-mocha-700 hover:border-mocha-700'}`}>
                        <input
                          type="radio"
                          name={`size-${product.id}`}
                          value={size}
                          checked={selectedSize === size}
                          onChange={() => { setSelectedSize(size); setSizeError(false); }}
                          className="sr-only"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                  {sizeError && <p id={`size-error-${product.id}`} className="mt-2 font-lora text-sm text-red-700" role="alert">Please select a size before continuing.</p>}
                </fieldset>
              ) : null}

              {product.category === 'Blouses' && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setSizeChartOpen(true)}
                    className="inline-flex min-h-11 items-center gap-2 border-b border-mocha-400 pb-1 text-left font-cinzel text-[11px] tracking-[0.16em] uppercase text-mocha-700 hover:border-mocha-900 hover:text-mocha-900 transition-colors"
                  >
                    Size Chart
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <button
                  id="modal-buy-now-btn"
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-mocha-900 text-gold-200 font-cinzel text-xs tracking-[0.2em] uppercase hover:bg-mocha-800 transition-colors shadow-md"
                >
                  <ArrowRight size={14} strokeWidth={1.5} />
                  Buy Now — {formatPrice(product.price, product.priceUsd)}
                </button>
                <button
                  id="modal-add-to-bag-btn"
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border border-mocha-800 text-mocha-900 font-cinzel text-xs tracking-[0.2em] uppercase hover:bg-mocha-50 transition-colors"
                >
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  {added ? 'Added to Bag' : 'Add to Bag'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCustomizeOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 mb-3 border border-mocha-300 text-mocha-800 font-cinzel text-xs tracking-[0.16em] uppercase hover:border-mocha-800 hover:bg-mocha-50 transition-colors"
              >
                <Scissors size={15} strokeWidth={1.5} />
                Customize Your Order
              </button>

              <div className="w-12 h-px bg-gold-500 my-7" />

              <section className="mb-7" aria-labelledby="product-description-heading">
                <h3 id="product-description-heading" className="font-cinzel text-xs tracking-[0.25em] uppercase text-mocha-500 mb-3">Description</h3>
                {(product.description || [product.story]).map((paragraph) => (
                  <p key={paragraph} className="font-lora text-sm leading-relaxed text-mocha-700 mb-4 last:mb-0">{paragraph}</p>
                ))}
              </section>

              {product.category === 'Blouses' && (
                <section className="mb-7 border-y border-mocha-100 py-5" aria-label="Blouse details">
                  <p className="font-lora text-sm leading-relaxed text-mocha-700">Fabric: {product.fabric}</p>
                  <p className="font-lora text-sm leading-relaxed text-mocha-700 mt-3">Washing Instructions: {product.washingInstructions}</p>
                  <p className="font-lora text-sm leading-relaxed text-mocha-700 mt-3">Model wears size: {product.modelSize}</p>
                </section>
              )}

              {product.details && (
                <section className="mb-7" aria-labelledby="product-details-heading">
                  <h3 id="product-details-heading" className="font-cinzel text-xs tracking-[0.25em] uppercase text-mocha-500 mb-3">Details</h3>
                  <p className="font-lora text-sm leading-relaxed text-mocha-700">{product.details.join(' | ')}</p>
                </section>
              )}

              {!product.description && <ProductLegacyDetails product={product} />}

              <InfoAccordion title="Delivery & Return">
                {DELIVERY_RETURN.map((paragraph) => (
                  <p key={paragraph} className="font-lora text-sm leading-relaxed text-mocha-700 mb-4 last:mb-0">{paragraph}</p>
                ))}
              </InfoAccordion>

              <InfoAccordion title="Additional Information">
                <p className="font-lora text-sm leading-relaxed text-mocha-700">
                  Category: {product.category}{product.collection ? ` · Collection: ${product.collection}` : ''}
                </p>
                {product.color && <p className="font-lora text-sm leading-relaxed text-mocha-700 mt-3">Colour: {product.color}</p>}
              </InfoAccordion>

              <div className="pt-6 mt-2 border-t border-mocha-100 text-center">
                <button onClick={onClose} className="inline-flex items-center gap-2 text-mocha-400 font-cinzel text-[10px] tracking-[0.25em] uppercase py-2 hover:text-mocha-800 transition-colors">
                  Continue Browsing <ArrowRight size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>

          <CustomizeOrderModal open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
          <SizeChartModal open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
        </>
      )}
    </AnimatePresence>
  );
}

function ProductLegacyDetails({ product }: { product: Product }) {
  return (
    <>
      <section className="mb-6">
        <h3 className="font-cinzel text-xs tracking-[0.25em] uppercase text-mocha-500 mb-3">The Story</h3>
        <p className="font-lora text-sm leading-relaxed text-mocha-700">{product.story}</p>
      </section>
      <section className="mb-6">
        <h3 className="font-cinzel text-xs tracking-[0.25em] uppercase text-mocha-500 mb-3">Her Personality</h3>
        <div className="flex flex-wrap gap-2">
          {product.personality.map((trait) => (
            <span key={trait} className="border border-mocha-300 text-mocha-600 font-lora text-xs px-3 py-1 tracking-wide">{trait}</span>
          ))}
        </div>
      </section>
      <section className="mb-7">
        <h3 className="font-cinzel text-xs tracking-[0.25em] uppercase text-mocha-500 mb-3">Wear For</h3>
        <p className="font-lora text-sm italic text-mocha-600 leading-relaxed">{product.wearFor}</p>
      </section>
    </>
  );
}

function InfoAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = `product-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  return (
    <section className="border-t border-mocha-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full min-h-14 flex items-center justify-between gap-4 text-left"
      >
        <span className="font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-600">{title}</span>
        <span className="font-lora text-xl text-mocha-500" aria-hidden="true">{open ? '×' : '+'}</span>
      </button>
      <div id={panelId} hidden={!open} className="pb-5 pr-5">{children}</div>
    </section>
  );
}

function CustomizeOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'known' | 'unknown'>('known');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) setSubmitted(false);
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8" role="presentation">
      <button className="absolute inset-0 bg-mocha-900/60 backdrop-blur-sm" onClick={onClose} aria-label="Close customization dialog" />
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#FFFEF7] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="customize-order-title">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-[#FFFEF7] px-6 py-5 border-b border-mocha-100">
          <h2 id="customize-order-title" className="font-playfair text-2xl text-mocha-900 flex items-center gap-2"><Scissors size={22} strokeWidth={1.5} /> Customize Your Order</h2>
          <button onClick={onClose} className="p-2 text-mocha-500 hover:text-mocha-900" aria-label="Close customization dialog"><X size={22} strokeWidth={1.5} /></button>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-2 border-b border-mocha-200 mb-6" role="tablist" aria-label="Customization options">
            <button type="button" role="tab" aria-selected={tab === 'known'} onClick={() => setTab('known')} className={`min-h-12 px-3 font-lora text-sm transition-colors ${tab === 'known' ? 'text-mocha-800 border-b-2 border-mocha-600' : 'text-mocha-400'}`}>I Know My Size</button>
            <button type="button" role="tab" aria-selected={tab === 'unknown'} onClick={() => setTab('unknown')} className={`min-h-12 px-3 font-lora text-sm transition-colors ${tab === 'unknown' ? 'text-mocha-800 border-b-2 border-mocha-600' : 'text-mocha-400'}`}>I Don&apos;t Know My Size</button>
          </div>

          {tab === 'known' ? (
            <div>
              <p className="font-lora text-base leading-relaxed text-mocha-700 mb-6">Reach us on your preferred channel with your size &amp; customisation details — we reply within 24 hours.</p>
              <div className="space-y-3">
                <ContactOption icon={<MessageCircle size={22} />} iconClass="bg-emerald-100 text-emerald-700" label="WhatsApp" value={MNM_CONTACTS.whatsapp ? `+${MNM_CONTACTS.whatsapp}` : 'Number to be confirmed'} href={MNM_CONTACTS.whatsapp ? `https://wa.me/${MNM_CONTACTS.whatsapp}` : undefined} />
                <ContactOption icon={<Phone size={22} />} iconClass="bg-indigo-100 text-indigo-700" label="Call Us" value={MNM_CONTACTS.phone ? `+${MNM_CONTACTS.phone} · Mon–Fri, 9am–5pm IST` : 'Phone number to be confirmed'} href={MNM_CONTACTS.phone ? `tel:+${MNM_CONTACTS.phone}` : undefined} />
                <ContactOption icon={<Mail size={22} />} iconClass="bg-red-100 text-red-700" label="Email" value={MNM_CONTACTS.email} href={`mailto:${MNM_CONTACTS.email}`} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="font-lora text-base leading-relaxed text-mocha-700 mb-5">Share your measurements and our styling experts will recommend the perfect size &amp; customisation.</p>
              <FormField label="Full Name" name="fullName" required placeholder="Your name" />
              <FormField label="Phone / WhatsApp" name="phone" required placeholder="+91 00000 00000" />
              <FormField label="Email Address" name="email" type="email" placeholder="you@example.com" />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Bust (cm)" name="bust" inputMode="decimal" placeholder="e.g. 86" />
                <FormField label="Waist (cm)" name="waist" inputMode="decimal" placeholder="e.g. 70" />
                <FormField label="Shoulder (cm)" name="shoulder" inputMode="decimal" placeholder="e.g. 38" />
                <FormField label="Hip (cm)" name="hip" inputMode="decimal" placeholder="e.g. 96" />
              </div>
              <button type="submit" className="w-full btn-primary-filled justify-center py-3.5 mt-2"><Send size={15} strokeWidth={1.5} /> Submit Details</button>
              {submitted && <p className="font-lora text-sm leading-relaxed text-forest-600" role="status">Details saved for this session. Please email them to {MNM_CONTACTS.email} so the team can reply within 24 hours.</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactOption({ icon, iconClass, label, value, href }: { icon: React.ReactNode; iconClass: string; label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconClass}`} aria-hidden="true">{icon}</span>
      <span className="flex-1 text-left min-w-0"><span className="block font-lora text-base font-semibold text-mocha-900">{label}</span><span className="block font-lora text-sm text-mocha-500 truncate">{value}</span></span>
      <ArrowRight size={16} className="text-mocha-300 shrink-0" aria-hidden="true" />
    </>
  );

  return href ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="flex items-center gap-4 w-full rounded-lg border border-mocha-100 px-4 py-4 hover:bg-mocha-50 transition-colors">{content}</a>
  ) : (
    <div className="flex items-center gap-4 w-full rounded-lg border border-mocha-100 px-4 py-4 opacity-70" aria-disabled="true">{content}</div>
  );
}

function FormField({ label, name, required = false, type = 'text', inputMode, placeholder }: { label: string; name: string; required?: boolean; type?: string; inputMode?: 'decimal'; placeholder: string }) {
  return (
    <label className="block">
      <span className="block font-cinzel text-[10px] tracking-[0.18em] uppercase text-mocha-600 mb-2">{label}{required ? ' *' : ''}</span>
      <input name={name} type={type} inputMode={inputMode} required={required} placeholder={placeholder} className="w-full border border-mocha-200 bg-white px-4 py-3 font-lora text-sm text-mocha-800 placeholder-mocha-400 focus:outline-none focus:border-mocha-700" />
    </label>
  );
}
