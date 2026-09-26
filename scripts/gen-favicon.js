const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// ─── NightmareMC SVG favicon ─────────────────────────────────────────────────
// Uses SVG <path> for the "N" (NOT <text>) so it renders at ANY size (16px, 32px, etc.)
// without needing font loading. The "N" is drawn as solid geometric shapes.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- Purple rounded background -->
  <rect width="64" height="64" rx="14" fill="#7c3aed"/>
  <!-- Dark inner panel for depth -->
  <rect x="5" y="5" width="54" height="54" rx="10" fill="#3b0764" opacity="0.5"/>
  <!-- Letter "N" drawn as a geometric path (no font needed, renders at 16px) -->
  <!-- Left vertical bar -->
  <rect x="14" y="15" width="8" height="34" rx="2" fill="white"/>
  <!-- Right vertical bar -->
  <rect x="42" y="15" width="8" height="34" rx="2" fill="white"/>
  <!-- Diagonal stroke of N (top-left to bottom-right) -->
  <polygon points="14,15 22,15 50,49 42,49" fill="white"/>
  <!-- Gold sparkle accent dot (top-right corner) -->
  <circle cx="52" cy="12" r="5" fill="#fbbf24"/>
  <circle cx="52" cy="12" r="2.5" fill="#fef9c3"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg, 'utf8');
console.log('✓ favicon.svg — geometric N path, renders at any size');

// ─── Proper ICO file (32×32, BGRA, valid Windows ICO format) ─────────────────
function createPurpleNIco(size) {
  const bmpHeaderSize = 40;
  const pixelsSize = size * size * 4;
  const andRowSize = Math.ceil(size / 32) * 4;
  const andMaskSize = andRowSize * size;
  const totalBmpSize = bmpHeaderSize + pixelsSize + andMaskSize;
  const buf = Buffer.alloc(6 + 16 + totalBmpSize, 0);
  let p = 0;

  // ICO header
  buf.writeUInt16LE(0, p); p += 2;
  buf.writeUInt16LE(1, p); p += 2;
  buf.writeUInt16LE(1, p); p += 2;

  // Image directory entry
  buf.writeUInt8(size, p); p++;
  buf.writeUInt8(size, p); p++;
  buf.writeUInt8(0, p); p++;
  buf.writeUInt8(0, p); p++;
  buf.writeUInt16LE(1, p); p += 2;
  buf.writeUInt16LE(32, p); p += 2;
  buf.writeUInt32LE(totalBmpSize, p); p += 4;
  buf.writeUInt32LE(22, p); p += 4;

  // BITMAPINFOHEADER
  buf.writeUInt32LE(bmpHeaderSize, p); p += 4;
  buf.writeInt32LE(size, p); p += 4;
  buf.writeInt32LE(size * 2, p); p += 4;
  buf.writeUInt16LE(1, p); p += 2;
  buf.writeUInt16LE(32, p); p += 2;
  buf.writeUInt32LE(0, p); p += 4;
  buf.writeUInt32LE(pixelsSize, p); p += 4;
  buf.writeInt32LE(2835, p); p += 4;
  buf.writeInt32LE(2835, p); p += 4;
  buf.writeUInt32LE(0, p); p += 4;
  buf.writeUInt32LE(0, p); p += 4;

  // Draw pixels: purple bg with white "N" shape
  const pixels = [];
  for (let y = 0; y < size; y++) {
    pixels.push([]);
    for (let x = 0; x < size; x++) {
      // Scale coordinates to 0..1 range
      const nx = x / size;
      const ny = y / size;

      // Purple background: #7c3aed = RGB(124, 58, 237)
      let r = 124, g = 58, b = 237, a = 255;

      // Draw white "N" using normalized coords
      const lx1 = 0.22, lx2 = 0.35; // left bar
      const rx1 = 0.65, rx2 = 0.78; // right bar
      const ty = 0.20, by = 0.82;   // top/bottom

      // Left vertical bar
      if (nx >= lx1 && nx <= lx2 && ny >= ty && ny <= by) {
        r = 255; g = 255; b = 255;
      }
      // Right vertical bar
      else if (nx >= rx1 && nx <= rx2 && ny >= ty && ny <= by) {
        r = 255; g = 255; b = 255;
      }
      // Diagonal stroke (top-left to bottom-right)
      else if (ny >= ty && ny <= by) {
        // Line from (lx1, ty) to (rx2, by)
        const slope = (by - ty) / (rx2 - lx1);
        const lineX = lx1 + (ny - ty) / slope;
        const halfWidth = 0.065;
        if (nx >= lineX - halfWidth && nx <= lineX + halfWidth) {
          r = 255; g = 255; b = 255;
        }
      }

      // Gold dot top-right: cx=0.80, cy=0.16, r=0.09
      const dx = nx - 0.80, dy = ny - 0.16;
      if (dx * dx + dy * dy <= 0.09 * 0.09) {
        r = 251; g = 191; b = 36;
      }

      pixels[y].push([r, g, b, a]);
    }
  }

  // Write XOR mask (bottom-up)
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixels[y][x];
      buf.writeUInt8(b, p); p++;
      buf.writeUInt8(g, p); p++;
      buf.writeUInt8(r, p); p++;
      buf.writeUInt8(a, p); p++;
    }
  }
  // AND mask stays zero (already initialized)

  return buf;
}

const ico = createPurpleNIco(32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
console.log('✓ favicon.ico — 32x32 with drawn N letter');

// ─── Write a minimal valid PNG (32x32 purple, for fallback) ──────────────────
// Node has no canvas built-in, so we write a raw PNG with filtered scanlines
function writePng(width, height, getPixel) {
  const zlib = require('zlib');
  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      raw.push(r, g, b, a);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcData = Buffer.concat([Buffer.from(type), data]);
    const crc = crc32(crcData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc);
    return Buffer.concat([len, Buffer.from(type), data, crcBuf]);
  }

  function crc32(buf) {
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    let crc = 0xFFFFFFFF;
    for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) | 0;
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(6, 9);   // color type: RGBA
  ihdr.writeUInt8(0, 10);  // compression
  ihdr.writeUInt8(0, 11);  // filter
  ihdr.writeUInt8(0, 12);  // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function getPixelNightmare(x, y, w, h) {
  const nx = x / w, ny = y / h;
  let r = 124, g = 58, b = 237, a = 255;
  const lx1 = 0.22, lx2 = 0.35, rx1 = 0.65, rx2 = 0.78;
  const ty = 0.20, by2 = 0.82;
  if (nx >= lx1 && nx <= lx2 && ny >= ty && ny <= by2) { r=255;g=255;b=255; }
  else if (nx >= rx1 && nx <= rx2 && ny >= ty && ny <= by2) { r=255;g=255;b=255; }
  else if (ny >= ty && ny <= by2) {
    const slope = (by2 - ty) / (rx2 - lx1);
    const lineX = lx1 + (ny - ty) / slope;
    if (nx >= lineX - 0.065 && nx <= lineX + 0.065) { r=255;g=255;b=255; }
  }
  const dx = nx - 0.80, dy = ny - 0.16;
  if (dx*dx + dy*dy <= 0.09*0.09) { r=251;g=191;b=36; }
  return [r, g, b, a];
}

const png32 = writePng(32, 32, getPixelNightmare);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32);
const png64 = writePng(64, 64, getPixelNightmare);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png64);
console.log('✓ favicon-32x32.png — rendered N letter');
console.log('✓ favicon.png — rendered N letter');
console.log('✓ apple-touch-icon.png — 64x64');
console.log('\n✅ All favicon assets generated with proper NightmareMC N icon!');
