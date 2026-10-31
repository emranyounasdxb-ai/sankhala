import assert from 'node:assert/strict';
import sharp from 'sharp';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../../', import.meta.url));
const at = file => path.join(root, file);
const hash = b => createHash('sha256').update(b).digest('hex');
const manifest = JSON.parse(await readFile(at('docs/brand/asset-manifest.json'), 'utf8'));
const sourceHashes = [
  '6cbcb1642898dde736b251841de292600e72e492024c93bfad0145735da0d3ce',
  'dbfcb8e86c25d8978dd6f74a3695a606a77e56de9e1283dfa74acc3f96bb6453',
];
for (const [i, src] of manifest.sources.entries()) {
  assert.equal(hash(await readFile(at(src.path))), sourceHashes[i], 'Supplied original has changed');
  const theme = i === 0 ? 'light' : 'dark';
  const expected = await sharp(at(src.path)).extract(src.bounds).raw().toBuffer();
  const actual = await sharp(at(`public/brand/logos/logo-on-${theme}.png`)).raw().toBuffer();
  assert.ok(expected.equals(actual), 'Trimmed logo differs from source pixels');
}
let totalBytes = 0;
for (const asset of manifest.assets) {
  const bytes = await readFile(at(asset.path));
  assert.equal(hash(bytes), asset.sha256, `Checksum mismatch: ${asset.path}`);
  totalBytes += bytes.length;
  if (asset.format === 'ico') {
    assert.equal(bytes.readUInt16LE(0), 0);
    assert.equal(bytes.readUInt16LE(2), 1);
    assert.equal(bytes.readUInt16LE(4), 3);
    for (let i = 0; i < 3; i++) {
      const p = 6 + 16 * i;
      const size = [16, 32, 48][i];
      const length = bytes.readUInt32LE(p + 8), offset = bytes.readUInt32LE(p + 12);
      const embedded = bytes.subarray(offset, offset + length);
      const meta = await sharp(embedded).metadata();
      assert.equal(meta.width, size);
      assert.equal(meta.height, size);
      assert.equal(bytes[p], size);
      assert.ok(embedded.equals(await readFile(at(`public/brand/icons/favicon-on-dark-${size}.png`))));
    }
    continue;
  }
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.width, asset.width, asset.path);
  assert.equal(metadata.height, asset.height, asset.path);
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const transparent = /\/logos\/logo-|\/icons\/mark-/.test(asset.path);
  let minAlpha = 255, maxAlpha = 0;
  for (let p = 3; p < data.length; p += 4) { minAlpha = Math.min(minAlpha, data[p]); maxAlpha = Math.max(maxAlpha, data[p]); }
  assert.equal(maxAlpha, 255, `No opaque art: ${asset.path}`);
  assert.equal(minAlpha, transparent ? 0 : 255, `Unexpected transparency: ${asset.path}`);
  if (/maskable-|\/avatar-/.test(asset.path)) {
    const bg = asset.path.includes('dark') ? 24 : 255;
    let farthest = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const p = (y * info.width + x) * 4;
      if ([0, 1, 2].some(c => Math.abs(data[p + c] - bg) > 8)) {
        farthest = Math.max(farthest, Math.hypot(x + 0.5 - info.width / 2, y + 0.5 - info.height / 2));
      }
    }
    assert.ok(farthest <= info.width * 0.4, `Artwork outside safe circle: ${asset.path}`);
  }
  if (asset.format === 'webp') {
    const png = await sharp(at(asset.path.replace('.webp', '.png'))).ensureAlpha().raw().toBuffer();
    // Lossless encoders may normalize RGB hidden under fully transparent pixels.
    for (let p = 0; p < data.length; p += 4) {
      assert.equal(data[p + 3], png[p + 3]);
      if (png[p + 3] > 0) for (let c = 0; c < 3; c++) assert.equal(data[p + c], png[p + c]);
    }
  }
}
const appManifest = JSON.parse(await readFile(at('public/site.webmanifest'), 'utf8'));
for (const icon of appManifest.icons) {
  const { width, height } = await sharp(at(`public/${icon.src}`)).metadata();
  assert.equal(icon.sizes, `${width}x${height}`);
  assert.ok(['any', 'maskable'].includes(icon.purpose));
}
const html = await readFile(at('docs/brand/integration.html'), 'utf8');
for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"#]+)"/g)) await stat(at(`public${url}`));
for (const [, url] of html.matchAll(/\/(brand\/[^\s",]+\.(?:png|webp|css))/g)) await stat(at(`public/${url}`));
console.log(`PASS: ${manifest.assets.length} images; source fidelity, checksums, dimensions, transparency, lossless WebP, ICO, maskable safe zones and integration paths. ${(totalBytes / 1024).toFixed(0)} KiB total image exports.`);
