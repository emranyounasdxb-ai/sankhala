import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../../', import.meta.url));
const at = (...p) => path.join(root, ...p);
const colors = { charcoal: '#2E2E2E', white: '#FFFFFF', red: '#FF3131', darkSurface: '#181818' };
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const inventory = [];
const sha256 = data => createHash('sha256').update(data).digest('hex');
for (const folder of ['public/brand/logos', 'public/brand/icons', 'public/brand/social', 'docs/brand']) {
  await mkdir(at(folder), { recursive: true });
}

function bounds(data, width, height, match) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = (y * width + x) * 4;
    if (match(data, p)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  }
  if (x1 < 0) throw new Error('Source contains no matching artwork');
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

async function source(name) {
  const bytes = await readFile(at('brand/originals', name));
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bbox = bounds(data, info.width, info.height, (d, p) => d[p + 3] > 0);
  const png = await sharp(bytes).extract(bbox).png().toBuffer();
  // Find the first connected column span: the supplied S, with its original geometry.
  let last = bbox.left;
  for (let x = bbox.left; x < bbox.left + bbox.width; x++) {
    let occupied = false;
    for (let y = bbox.top; y < bbox.top + bbox.height; y++) {
      if (data[(y * info.width + x) * 4 + 3] > 0) { occupied = true; break; }
    }
    if (!occupied) break;
    last = x;
  }
  const sBounds = { ...bbox, width: last - bbox.left + 1 };
  const dotBounds = bounds(data, info.width, info.height, (d, p) => d[p + 3] > 0 && d[p] > d[p + 1] * 1.8 && d[p] > d[p + 2] * 1.8);
  return { png, s: await sharp(bytes).extract(sBounds).png().toBuffer(), dot: await sharp(bytes).extract(dotBounds).png().toBuffer(), bbox, sBounds, dotBounds,
    provenance: { path: `brand/originals/${name}`, sha256: sha256(bytes), width: info.width, height: info.height, bounds: bbox } };
}

async function save(file, bytes, usage) {
  await writeFile(at(file), bytes);
  const meta = await sharp(bytes).metadata();
  inventory.push({ path: file, width: meta.width, height: meta.height, format: meta.format, bytes: bytes.length, sha256: sha256(bytes), usage });
}

function canvas(width, height, background) {
  return sharp({ create: { width, height, channels: 4, background } });
}

async function icon(src, size, background, maskable = false) {
  // Retain S proportions. Enlarge only the dot at favicon sizes for pixel legibility.
  const height = Math.round(size * (maskable ? 0.64 : size <= 48 ? 0.875 : 0.76));
  const s = await sharp(src.s).resize({ height }).png().toBuffer();
  const sm = await sharp(s).metadata();
  const dotSize = Math.max(size <= 48 ? 2 : 1, Math.round(height * src.dotBounds.width / src.sBounds.height));
  const dot = await sharp(src.dot).resize(dotSize, dotSize).png().toBuffer();
  const gap = Math.max(1, Math.round(height * 0.06));
  const left = Math.round((size - sm.width - gap - dotSize) / 2);
  const top = Math.round((size - height) / 2);
  return canvas(size, size, background).composite([
    { input: s, left, top },
    { input: dot, left: left + sm.width + gap, top: top + height - dotSize },
  ]).png({ compressionLevel: 9 }).toBuffer();
}

async function social(src, width, height, bg, logoRatio) {
  const logo = await sharp(src.png).resize({ width: Math.round(width * logoRatio) }).png().toBuffer();
  return canvas(width, height, bg).composite([{ input: logo, gravity: 'centre' }]).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
}

function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, bytes }, i) => {
    const p = 6 + i * 16;
    header[p] = size === 256 ? 0 : size;
    header[p + 1] = size === 256 ? 0 : size;
    header.writeUInt16LE(1, p + 4);
    header.writeUInt16LE(32, p + 6);
    header.writeUInt32LE(bytes.length, p + 8);
    header.writeUInt32LE(offset, p + 12);
    offset += bytes.length;
  });
  return Buffer.concat([header, ...images.map(i => i.bytes)]);
}

