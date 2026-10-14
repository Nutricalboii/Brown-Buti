import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, renameSync } from 'node:fs';
import path from 'node:path';

const mediaRoot = path.resolve('public/product-media');
const sourceExtensions = new Set(['.mp4', '.mov', '.m4v']);
const refreshTrackedMasters = process.argv.includes('--refresh-existing');

function isGitTracked(file) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', path.relative(process.cwd(), file)], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function visit(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? visit(entryPath) : [entryPath];
  });
}

const browserMp4Files = visit(mediaRoot).filter((file) => /\.browser\.mp4$/i.test(file));
let generated = 0;
let keptExisting = 0;
const missingSources = [];

for (const browserMp4 of browserMp4Files) {
  const directory = path.dirname(browserMp4);
  const baseName = path.basename(browserMp4).replace(/\.browser\.mp4$/i, '').toLowerCase();
  const output = browserMp4.replace(/\.mp4$/i, '.webm');
  const temporaryOutput = output.replace(/\.webm$/i, '.tmp.webm');
  const refreshMaster = refreshTrackedMasters && existsSync(output) && isGitTracked(output);

  if (existsSync(output) && !refreshMaster) {
    keptExisting += 1;
    continue;
  }

  const source = readdirSync(directory)
    .map((entry) => path.join(directory, entry))
    .find((candidate) => {
      const extension = path.extname(candidate).toLowerCase();
      const candidateName = path.basename(candidate, path.extname(candidate)).toLowerCase();
      return sourceExtensions.has(extension) && candidateName === baseName;
    });

  if (!source) {
    missingSources.push(browserMp4);
    continue;
  }

  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', '-i', source,
    '-map', '0:v:0', '-map', '0:a?',
    '-c:v', 'libsvtav1', '-preset', '8', '-crf', refreshMaster ? '19' : '25',
    '-pix_fmt', 'yuv420p10le',
    '-c:a', 'libopus', '-b:a', '128k',
    temporaryOutput,
  ], { stdio: 'inherit' });
  renameSync(temporaryOutput, output);

  generated += 1;
  console.log(`Created ${path.relative(mediaRoot, output)} from the original camera clip (AV1 CRF ${refreshMaster ? '19' : '25'}).`);
}

if (missingSources.length > 0) {
  throw new Error(`No matching original source found for: ${missingSources.map((file) => path.relative(mediaRoot, file)).join(', ')}`);
}

console.log(`Generated ${generated} high-quality 10-bit AV1 videos; kept ${keptExisting} existing WebM masters. MP4 browser versions remain as compatibility fallbacks.`);
