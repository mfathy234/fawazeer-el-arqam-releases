/* Small UI art: coin, stars, lock and the button icons (the last nine, from ok to copy, are used by the word games). All on a 24 x 24 grid, ink outlines, mustard / turquoise / brick accents.
   ICON_ART maps a name to an SVG fragment; icon(name) wraps it. */

const I = 'stroke="#14213a" stroke-linecap="round" stroke-linejoin="round"';
const STAR_PATH = 'M12 2.600l2.900 6 6.500.8-4.800 4.500 1.300 6.500L12 17l-5.900 3.300 1.300-6.500L2.600 9.400l6.500-.8z';

const ICON_ART = {
  coin: `<circle cx="12" cy="12" r="9.500" fill="${K.mustard}" ${I} stroke-width="2.200"/><circle cx="12" cy="12" r="6" fill="none" stroke="${K.mustardDark}" stroke-width="2"/><path d="M8.500 8 Q10 6.500 12 6.500" fill="none" stroke="#fff" stroke-width="1.600" stroke-linecap="round" opacity=".7"/>`,
  star: `<path d="${STAR_PATH}" fill="${K.mustard}" ${I} stroke-width="1.900"/>`,
  starOff: `<path d="${STAR_PATH}" fill="${K.paperDark}" ${I} stroke-width="1.900" opacity=".8"/>`,
  lock: `<rect x="5" y="10.500" width="14" height="10" rx="2.500" fill="${K.mustard}" ${I} stroke-width="2.200"/><path d="M8 10.500 V8 a4 4 0 0 1 8 0 V10.500" fill="none" ${I} stroke-width="2.200"/><circle cx="12" cy="15.500" r="1.600" fill="#14213a"/>`,
  tick: `<path d="M4.500 12.500l5 5L19.500 6.500" fill="none" stroke="${K.tealDark}" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/>`,
  undo: `<path d="M9 4L4 9l5 5M4 9h10a6 6 0 0 1 0 12h-3" fill="none" ${I} stroke-width="2.600"/>`,
  hint: `<circle cx="12" cy="10" r="6.500" fill="${K.mustardLight}" ${I} stroke-width="2.400"/><rect x="9" y="17" width="6" height="4" rx="1.500" fill="${K.grey}" ${I} stroke-width="2"/><path d="M10 9.500 L12 12 L14 9.500" fill="none" stroke="${K.mustardDark}" stroke-width="1.800" stroke-linecap="round"/>`,
  shuffle: `<path d="M3 7h4q4 0 6 5t6 5h2M3 17h4q3 0 4.500-2.500M13 9q1.500-2 4-2h3M18 4l3 3-3 3M18 14l3 3-3 3" fill="none" ${I} stroke-width="2.200"/>`,
  restart: `<path d="M4 12a8 8 0 1 0 3-6.200M4 4v5h5" fill="none" ${I} stroke-width="2.600"/>`,
  home: `<path d="M4 11l8-7 8 7M6 10v10h12V10" fill="none" ${I} stroke-width="2.400"/>`,
  soundOn: `<path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z" fill="${K.mustard}" ${I} stroke-width="2"/><path d="M15.500 9q2 3 0 6M18 6.500q4 5.500 0 11" fill="none" ${I} stroke-width="2"/>`,
  soundOff: `<path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z" fill="${K.paperDark}" ${I} stroke-width="2"/><path d="M15.500 9.500l5 5M20.500 9.500l-5 5" fill="none" stroke="${K.brick}" stroke-width="2.400" stroke-linecap="round"/>`,
  gear: `<circle cx="12" cy="12" r="3.600" fill="none" ${I} stroke-width="2.400"/><circle cx="12" cy="12" r="7.600" fill="none" ${I} stroke-width="2.600" stroke-dasharray="3.700 2.700"/>`,
  trophy: `<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="${K.mustard}" ${I} stroke-width="2.200"/><path d="M7 6H4q0 5 3.500 5M17 6h3q0 5-3.500 5M12 14v4M8 20h8" fill="none" ${I} stroke-width="2.200"/>`,
  shop: `<path d="M5 8h14l-1 12H6z" fill="${K.brick}" ${I} stroke-width="2.200"/><path d="M9 8V6.500a3 3 0 0 1 6 0V8" fill="none" ${I} stroke-width="2.200"/><circle cx="12" cy="13.500" r="2.200" fill="${K.mustardLight}" stroke="#14213a" stroke-width="1.600"/>`,
  calendar: `<rect x="4" y="5.500" width="16" height="14.500" rx="2.500" fill="${K.paperLight}" ${I} stroke-width="2.200"/><path d="M4 10h16M8.500 3.500v4M15.500 3.500v4" fill="none" ${I} stroke-width="2.200"/><circle cx="12" cy="15" r="2" fill="${K.brick}"/>`,
  book: `<path d="M4 5.500q4-1.500 8 1 4-2.500 8-1V19q-4-1.500-8 1-4-2.500-8-1z" fill="${K.paperLight}" ${I} stroke-width="2.200"/><path d="M12 6.500V20" fill="none" ${I} stroke-width="2"/>`,
  dice: `<rect x="4" y="4" width="16" height="16" rx="4" fill="${K.white}" ${I} stroke-width="2.200"/><g fill="#14213a"><circle cx="9" cy="9" r="1.500"/><circle cx="15" cy="9" r="1.500"/><circle cx="12" cy="12" r="1.500"/><circle cx="9" cy="15" r="1.500"/><circle cx="15" cy="15" r="1.500"/></g>`,
  flame: `<path d="M12 3q1 4 4 6.500t1 6.500a5 5 0 0 1-10 0q0-3 2-4.500 0 2 1.500 2 0-4 1.500-10.500z" fill="${K.brick}" ${I} stroke-width="2"/><path d="M12 20a2.500 2.500 0 0 1-2.500-2.500q0-2 2.500-3.500 2.500 1.500 2.500 3.500A2.500 2.500 0 0 1 12 20z" fill="${K.mustardLight}"/>`,
  close: `<path d="M6 6l12 12M18 6L6 18" fill="none" ${I} stroke-width="3"/>`,
  chevL: `<path d="M15 5l-7 7 7 7" fill="none" ${I} stroke-width="3"/>`,
  chevR: `<path d="M9 5l7 7-7 7" fill="none" ${I} stroke-width="3"/>`,
  tea: `<path d="M7 5h10l-1.500 12a3.500 3.500 0 0 1-7 0z" fill="${K.tea}" ${I} stroke-width="2.200"/><path d="M5 20h14" fill="none" ${I} stroke-width="2.200"/>`,
  ok: `<path d="M4.500 12.500l5 5L19.500 6.500" fill="none" ${I} stroke-width="3.200"/>`,
  bksp: `<path d="M9 5.500h11.500v13H9L3 12z" fill="${K.paperLight}" ${I} stroke-width="2.200"/><path d="M12.500 9.500l5 5m0-5l-5 5" fill="none" ${I} stroke-width="2.200"/>`,
  wheel: `<circle cx="12" cy="12" r="9" fill="${K.paperLight}" ${I} stroke-width="2.200"/><g fill="${K.mustard}" ${I} stroke-width="1.600"><circle cx="12" cy="5.800" r="2.300"/><circle cx="17.500" cy="9" r="2.300"/><circle cx="17.500" cy="15" r="2.300"/><circle cx="12" cy="18.200" r="2.300"/><circle cx="6.500" cy="15" r="2.300"/><circle cx="6.500" cy="9" r="2.300"/></g>`,
  riddle: `<circle cx="12" cy="12" r="9" fill="${K.mustardLight}" ${I} stroke-width="2.200"/><path d="M9 9.500a3 3 0 1 1 4.600 2.500c-1 .6-1.600 1.200-1.600 2.500" fill="none" ${I} stroke-width="2.400"/><circle cx="12" cy="17.300" r="1.300" fill="#14213a"/>`,
  tiles: `<g ${I} stroke-width="2"><rect x="2.500" y="8.500" width="6" height="7" rx="1.500" fill="${K.teal}"/><rect x="9" y="8.500" width="6" height="7" rx="1.500" fill="${K.mustard}"/><rect x="15.500" y="8.500" width="6" height="7" rx="1.500" fill="${K.paperDark}"/></g>`,
  column: `<rect x="5" y="3.500" width="14" height="17" rx="1.500" fill="${K.paperLight}" ${I} stroke-width="2.200"/><path d="M8 7.500h8M8 11h8M8 14.500h5" stroke="#14213a" stroke-width="1.800" stroke-linecap="round"/><rect x="8" y="16.800" width="3.500" height="1.800" fill="${K.brick}"/>`,
  eye: `<path d="M2.500 12S6 6 12 6s9.500 6 9.500 6-3.500 6-9.500 6S2.500 12 2.500 12z" fill="${K.paperLight}" ${I} stroke-width="2.200"/><circle cx="12" cy="12" r="3" fill="${K.teal}" ${I} stroke-width="2"/>`,
  help: `<circle cx="12" cy="12" r="9" fill="${K.paperLight}" ${I} stroke-width="2.200"/><path d="M9.500 9.500a2.600 2.600 0 1 1 4 2.200c-.9.600-1.500 1.100-1.500 2.300" fill="none" ${I} stroke-width="2.200"/><circle cx="12" cy="17" r="1.200" fill="#14213a"/>`,
  copy: `<rect x="8" y="8" width="12" height="12" rx="2.500" fill="${K.paperLight}" ${I} stroke-width="2.200"/><path d="M16 8V5.500a1.500 1.500 0 0 0-1.500-1.500h-9A1.500 1.500 0 0 0 4 5.500v9A1.500 1.500 0 0 0 5.500 16H8" fill="none" ${I} stroke-width="2.200"/>`
};

const icon = (name, cls = '') => `<svg viewBox="0 0 24 24" class="ic ${cls}" aria-hidden="true">${ICON_ART[name] || ''}</svg>`;