const light = await source('Sankhala-logo-dark.png');
const dark = await source('Sankhala-logo-light.png');
for (const [theme, src, bg] of [['light', light, colors.white], ['dark', dark, colors.darkSurface]]) {
  const base = `public/brand/logos/logo-on-${theme}`;
  await save(`${base}.png`, src.png, 'Native trimmed logo master; transparent; preserve aspect ratio');
  for (const width of [400, 800, 1600]) {
    const resized = await sharp(src.png).resize({ width }).png({ compressionLevel: 9 }).toBuffer();
    await save(`${base}-${width}.png`, resized, `Website logo for ${theme} surfaces`);
    await save(`${base}-${width}.webp`, await sharp(resized).webp({ lossless: true }).toBuffer(), `Lossless website logo for ${theme} surfaces`);
  }
  await save(`public/brand/icons/mark-on-${theme}.png`, await icon(src, 1024, clear), 'Transparent derived S and dot; not supplied as a separate original mark');
  for (const size of [16, 32, 48]) await save(`public/brand/icons/favicon-on-${theme}-${size}.png`, await icon(src, size, bg), 'Opaque browser icon; original S with optically adjusted dot');
  for (const size of [192, 512]) await save(`public/brand/icons/icon-on-${theme}-${size}.png`, await icon(src, size, bg), 'Opaque app icon; any purpose');
  await save(`public/brand/icons/apple-touch-icon-on-${theme}.png`, await icon(src, 180, bg), 'Opaque Apple touch icon; OS applies corner mask');
  await save(`public/brand/icons/maskable-on-${theme}-512.png`, await icon(src, 512, bg, true), 'Opaque maskable app icon with circular safe zone');
  await save(`public/brand/social/avatar-${theme}-1024.png`, await icon(src, 1024, bg, true), 'Circle safe social profile avatar');
  for (const [name, w, h, ratio] of [['og', 1200, 630, 0.62], ['share', 1200, 1200, 0.65], ['cover', 1600, 900, 0.60]]) {
    await save(`public/brand/social/${name}-${theme}-${w}x${h}.png`, await social(src, w, h, bg, ratio), 'Logo only social artwork; no unverified business claims');
  }
}
await save('public/brand/logos/email-logo-on-light.png', await sharp(light.png).resize({ width: 400 }).flatten({ background: colors.white }).png().toBuffer(), 'Opaque white backing; render at 240 CSS px or wider to retain descriptor');

for (const size of [16, 32]) {
  await copyFile(at(`public/brand/icons/favicon-on-dark-${size}.png`), at(`public/favicon-${size}.png`));
  inventory.push({ ...inventory.find(i => i.path === `public/brand/icons/favicon-on-dark-${size}.png`), path: `public/favicon-${size}.png`, usage: 'Default favicon alias' });
}
await copyFile(at('public/brand/icons/apple-touch-icon-on-dark.png'), at('public/apple-touch-icon.png'));
inventory.push({ ...inventory.find(i => i.path === 'public/brand/icons/apple-touch-icon-on-dark.png'), path: 'public/apple-touch-icon.png', usage: 'Default touch icon alias' });
const icoImages = await Promise.all([16, 32, 48].map(async size => ({ size, bytes: await readFile(at(`public/brand/icons/favicon-on-dark-${size}.png`)) })));
const icoBytes = ico(icoImages);
await writeFile(at('public/favicon.ico'), icoBytes);
inventory.push({ path: 'public/favicon.ico', format: 'ico', sizes: [16, 32, 48], bytes: icoBytes.length, sha256: sha256(icoBytes), usage: 'Default multi resolution browser icon' });

