import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const mediaRoot = path.resolve('public/product-media');
const widths = [640, 960];
const sourceExtensions = new Set(['.jpeg', '.jpg', '.png', '.heic']);

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
  const directory = path.dirname(original);
  const baseName = path.basename(stem).toLowerCase();
  const originalUpload = readdirSync(directory)
    .map((entry) => path.join(directory, entry))
    .find((candidate) => {
      const extension = path.extname(candidate).toLowerCase();
      const candidateName = path.basename(candidate, path.extname(candidate)).toLowerCase();
      return sourceExtensions.has(extension) && candidateName === baseName;
    });
  const source = originalUpload || original;

  if (originalUpload) {
    execFileSync(
      'magick',
      [source, '-auto-orient', '-resize', '1600x>', '-quality', '96', '-define', 'webp:method=6', original],
      { stdio: 'inherit' },
    );
  }

  for (const width of widths) {
    const output = `${stem}.${width}.webp`;
    execFileSync(
      'magick',
      [source, '-auto-orient', '-resize', `${width}x>`, '-quality', '96', '-define', 'webp:method=6', output],
      { stdio: 'inherit' },
    );
  }
}

console.log(`Generated ${originals.length * widths.length} responsive product images. Original camera uploads were used when available; otherwise full-size WebP sources were used.`);
