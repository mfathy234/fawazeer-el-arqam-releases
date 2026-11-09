/* The cafe and the paper: menu background (low contrast so the buttons read), booklet covers (front pages) and the masthead lockup.
   Backgrounds use a lighter, thinner ink than characters (CLAUDE.md "Backgrounds stay low-contrast"). */

const BG_INK = '#9a9078';

function bgCafe() {
  const bw = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
  const glass = (x, h) => `<path d="M${x - 5} ${h} L${x - 7} ${h - 24} Q${x - 7} ${h - 28} ${x} ${h - 28} Q${x + 7} ${h - 28} ${x + 7} ${h - 24} L${x + 5} ${h}Z" fill="#c9a26a" stroke="${BG_INK}" stroke-width="1.600"/>`;
  return bw(0, 0, 360, 640, `fill="#eadfbd"`) + halftone(0, 0, 360, 420, 9, 1.600, K.ink, 0.07) +
    bw(0, 420, 360, 220, `fill="#a9d1c6"`) + bw(0, 410, 360, 14, `fill="#cfae83" stroke="${BG_INK}" stroke-width="2"`) +
    `<g stroke="#8fb8ad" stroke-width="2" opacity=".7">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 46 + 10} 424 V640"/>`).join('')}</g>` +
    `<path d="M40 232 V96 Q40 40 108 40 Q176 40 176 96 V232Z" fill="#cfe2de" stroke="${BG_INK}" stroke-width="3"/>` +
    `<path d="M108 40 V232 M40 150 H176" stroke="${BG_INK}" stroke-width="2.400" fill="none"/><path d="M52 210 Q80 180 108 200 Q140 170 166 196 V226 H52Z" fill="#f3d9a4" opacity=".7"/>` +
    `<path d="M266 0 V96" stroke="${BG_INK}" stroke-width="2.600"/><circle cx="266" cy="116" r="22" fill="#f6dc95" stroke="${BG_INK}" stroke-width="2.400"/><circle cx="266" cy="116" r="44" fill="#f6dc95" opacity=".25"/>` +
    `<path d="M252 94 H280 L276 102 H256Z" fill="#cfae83" stroke="${BG_INK}" stroke-width="2"/>` +
    bw(208, 214, 130, 10, `rx="3" fill="#cfae83" stroke="${BG_INK}" stroke-width="2"`) + glass(228, 214) + glass(248, 214) + glass(268, 214) +
    `<path d="M300 214 V196 Q300 186 312 186 Q324 186 324 196 V214Z" fill="#d9b25a" stroke="${BG_INK}" stroke-width="1.800"/>` +
    bw(224, 262, 92, 62, `rx="3" fill="#f4eccf" stroke="${BG_INK}" stroke-width="2.400"`) +
    `<g fill="${BG_INK}" opacity=".5">${bw(232, 270, 76, 8)}${bw(232, 284, 44, 4)}${bw(232, 292, 44, 4)}${bw(232, 300, 44, 4)}${bw(284, 284, 24, 24)}</g>`;
}

/** A booklet's cover: a newspaper front page in the booklet's colour. 100 x 130. */
function coverArt(book, n, done = false) {
  const num = numStr(n);
  const grid = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((row, r) => row.map((d, c) => `<rect x="${58 + c * 11}" y="${74 + r * 11}" width="11" height="11" fill="${d ? K.ink : K.white}" stroke="${K.ink}" stroke-width="1.400"/>`).join('')).join('');
  return `<rect x="4" y="4" width="92" height="122" rx="5" fill="${K.paperLight}" ${S(4)}/>` +
    `<rect x="4" y="4" width="92" height="30" rx="5" fill="${book.ink}" ${S(4)}/><rect x="10" y="10" width="80" height="2.400" fill="${K.paperLight}" opacity=".8"/><rect x="10" y="26" width="80" height="2.400" fill="${K.paperLight}" opacity=".8"/>` +
    `<text x="50" y="25" text-anchor="middle" font-family="${NUM_FONT}" font-size="15" fill="${K.paperLight}">FAWAZEER</text>` +
    `<text x="26" y="86" text-anchor="middle" font-family="${NUM_FONT}" font-size="${num.length > 1 ? 40 : 52}" fill="${book.ink}" stroke="${K.ink}" stroke-width="1.600">${num}</text>` + grid +
    `<rect x="10" y="40" width="48" height="5" fill="${K.ink}"/><rect x="10" y="48" width="34" height="3.200" fill="${K.inkSoft}" opacity=".7"/>` +
    `<rect x="10" y="108" width="80" height="2" fill="${K.inkSoft}" opacity=".6"/><rect x="10" y="114" width="56" height="2" fill="${K.inkSoft}" opacity=".6"/>` +
    halftone(10, 56, 40, 12, 4, 0.9, K.ink, 0.3) + (done ? `<circle cx="80" cy="46" r="11" fill="${K.mustard}" ${S(2.600)}/><path d="M74 46 l4.500 4.500 L87 41" fill="none" stroke="${K.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : '');
}

/** Title lockup, 480 x 190: Arabic masthead over the English name between double rules. */
function mastheadArt() {
  return `<path d="M20 14 H460 M20 20 H460" stroke="${K.ink}" stroke-width="4"/><path d="M20 14 H460" stroke="${K.ink}" stroke-width="1.200" transform="translate(0 -5)"/>` +
    `<text x="244" y="116" text-anchor="middle" font-family="Lalezar" font-size="104" fill="${K.mustard}" stroke="${K.ink}" stroke-width="14" stroke-linejoin="round" direction="rtl">فوازير الأرقام</text>` +
    `<text x="240" y="112" text-anchor="middle" font-family="Lalezar" font-size="104" fill="${K.paperLight}" stroke="${K.ink}" stroke-width="6" stroke-linejoin="round" paint-order="stroke" direction="rtl">فوازير الأرقام</text>` +
    `<path d="M20 144 H460 M20 150 H460" stroke="${K.ink}" stroke-width="4"/>` +
    `<text x="240" y="178" text-anchor="middle" font-family="Cairo" font-weight="700" font-size="22" letter-spacing="7" fill="${K.ink}">FAWAZEER EL ARQAM</text>` +
    `<g fill="${K.brick}"><path d="M36 134 l3 -9 3 9 -8 -5.500 h10z"/><path d="M438 134 l3 -9 3 9 -8 -5.500 h10z"/></g>`;
}