await writeFile(at('public/site.webmanifest'), JSON.stringify({
  name: 'Sankhala Employment', short_name: 'Sankhala', id: './', start_url: './', scope: './', display: 'browser',
  background_color: colors.darkSurface, theme_color: colors.darkSurface,
  icons: [192, 512].map(size => ({ src: `brand/icons/icon-on-dark-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any' })).concat([
    { src: 'brand/icons/maskable-on-dark-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ])
}, null, 2) + '\n');
await writeFile(at('public/brand/palette.json'), JSON.stringify({
  name: 'Sankhala Employment', status: 'Measured logo colors and asset backgrounds only; full UI design system pending',
  source: 'brand/originals', colors,
  notes: ['charcoal, white and red are sampled from opaque source artwork.', 'darkSurface is a supporting export background, not a sampled logo color.', 'Brand red is an accent; do not assume it passes normal text contrast with white.', 'Logo lettering is artwork, not an identified website font.']
}, null, 2) + '\n');
await writeFile(at('public/brand/brand-colors.css'), `/* Brand primitives only. Website typography and semantic UI tokens are pending. */\n:root {\n  --sankhala-charcoal: ${colors.charcoal};\n  --sankhala-white: ${colors.white};\n  --sankhala-red: ${colors.red};\n  --sankhala-asset-surface-dark: ${colors.darkSurface};\n}\n`);

// A label-free contact sheet shows only supplied brand art; typography is not selected here.
const sheet = canvas(1600, 1464, colors.white);
const layers = [];
async function panel(left, top, width, height, background, file, fitWidth, fitHeight) {
  const image = await sharp(at(file)).resize({ width: fitWidth, height: fitHeight, fit: 'inside' }).png().toBuffer();
  const p = await canvas(width, height, background).composite([{ input: image, gravity: 'centre' }]).png().toBuffer();
  layers.push({ input: p, left, top });
}
await panel(0, 0, 800, 440, colors.white, 'public/brand/logos/logo-on-light-800.png', 560, 320);
await panel(800, 0, 800, 440, colors.darkSurface, 'public/brand/logos/logo-on-dark-800.png', 560, 320);
await panel(0, 440, 400, 400, colors.white, 'public/brand/social/avatar-light-1024.png', 320, 320);
await panel(400, 440, 400, 400, colors.darkSurface, 'public/brand/social/avatar-dark-1024.png', 320, 320);
await panel(800, 440, 400, 400, colors.white, 'public/brand/icons/mark-on-light.png', 320, 320);
await panel(1200, 440, 400, 400, colors.darkSurface, 'public/brand/icons/mark-on-dark.png', 320, 320);
await panel(0, 840, 800, 420, colors.white, 'public/brand/social/og-light-1200x630.png', 800, 420);
await panel(800, 840, 800, 420, colors.darkSurface, 'public/brand/social/og-dark-1200x630.png', 800, 420);
for (const [i, bg] of [colors.charcoal, colors.white, colors.red, colors.darkSurface].entries()) {
  layers.push({ input: await canvas(400, 80, bg).png().toBuffer(), left: i * 400, top: 1260 });
}
// Last strip: exact native favicon sizes, alternating surfaces.
for (const [i, theme] of ['light', 'dark'].entries()) {
  layers.push({ input: await canvas(800, 124, theme === 'light' ? colors.white : colors.darkSurface).png().toBuffer(), left: i * 800, top: 1340 });
  for (const [j, size] of [16, 32, 48].entries()) layers.push({ input: await readFile(at(`public/brand/icons/favicon-on-${theme}-${size}.png`)), left: i * 800 + 264 + j * 96, top: 1340 + Math.round((124 - size) / 2) });
}
await sheet.composite(layers).removeAlpha().png().toFile(at('docs/brand/preview.png'));
await writeFile(at('docs/brand/asset-manifest.json'), JSON.stringify({
  schemaVersion: 1, generator: 'tools/brand/build.mjs', sources: [light.provenance, dark.provenance],
  derivedMark: { description: 'Original S and dot recomposed, without changing S aspect ratio; dot optical minimum is 2 pixels for small favicons.', sBounds: light.sBounds, dotBounds: light.dotBounds },
  assets: inventory.sort((a, b) => a.path.localeCompare(b.path))
}, null, 2) + '\n');
console.log(`Exported ${inventory.length} image assets, palette, manifest and preview.`);
