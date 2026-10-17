import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, MapPin, Send, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { z } from 'zod';
import { CUSTOMER_CARE_EMAIL, WHATSAPP_DISPLAY_NUMBER, WHATSAPP_URL } from '../lib/contact';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const subjects = [
  'Product Enquiry',
  'Order Information',
  'Styling Consultation',
  'Wholesale / Collaboration',
  'Other',
];

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long').regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters'),
  email: z.string().email('Please enter a valid email address').max(100, 'Email is too long'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long (max 1000 characters)'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Secure Input Validation
    const result = contactSchema.safeParse(form);
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    // Process sanitized and validated data
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-label mb-4"
          >
            Get in Touch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-cinzel text-4xl md:text-6xl tracking-widest text-mocha-900 uppercase"
          >
            Contact
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-lora text-sm text-mocha-500 mt-4 italic max-w-md mx-auto leading-relaxed"
          >
            We would love to hear from you. Whether it's about a piece, a story, or just a conversation about silk.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24">
          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <CheckCircle size={40} className="text-mocha-700 mb-6" strokeWidth={1.5} />
                <h3 className="font-playfair text-3xl text-mocha-900 mb-4">
                  Message Received.
                </h3>
                <p className="font-lora text-sm text-mocha-600 leading-relaxed max-w-sm">
                  Thank you for reaching out. We will get back to you within 1–2 business days.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 btn-primary text-xs"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <motion.div
                    custom={0}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    <label className="block font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="flex items-center gap-1 text-red-500 text-[10px] mt-2 font-lora">
                        <AlertCircle size={10} /> {errors.name}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    custom={1}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    <label className="block font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="flex items-center gap-1 text-red-500 text-[10px] mt-2 font-lora">
                        <AlertCircle size={10} /> {errors.email}
                      </p>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <label
                    htmlFor="contact-subject"
                    className="block font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={`input-field contact-subject-select bg-transparent cursor-pointer appearance-none ${errors.subject ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="flex items-center gap-1 text-red-500 text-[10px] mt-2 font-lora">
                      <AlertCircle size={10} /> {errors.subject}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <label className="block font-cinzel text-[10px] tracking-[0.25em] uppercase text-mocha-500 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share your thoughts, questions, or the story you want to wear..."
                    className={`input-field resize-none ${errors.message ? 'border-red-500' : ''}`}
                  />
                  {errors.message && (
                    <p className="flex items-center gap-1 text-red-500 text-[10px] mt-2 font-lora">
                      <AlertCircle size={10} /> {errors.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    type="submit"
                    className="btn-primary-filled flex items-center gap-2"
                  >
                    Send Message
                    <Send size={14} strokeWidth={1.5} />
                  </button>
                </motion.div>
              </form>
            )}
          </div>

          {/* Customer Care Sidebar */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="space-y-10">
              <div>
                <h3 className="font-cinzel text-xs tracking-[0.25em] uppercase text-mocha-500 mb-6">
                  Customer Care
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Mail size={18} className="text-gold-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-lora text-sm text-mocha-800 mb-1">Email Us</p>
                      <a
                        href={`mailto:${CUSTOMER_CARE_EMAIL}`}
                        className="font-lora text-sm text-mocha-500 hover:text-mocha-800 transition-colors"
                      >
                        {CUSTOMER_CARE_EMAIL}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MessageCircle size={18} className="text-gold-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-lora text-sm text-mocha-800 mb-1">WhatsApp</p>
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-lora text-sm text-mocha-500 hover:text-mocha-800 transition-colors"
                      >
                        {WHATSAPP_DISPLAY_NUMBER}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Clock size={18} className="text-gold-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-lora text-sm text-mocha-800 mb-1">Hours of Operation</p>
                      <p className="font-lora text-sm text-mocha-500">Monday – Friday</p>
                      <p className="font-lora text-sm text-mocha-500">10:00 AM – 6:00 PM IST</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MapPin size={18} className="text-gold-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="font-lora text-sm text-mocha-800 mb-1">Response Time</p>
                      <p className="font-lora text-sm text-mocha-500">
                        We typically respond within 1–2 business days. During peak season, allow up to 3 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-mocha-200" />

              {/* Note */}
              <div className="bg-mocha-50 p-6 border-l-2 border-gold-500">
                <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-mocha-500 mb-3">
                  A Note From Us
                </p>
                <p className="font-lora text-sm text-mocha-600 leading-relaxed italic">
                  "Every enquiry is read personally. We care about each conversation as much as we care about each saree."
                </p>
              </div>

              {/* FAQ snippets */}
              <div>
                <h3 className="font-cinzel text-xs tracking-[0.25em] uppercase text-mocha-500 mb-6">
                  Common Questions
                </h3>
                <div className="space-y-4">
                  {[
                    { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide. Customs duties may apply.' },
                    { q: 'Can I customise a piece?', a: 'Reach out to us — we love bespoke conversations.' },
                    { q: 'What is the fabric?', a: 'Premium silk with artisan-led machine embroidery.' },
                  ].map(({ q, a }) => (
                    <div key={q} className="pb-4 border-b border-mocha-100 last:border-0">
                      <p className="font-lora text-sm text-mocha-800 mb-1">{q}</p>
                      <p className="font-lora text-xs text-mocha-500 leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom image strip */}
      <div className="mt-24 grid grid-cols-3 gap-1 overflow-hidden">
        {[
          'https://res.cloudinary.com/xtrw55ut/image/upload/q_auto,f_auto,w_800/ss3.webp',
          'https://res.cloudinary.com/xtrw55ut/image/upload/q_auto,f_auto,w_800/coverpicrubydoecloseup.webp',
          'https://res.cloudinary.com/xtrw55ut/image/upload/q_auto,f_auto,w_800/ri2.webp',
        ].map((src, i) => (
          <div key={i} className="overflow-hidden bg-mocha-100 flex aspect-[4/3] md:aspect-[16/9]">
            <img
              src={src}
              alt="Mocha & Mogra saree"
              className={`w-full h-full object-cover opacity-80 ${i < 2 ? 'object-bottom' : 'object-center'}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
