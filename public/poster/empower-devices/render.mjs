import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const templateDir = dirname(fileURLToPath(import.meta.url));
const [briefPath, destination] = process.argv.slice(2);
if (!briefPath || !destination) {
  throw new Error('Usage: node render.mjs <brief.json> <new-output-directory>');
}

const brief = JSON.parse(await readFile(briefPath, 'utf8'));
for (const field of ['product', 'audience', 'channel', 'headline', 'metric', 'subtitle', 'cta', 'ctaUrl', 'footer', 'wordmark', 'video']) {
  if (typeof brief[field] !== 'string' || !brief[field].trim()) {
    throw new Error(`Missing or invalid brief field: ${field}`);
  }
}
if (new URL(brief.ctaUrl).protocol !== 'https:') throw new Error('CTA must use HTTPS.');
const assetPaths = [brief.wordmark, brief.video];
for (const path of assetPaths) {
  if (!/^assets\/[a-zA-Z0-9_.-]+\.(?:png|jpg|jpeg|webp|svg|mp4)$/i.test(path)) {
    throw new Error(`Expected a local asset in assets/: ${path}`);
  }
  await readFile(resolve(templateDir, path));
}
const escape = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const template = await readFile(resolve(templateDir, 'index.html'), 'utf8');
const replacements = [
  ['AirLauncher | 1 Million+ Devices', `${brief.product} | ${brief.headline}`],
  ['AirLauncher product video', `${brief.product} product video`],
  ['assets/airLauncher.mp4', brief.video],
  ['assets/airlauncher-wordmark.png', brief.wordmark],
  ['alt="AirLauncher"', `alt="${escape(brief.product)}"`, true],
  ['Empower Devices<br>', `${escape(brief.headline)}<br>`, true],
  ['>1 Million+', `>${escape(brief.metric)}`, true],
  ['Effortlessly Customize Your Android Devices.', brief.subtitle],
  ['https://www.pax.com.cn/m/airlauncher/', brief.ctaUrl],
  ['    Download\n', `    ${escape(brief.cta)}\n`, true],
  ['Thank You for Being Part of Our Journey!', brief.footer]
];
const values = new Map(replacements.map(([from, to, markup]) => {
  if (!template.includes(from)) throw new Error(`Missing template field: ${from}`);
  return [from, markup ? to : escape(to)];
}));
const tokens = [...values.keys()].map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const html = template.replace(new RegExp(tokens.join('|'), 'g'), token => values.get(token));

const output = resolve(destination);
await mkdir(output);
await cp(resolve(templateDir, 'assets'), resolve(output, 'assets'), { recursive: true });
await writeFile(resolve(output, 'index.html'), html);
console.log(resolve(output, 'index.html'));
