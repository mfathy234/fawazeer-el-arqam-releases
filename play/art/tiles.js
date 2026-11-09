/* Letter-block tiles, printed given numbers and operator stamps for the number crossword. Each function returns a complete inline <svg> (100 x 100)
   because the numerals use the page fonts (Lalezar). Themes come from THEMES in data.js (face, shade, text, edge, style). */

const NUM_FONT = 'Lalezar, Cairo, sans-serif';
const lightColor = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) > 150; };
const numStr = v => (typeof nf === 'function' ? nf(v) : String(v));
const numSize = (s, a, b, c) => (s.length < 2 ? a : s.length < 3 ? b : c);

/** The decoration behind the numeral for each theme style. */
function tileDecor(style, th) {
  const e = th.edge;
  switch (style) {
    case 'domino': return `<path d="M20 50 H80" stroke="${e}" stroke-width="2.500" opacity=".18"/><g fill="${e}" opacity=".55"><circle cx="22" cy="22" r="4"/><circle cx="78" cy="22" r="4"/><circle cx="22" cy="72" r="4"/><circle cx="78" cy="72" r="4"/></g>`;
    case 'star': return `<path d="M50 14 L58 34 L78 22 L66 42 L86 50 L66 58 L78 78 L58 66 L50 86 L42 66 L22 78 L34 58 L14 50 L34 42 L22 22 L42 34Z" fill="none" stroke="#fff" stroke-width="2.600" stroke-linejoin="round" opacity=".38"/>`;
    case 'brick': return `<g stroke="${th.shade}" stroke-width="3" opacity=".85" fill="none"><path d="M10 36 H90 M10 64 H90 M38 12 V36 M68 36 V64 M30 64 V88"/></g>`;
    case 'rivet': return `<g fill="${th.shade}" stroke="${e}" stroke-width="2"><circle cx="21" cy="21" r="4.600"/><circle cx="79" cy="21" r="4.600"/><circle cx="21" cy="79" r="4.600"/><circle cx="79" cy="79" r="4.600"/></g><rect x="14" y="14" width="72" height="72" rx="11" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.400"/>`;
    case 'dots': return `<g fill="#ffd873" opacity=".55"><circle cx="20" cy="22" r="2.600"/><circle cx="80" cy="28" r="2.600"/><circle cx="24" cy="76" r="2.600"/><circle cx="76" cy="80" r="2.600"/><circle cx="50" cy="16" r="2"/><circle cx="50" cy="84" r="2"/></g>`;
    default: return halftone(14, 14, 72, 72, 8, 1.500, e, 0.13);
  }
}

/** A movable letter block holding number v. */
function tileSvg(th, v) {
  const s = numStr(v), size = numSize(s, 54, 46, 35), light = lightColor(th.text);
  const stroke = light ? `stroke="${th.edge}" stroke-width="8" stroke-linejoin="round" paint-order="stroke"` : '';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect class="bg" x="5" y="5" width="90" height="90" rx="19" fill="${th.face}"/>` +
    `<path d="M5 72 H95 V76 Q95 95 76 95 H24 Q5 95 5 76Z" fill="${th.shade}"/>` + tileDecor(th.style, th) +
    `<rect x="5" y="5" width="90" height="90" rx="19" fill="none" stroke="${th.edge}" stroke-width="6"/>` +
    `<path d="M15 34 Q14 18 32 15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
    `<text x="50" y="${size > 50 ? 70 : size > 40 ? 66 : 62}" text-anchor="middle" font-family="${NUM_FONT}" font-size="${size}" fill="${th.text}" ${stroke}>${s}</text></svg>`;
}

/** A number printed on the page (a given, not movable). */
function givenSvg(v) {
  const s = numStr(v), size = numSize(s, 58, 52, 40);
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect class="bg" x="5" y="5" width="90" height="90" rx="6" fill="${K.paperLight}" stroke="${K.ink}" stroke-width="4.500"/>` +
    `<rect x="11" y="11" width="78" height="78" rx="3" fill="none" stroke="${K.ink}" stroke-width="1.400" opacity=".35"/>` +
    `<text x="50" y="${size > 50 ? 70 : size > 45 ? 67 : 63}" text-anchor="middle" font-family="${NUM_FONT}" font-size="${size}" fill="${K.ink}">${s}</text></svg>`;
}

const STAMP_PATH = { '+': 'M50 28 V72 M28 50 H72', '−': 'M27 50 H73', '×': 'M32 32 L68 68 M68 32 L32 68', '÷': 'M27 50 H73', '=': 'M28 39 H72 M28 61 H72' };
const STAMP_TILT = { '+': -3, '−': 2, '×': -2, '÷': 3, '=': 0 };

/** An operator printed like a rubber stamp. ch is + − × ÷ or =. */
function stampSvg(ch) {
  const ink = ch === '=' ? K.tealDark : K.brick;
  const dots = ch === '÷' ? `<circle cx="50" cy="30" r="6" fill="${ink}"/><circle cx="50" cy="70" r="6" fill="${ink}"/>` : '';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(${STAMP_TILT[ch] || 0} 50 50)"><rect class="bg" x="7" y="7" width="86" height="86" rx="16" fill="${K.paper}" fill-opacity=".001" stroke="${ink}" stroke-width="5.500"/>` +
    `<rect x="15" y="15" width="70" height="70" rx="10" fill="none" stroke="${ink}" stroke-width="1.800" stroke-dasharray="6 4" opacity=".7"/>` +
    `<g class="chk"><path d="${STAMP_PATH[ch]}" fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round"/>${dots}</g>` +
    `<g fill="${K.paperLight}" opacity=".7"><circle cx="30" cy="22" r="1.800"/><circle cx="74" cy="80" r="2.200"/><circle cx="82" cy="30" r="1.600"/></g></g></svg>`;
}

/** The empty slot where a tile goes: a dashed, sunken square. */
function slotSvg() {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="8" y="8" width="84" height="84" rx="17" fill="${K.ink}" fill-opacity=".1" stroke="${K.ink}" stroke-opacity=".55" stroke-width="4" stroke-dasharray="9 7"/>` +
    `<path d="M16 24 Q16 16 26 16 H74" fill="none" stroke="${K.ink}" stroke-width="3" stroke-linecap="round" opacity=".18"/></svg>`;
}

const themeById = id => THEMES.find(t => t.id === id) || THEMES[0];
