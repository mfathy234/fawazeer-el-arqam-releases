/* Fawazeer El Arqam art primitives: the old-newspaper cafe palette and the rubber-hose helpers (technique shared with Tayara El Hara and Natta).
   Every drawing function returns an SVG fragment string (no <svg> wrapper). Style rules live in CLAUDE.md: ink outlines, pie-cut eyes, white gloves, flat fills. */

const K = {
  ink: '#14213a', inkSoft: '#3a4863', paper: '#f1e6c8', paperDark: '#e2d3ab', paperLight: '#f8f0da', white: '#fffaf0',
  mustard: '#e3a82a', mustardDark: '#b57d12', mustardLight: '#f3cf6b',
  brick: '#b5472e', brickDark: '#7f2e1c', brickLight: '#d9694b',
  teal: '#2aa9a0', tealDark: '#1b7872', tealLight: '#7fd6cb',
  olive: '#7d8a3c', oliveDark: '#55612a', oliveLight: '#a8b45d', shell: '#8c7b36', shellDark: '#5e4f1e', shellLight: '#b09c4a', skin: '#b5bd78', skinDark: '#7f8a45', skinLight: '#d3d8a0',
  wood: '#a06a3a', woodDark: '#6e4524', woodLight: '#c28a52',
  brown: '#a8703c', brownDark: '#6e4524', cream: '#ecd9a6', tea: '#b4521c', pink: '#e8a49a', blue: '#2c4a7a', blueDark: '#1c3256', grey: '#8d8672', night: '#0f1830'
};

/** Ink stroke attributes. @param {number} w stroke width */
const S = (w = 4) => `stroke="${K.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/** Place a fragment at (x, y) with uniform scale and optional rotation. */
const at = (x, y, s, m, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${m}</g>`;

/** Mirror a fragment across a vertical axis at x = cx. */
const mirror = (cx, m) => `<g transform="translate(${cx * 2} 0) scale(-1 1)">${m}</g>`;

/** Deterministic random numbers so generated scenery is identical every run. */
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Rubber-hose eye: white oval, ink pupil with a pie-cut wedge. */
function pieEye(cx, cy, rx, ry, px = 2, py = 2, white = K.white) {
  const pr = rx * 0.56, pry = ry * 0.62, x = cx + px, y = cy + py;
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${white}" ${S(2.6)}/>` +
    `<ellipse cx="${x}" cy="${y}" rx="${pr}" ry="${pry}" fill="${K.ink}"/>` +
    `<path d="M${x} ${y - pry} L${x + pr * 0.15} ${y - pry * 0.1} L${x + pr} ${y - pry * 0.35} Z" fill="${white}"/>`;
}

/** Three-line white cartoon glove seen from the back. */
function glove(x, y, r) {
  return `<rect x="${x - r * 0.65}" y="${y + r * 0.55}" width="${r * 1.3}" height="${r * 0.55}" rx="${r * 0.2}" fill="${K.white}" ${S(2.4)}/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${K.white}" ${S(2.4)}/>` +
    `<path d="M${x - r * 0.32} ${y - r * 0.5} V${y + r * 0.1} M${x} ${y - r * 0.6} V${y + r * 0.1} M${x + r * 0.32} ${y - r * 0.5} V${y + r * 0.1}" stroke="${K.ink}" stroke-width="1.5" stroke-linecap="round"/>`;
}

/** A single "hose" limb: a thick ink stroke with a lighter fill stroke inside. */
function hose(d, fill, w = 9) {
  return `<path d="${d}" fill="none" stroke="${K.ink}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function sparkle(x, y, s, fill = K.mustardLight) {
  return `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z" fill="${fill}" ${S(1.8)}/>`;
}

/** A row of halftone dots (printing look), clipped by the caller. */
function halftone(x, y, w, h, step, r, fill = K.ink, op = 0.14) {
  let d = '';
  for (let j = 0, row = 0; y + j * step <= y + h; j++, row++) {
    for (let i = 0; x + i * step + (row % 2 ? step / 2 : 0) <= x + w; i++) d += `<circle cx="${x + i * step + (row % 2 ? step / 2 : 0)}" cy="${y + j * step}" r="${r}"/>`;
  }
  return `<g fill="${fill}" opacity="${op}">${d}</g>`;
}

/** Wrap a fragment in a standalone SVG document. */
function svgDoc(vb, body, attrs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ${attrs}>${body}</svg>`;
}
