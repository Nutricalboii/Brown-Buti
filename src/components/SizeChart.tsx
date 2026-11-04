import { useState } from 'react';
import { X } from 'lucide-react';
import { BLOUSE_SIZE_ROWS, CHANDINI_SIZE_ROWS, KURTIS_SIZE_ROWS, type SizeRow, type SizeUnit } from '../data/sizeChart';

function displayValue(inches: number, unit: SizeUnit) {
  return unit === 'inches' ? inches : Math.round(inches * 2.54 * 10) / 10;
}

function SizeTable({ title, rows, unit }: { title: string; rows: SizeRow[]; unit: SizeUnit }) {
  const unitLabel = unit === 'inches' ? 'INCHES' : 'CENTIMETERS';
  const displayTitle = title.replace('(INCHES)', `(${unitLabel})`);

  return (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full min-w-[540px] border-collapse text-[13px] sm:text-[15px]" aria-label={displayTitle}>
        <caption className="sr-only">{displayTitle}</caption>
        <thead>
          <tr>
            <th colSpan={5} className="bg-[#ed7b44] px-3 py-3 text-center font-sans text-[13px] font-bold tracking-wide text-black sm:text-base">
              {displayTitle}
            </th>
          </tr>
          <tr className="bg-white">
            {['Size', 'Shoulder', 'Bust', 'Waist', 'Hip'].map((heading) => (
              <th key={heading} scope="col" className="border-x-2 border-[#e3e3e3] px-3 py-3 text-center font-sans text-[11px] font-bold uppercase tracking-wide text-[#171717] sm:text-sm">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-sans text-[#171717]">
          {rows.map((row, index) => (
            <tr key={row.size} className={index % 2 === 1 ? 'bg-[#e7e7e7]' : 'bg-white'}>
              <th scope="row" className="border-x-2 border-[#e3e3e3] px-3 py-2.5 text-center font-normal sm:py-3">{row.size}</th>
              <td className="border-x-2 border-[#e3e3e3] px-3 py-2.5 text-center sm:py-3">{displayValue(row.shoulder, unit)}</td>
              <td className="border-x-2 border-[#e3e3e3] px-3 py-2.5 text-center sm:py-3">{displayValue(row.bust, unit)}</td>
              <td className="border-x-2 border-[#e3e3e3] px-3 py-2.5 text-center sm:py-3">{displayValue(row.waist, unit)}</td>
              <td className="border-x-2 border-[#e3e3e3] px-3 py-2.5 text-center sm:py-3">{displayValue(row.hip, unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeChartContent({ unit, onUnitChange }: { unit: SizeUnit; onUnitChange: (unit: SizeUnit) => void }) {
  return (
    <div className="font-sans text-[#171717]">
      <p className="mx-auto mb-6 max-w-[520px] text-center text-base leading-snug sm:text-xl">
        All measurements mentioned below are in inches and centimeters.
      </p>

      <div className="mb-8 flex justify-center gap-7" role="group" aria-label="Measurement unit">
        {(['inches', 'centimeters'] as const).map((option) => {
          const selected = unit === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onUnitChange(option)}
              aria-pressed={selected}
              className={`h-[68px] px-5 text-sm font-bold uppercase tracking-wide transition-colors sm:h-[88px] sm:px-7 sm:text-base ${selected ? 'bg-[#ed7b44] text-black' : 'bg-black text-white'} ${option === 'inches' ? 'w-[116px]' : 'w-[174px]'}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <SizeTable title="SIZE CHART (INCHES)" rows={BLOUSE_SIZE_ROWS} unit={unit} />
      <SizeTable title="SIZE CHART FOR KURTIS (INCHES)" rows={KURTIS_SIZE_ROWS} unit={unit} />

      <MeasurementDiagram />
    </div>
  );
}

export function ChandiniSizeChartContent({ unit, onUnitChange }: { unit: SizeUnit; onUnitChange: (unit: SizeUnit) => void }) {
  const unitLabel = unit === 'inches' ? 'in' : 'cm';

  return (
    <div className="font-lora text-mocha-800">
      <p className="mb-5 max-w-[540px] text-sm leading-relaxed text-mocha-700 sm:text-base">
        Body measurements: choose by your waist and hip. Allow 1–2 inches of ease in the finished garment.
      </p>

      <div className="mb-5 inline-flex rounded-full border border-mocha-300 p-1" role="group" aria-label="Measurement unit">
        {(['inches', 'centimeters'] as const).map((option) => {
          const selected = unit === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onUnitChange(option)}
              aria-pressed={selected}
              className={`min-h-11 min-w-20 rounded-full px-4 font-cinzel text-xs tracking-[0.12em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${selected ? 'bg-mocha-900 text-gold-200' : 'text-mocha-700 hover:bg-mocha-50'}`}
            >
              {option === 'inches' ? 'Inches' : 'Centimetres'}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-sm border border-mocha-200">
        <table className="w-full min-w-[320px] border-collapse text-sm sm:text-base" aria-label={`Chandini body measurements in ${unitLabel}`}>
          <thead>
            <tr className="bg-mocha-50 text-left font-cinzel text-[11px] tracking-[0.14em] uppercase text-mocha-700 sm:text-xs">
              <th scope="col" className="px-4 py-3">Size</th>
              <th scope="col" className="px-4 py-3">Waist ({unitLabel})</th>
              <th scope="col" className="px-4 py-3">Hips ({unitLabel})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mocha-100 text-mocha-900">
            {CHANDINI_SIZE_ROWS.map((row) => (
              <tr key={row.size} className="odd:bg-[#FFFEF7] even:bg-mocha-50/60">
                <th scope="row" className="px-4 py-3 text-left font-medium">{row.size}</th>
                <td className="px-4 py-3 tabular-nums">{displayValue(row.waist, unit)}</td>
                <td className="px-4 py-3 tabular-nums">{displayValue(row.hip, unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SizeChartModal({ open, onClose, chart = 'blouse' }: { open: boolean; onClose: () => void; chart?: 'blouse' | 'chandini' }) {
  const [unit, setUnit] = useState<SizeUnit>('inches');

  if (!open) return null;

  const title = chart === 'chandini' ? 'Chandini size guide' : 'Blouse size chart';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-mocha-900/60 p-0 sm:p-6" role="presentation">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close size chart" />
      <div className="relative z-10 max-h-[94vh] w-full max-w-[700px] overflow-y-auto bg-[#FFFEF7] p-5 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="size-chart-title">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-mocha-200 pb-4">
          <h2 id="size-chart-title" className="font-cinzel text-lg tracking-[0.12em] text-mocha-900 sm:text-xl">{title}</h2>
          <button onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center text-mocha-700 hover:text-mocha-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500" aria-label="Close size chart">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        {chart === 'chandini' ? (
          <ChandiniSizeChartContent unit={unit} onUnitChange={setUnit} />
        ) : (
          <SizeChartContent unit={unit} onUnitChange={setUnit} />
        )}
      </div>
    </div>
  );
}

function MeasurementDiagram() {
  return (
    <div className="mt-7 border-t border-[#e3e3e3] pt-6">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#ed7b44]">How to measure</p>
      <svg viewBox="0 0 520 220" className="mx-auto w-full max-w-[520px] text-[#171717]" role="img" aria-label="Illustration showing bust, waist and hip measurement areas">
        <path d="M237 26c-16 11-25 30-27 54l-25 27 29 18-9 69h116l-9-69 29-18-25-27c-2-24-11-43-27-54-9 8-17 12-26 12s-17-4-26-12Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M185 82h160M202 122h126M196 158h138" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 5" />
        <path d="M185 77l-14 5 14 5M345 77l14 5-14 5M202 117l-14 5 14 5M328 117l14 5-14 5M196 153l-14 5 14 5M334 153l14 5-14 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="34" y="87" fill="currentColor" fontSize="15">Bust</text>
        <text x="34" y="127" fill="currentColor" fontSize="15">Waist</text>
        <text x="34" y="163" fill="currentColor" fontSize="15">Hip</text>
        <text x="390" y="87" fill="currentColor" fontSize="13">Measure across the fullest part</text>
        <text x="390" y="104" fill="currentColor" fontSize="13">of the bust.</text>
        <text x="390" y="127" fill="currentColor" fontSize="13">Measure around your natural</text>
        <text x="390" y="144" fill="currentColor" fontSize="13">waistline.</text>
        <text x="390" y="163" fill="currentColor" fontSize="13">Measure around the fullest</text>
        <text x="390" y="180" fill="currentColor" fontSize="13">part of your hips.</text>
      </svg>
    </div>
  );
}
