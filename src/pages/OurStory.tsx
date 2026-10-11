import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function OurStory() {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-0">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center mb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-label mb-4"
        >
          Who We Are
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-cinzel text-4xl md:text-6xl tracking-widest text-mocha-900 uppercase"
        >
          Our Story
        </motion.h1>
      </div>

      {/* Full-width opening image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-[50vh] lg:h-[65vh] overflow-hidden mb-24 bg-mocha-100"
      >
        <img
          src="https://res.cloudinary.com/xtrw55ut/image/upload/q_auto,f_auto,w_1600/covermain.webp"
          alt="Mocha & Mogra atelier"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </motion.div>

      {/* The Vision */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 text-center mb-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="section-label mb-8">The Vision</p>
          <h2 className="font-cinzel text-2xl md:text-3xl tracking-wider text-mocha-900 uppercase mb-10">
            The Vision
          </h2>
          <blockquote className="font-playfair text-2xl md:text-3xl lg:text-4xl italic text-mocha-700 leading-relaxed mb-10">
            "Luxury, for me, has never been about loud logos. It's about thoughtful design. Beautiful craftsmanship."
          </blockquote>
          <p className="font-lora text-base text-mocha-600 leading-relaxed">
            We believe in creating contemporary silhouettes that honor the past while embracing the present. Our vision is to clothe the modern woman in timeless pieces, empowering her to carry forward the legacy of our cultural heritage with pride, elegance, and a sense of belonging to a larger narrative.
          </p>
        </motion.div>
      </section>

      {/* Divider ornament */}
      <div className="flex justify-center mb-24">
        <div className="flex items-center gap-4">
          <div className="w-16 h-px bg-mocha-300" />
          <img src="https://res.cloudinary.com/xtrw55ut/image/upload/q_auto,f_auto,w_200/mnmlogo-Photoroom.webp" alt="" className="h-8 w-8 object-contain opacity-40" loading="lazy" />
          <div className="w-16 h-px bg-mocha-300" />
        </div>
      </div>

      {/* The Founder's Journey */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">The Founder</p>
          <h2 className="font-cinzel text-2xl md:text-3xl tracking-wider text-mocha-900 uppercase">
            The Founder's Journey
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-md overflow-hidden bg-mocha-100 shadow-xl"
            style={{ aspectRatio: '4/5' }}
          >
            <img
              src="https://res.cloudinary.com/xtrw55ut/image/upload/q_auto,f_auto,w_800/ri3.webp"
              alt="The Founder"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="font-playfair text-3xl text-mocha-900 mb-6">
              What if the saree could have a point of view?
            </h3>
            <p className="font-lora text-base text-mocha-600 leading-relaxed mb-6">
              That was the question behind Mocha & Mogra. I’ve always been a fashion person — an MBA in Marketing by profession, and someone who has always found her creative outlet in styling, experimenting and putting her own spin on things.
            </p>
            <p className="font-lora text-base text-mocha-600 leading-relaxed mb-6">
              I discovered my love for the saree after marriage. The elegance was undeniable. But as I wore more of them, I realised I wanted something beyond beautiful. I wanted personality.
            </p>
            <p className="font-lora text-base text-mocha-600 leading-relaxed mb-6">
              I was also watching Gen Z rediscover the saree in a completely new language. They weren’t treating it like something reserved for weddings and festivals. They were styling it, playing with it and making it their own. And that made me wonder — why couldn’t the saree itself be more playful?
            </p>
            <p className="font-lora text-base text-mocha-600 leading-relaxed mb-6">
              At a time when embroidery had moved far beyond occasion wear — onto shirts, jackets, bags and everyday fashion — I started imagining what could happen if we brought that same sense of creativity to the saree. Not another floral border. Not another predictable motif. Something unexpected.
            </p>
            <p className="font-lora text-base text-mocha-600 leading-relaxed mb-10">
              Patchwork elephants. Seahorses. Details that make a traditional silhouette feel instantly contemporary. That became Mocha & Mogra.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Craft */}
      <section className="bg-mocha-900 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-gold-500 mb-4">
              How We Make
            </p>
            <h2 className="font-cinzel text-3xl md:text-4xl tracking-wider text-gold-200 uppercase">
              Our Craft
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h3 className="font-playfair text-3xl text-gold-200 mb-6">
                Artisan-Led Excellence.
              </h3>
              <p className="font-lora text-sm text-mocha-300 leading-relaxed mb-6">
                Each piece is a labor of love, meticulously handcrafted by skilled artisans across regions known for their distinct textile heritage.
              </p>
              <p className="font-lora text-sm text-mocha-300 leading-relaxed mb-6">
                From delicate thread work to vibrant block printing, we ensure that every detail tells a story of skill, patience, and dedication to the craft.
              </p>
              <p className="font-lora text-sm text-mocha-300 leading-relaxed">
                Our artisan-led machine embroidery bridges the gap between traditional technique and contemporary precision — creating motifs that are both timeless and modern.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-md overflow-hidden bg-mocha-700 shadow-2xl"
              style={{ aspectRatio: '4/5' }}
            >
              <img
                src="https://res.cloudinary.com/xtrw55ut/image/upload/q_auto,f_auto,w_800/sm3.webp"
                alt="Artisan craftsmanship"
                className="w-full h-full object-cover opacity-90"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Mocha & Mogra */}
      <section className="py-24 max-w-5xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-4">The Duality</p>
          <h2 className="font-cinzel text-3xl md:text-4xl tracking-wider text-mocha-900 uppercase mb-10">
            Why Mocha & Mogra?
          </h2>
          <h3 className="font-playfair text-2xl text-mocha-800 mb-8 italic">
            Because she’s both.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="p-8 bg-[#FFFEF7] border border-mocha-200">
              <h4 className="font-cinzel text-xl text-mocha-900 mb-4">☕ MOCHA</h4>
              <p className="font-lora text-mocha-600">Ambitious / Playful / Expressive / Contemporary</p>
              <p className="font-lora text-mocha-500 mt-4 text-sm">Mocha is her modern side — ambitious, expressive, curious and a little rebellious.</p>
            </div>
            <div className="p-8 bg-[#FFFEF7] border border-mocha-200">
              <h4 className="font-cinzel text-xl text-mocha-900 mb-4">🌼 MOGRA</h4>
              <p className="font-lora text-mocha-600">Feminine / Classic / Timeless / Elegant</p>
              <p className="font-lora text-mocha-500 mt-4 text-sm">Mogra is her timeless side — feminine, graceful and unmistakably Indian.</p>
            </div>
          </div>
          <p className="font-lora text-lg text-mocha-700 leading-relaxed mb-6">
            Together, they represent the woman I design for: someone who can love where she comes from without dressing only for where she came from.
          </p>
          <p className="font-lora text-lg text-mocha-700 leading-relaxed font-medium">
            This changes the perception of the saree from occasion wear to lifestyle wear. A saree with tradition in its roots and personality in every detail.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-[#FFFEF7] border-t border-mocha-200">
        <div className="max-w-xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-playfair text-3xl text-mocha-900 mb-6">
              Find your story.
            </h3>
            <p className="font-lora text-sm text-mocha-600 leading-relaxed mb-10">
              Each Mocha & Mogra saree is waiting for the woman it was made for. Browse the wardrobe and discover which one speaks to you.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="btn-primary"
            >
              Enter the Wardrobe <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
