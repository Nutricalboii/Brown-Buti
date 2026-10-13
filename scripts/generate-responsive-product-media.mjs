import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const mediaRoot = path.resolve('public/product-media');
const widths = [640, 960];

function visit(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? visit(entryPath) : [entryPath];
  });
}

const originals = visit(mediaRoot).filter((file) =>
  file.toLowerCase().endsWith('.webp') && !/\.(640|960)\.webp$/i.test(file),
);

for (const original of originals) {
  const stem = original.slice(0, -'.webp'.length);

  for (const width of widths) {
    const output = `${stem}.${width}.webp`;
    execFileSync(
      'magick',
      [original, '-resize', `${width}x>`, '-quality', '95', '-define', 'webp:method=4', output],
      { stdio: 'inherit' },
    );
  }
}

console.log(`Generated ${originals.length * widths.length} responsive product images from ${originals.length} full-resolution WebP sources.`);
