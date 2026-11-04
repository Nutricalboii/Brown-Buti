export type SizeUnit = 'inches' | 'centimeters';

export type SizeRow = {
  size: string;
  shoulder: number;
  bust: number;
  waist: number;
  hip: number;
};

export type ChandiniSizeRow = {
  size: string;
  waist: number;
  hip: number;
};

export const CHANDINI_SIZE_ROWS: ChandiniSizeRow[] = [
  { size: 'XS', waist: 26, hip: 36 },
  { size: 'S', waist: 28, hip: 38 },
  { size: 'M', waist: 30, hip: 40 },
  { size: 'L', waist: 32, hip: 42 },
  { size: 'XL', waist: 34, hip: 44 },
  { size: 'XXL', waist: 36, hip: 46 },
  { size: '3XL', waist: 38, hip: 48 },
  { size: '4XL', waist: 40, hip: 50 },
];

export const BLOUSE_SIZE_ROWS: SizeRow[] = [
  { size: 'XS', shoulder: 14, bust: 32, waist: 26, hip: 36 },
  { size: 'S', shoulder: 14.5, bust: 34, waist: 28, hip: 38 },
  { size: 'M', shoulder: 15, bust: 36, waist: 30, hip: 40 },
  { size: 'L', shoulder: 15.5, bust: 38, waist: 32, hip: 42 },
  { size: 'XL', shoulder: 16, bust: 40, waist: 34, hip: 44 },
  { size: 'XXL', shoulder: 16.5, bust: 42, waist: 36, hip: 46 },
];

export const KURTIS_SIZE_ROWS: SizeRow[] = [
  ...BLOUSE_SIZE_ROWS,
  { size: '3XL', shoulder: 17, bust: 44, waist: 38, hip: 48 },
  { size: '4XL', shoulder: 17.5, bust: 46, waist: 40, hip: 50 },
];
