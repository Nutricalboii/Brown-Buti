import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SizeChartContent } from '../components/SizeChart';
import type { SizeUnit } from '../data/sizeChart';

const sareeGuide = [
  {
    label: 'Standard (One Size)',
    length: '5.5 metres',
    blousePiece: '0.8 metres included',
    fits: 'Fits most body types — the drape style adjusts to you',
    note: 'All MnM sarees come in a single standard length as is traditional in silk sarees.',
  },
];

const underskirtGuide = [
  { size: 'S',   waist: '24"–28"', length: '38"–40"' },
  { size: 'M',   waist: '28"–32"', length: '40"–42"' },
  { size: 'L',   waist: '32"–36"', length: '40"–42"' },
  { size: 'XL',  waist: '36"–40"', length: '40"–42"' },
  { size: 'XXL', waist: '40"–44"', length: '40"–42"' },
];

const howToMeasure = [
  {
    title: 'Bust',
    desc: 'Measure around the fullest part of your chest, keeping the tape horizontal and comfortable — not tight.',
  },
  {
    title: 'Waist',
    desc: 'Measure around your natural waistline — the narrowest part of your torso, usually just above the navel.',
  },
  {
    title: 'Hip',
    desc: 'Measure around the fullest part of your hips, about 8" below your natural waist.',
  },
  {
    title: 'Underskirt Length',
    desc: 'Stand straight and measure from your waist to your ankle. Most saree underskirts sit just above the ankle.',
  },
];

export default function SizeGuide() {
  const [unit, setUnit] = useState<SizeUnit>('inches');

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 font-cinzel text-xs tracking-[0.2em] uppercase text-mocha-400 hover:text-mocha-700 transition-colors mb-12"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-16"
        >
          {/* Header */}
          <div>
            <h1 className="font-cinzel text-3xl md:text-4xl tracking-widest text-mocha-900 uppercase mb-4">
              Size Guide
            </h1>
            <p className="font-lora text-mocha-500 leading-relaxed max-w-2xl">
              Every Mocha &amp; Mogra piece is crafted to drape beautifully. Use this guide to find your perfect fit — or write to us at{' '}
              <a href="mailto:labelmochanmogra@gmail.com" className="text-mocha-700 underline underline-offset-2">
                labelmochanmogra@gmail.com
              </a>{' '}
              and we'll help you personally.
            </p>
          </div>

          {/* Saree */}
          <section>
            <h2 className="font-cinzel text-lg tracking-widest text-mocha-900 uppercase mb-6 pb-3 border-b border-mocha-200">
              Sarees
            </h2>
            <div className="bg-mocha-50 rounded-lg p-6 font-lora text-mocha-600 space-y-3">
              {sareeGuide.map((s) => (
                <div key={s.label}>
                  <p><span className="font-semibold text-mocha-800">Size:</span> {s.label}</p>
                  <p><span className="font-semibold text-mocha-800">Length:</span> {s.length}</p>
                  <p><span className="font-semibold text-mocha-800">Blouse piece:</span> {s.blousePiece}</p>
                  <p className="text-sm text-mocha-400 mt-2 italic">{s.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Blouse */}
          <section>
            <h2 className="font-cinzel text-lg tracking-widest text-mocha-900 uppercase mb-2 pb-3 border-b border-mocha-200">
              Blouse Size Chart
            </h2>
            <div className="mt-6">
              <SizeChartContent unit={unit} onUnitChange={setUnit} />
            </div>
          </section>

          {/* Underskirt / Chaandini */}
          <section>
            <h2 className="font-cinzel text-lg tracking-widest text-mocha-900 uppercase mb-2 pb-3 border-b border-mocha-200">
              Chaandini (Underskirt) Size Chart
            </h2>
            <p className="font-lora text-sm text-mocha-400 mb-6">
              Chaandini features an adjustable drawstring waist — choose by your natural waist measurement.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-mocha-200">
                    {['Size', 'Waist (fits)', 'Length'].map((h) => (
                      <th key={h} className="text-left py-3 pr-6 font-cinzel text-mocha-900 uppercase tracking-wider text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-lora text-mocha-600 divide-y divide-mocha-100">
                  {underskirtGuide.map((row) => (
                    <tr key={row.size} className="hover:bg-mocha-50 transition-colors">
                      <td className="py-3 pr-6 font-semibold text-mocha-800">{row.size}</td>
                      <td className="py-3 pr-6">{row.waist}</td>
                      <td className="py-3">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* How to Measure */}
          <section>
            <h2 className="font-cinzel text-lg tracking-widest text-mocha-900 uppercase mb-6 pb-3 border-b border-mocha-200">
              How to Measure
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {howToMeasure.map((item) => (
                <div key={item.title} className="bg-mocha-50 rounded-lg p-5">
                  <h3 className="font-cinzel text-sm tracking-widest text-mocha-800 uppercase mb-2">
                    {item.title}
                  </h3>
                  <p className="font-lora text-sm text-mocha-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Still unsure */}
          <section className="border border-mocha-200 rounded-lg p-8 text-center">
            <h2 className="font-cinzel text-base tracking-widest text-mocha-900 uppercase mb-3">
              Still Unsure?
            </h2>
            <p className="font-lora text-mocha-500 mb-5">
              Write to us with your measurements and the saree you love — we'll guide you personally.
            </p>
            <a
              href="mailto:labelmochanmogra@gmail.com?subject=Size%20Query%20-%20Mocha%20%26%20Mogra"
              className="inline-flex items-center gap-2 font-cinzel text-xs tracking-[0.2em] uppercase bg-mocha-900 text-gold-200 px-8 py-3 hover:bg-mocha-700 transition-colors"
            >
              Write to Us
            </a>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
