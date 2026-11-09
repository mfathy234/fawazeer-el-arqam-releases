/* Haj Salhafa's hats and the cafe cups. Hats are drawn around (0,0) = the middle of the top of his head, about 64 wide and 48 tall above it.
   Cups are drawn around (0,0) = the middle of the saucer's base, about 36 wide and 44 tall above it. Registries HAT_ART and CUP_ART map ids to functions. */

const HAT_ART = {
  tarboosh: () =>
    `<path d="M-6 -36 Q-26 -22 -30 -2" fill="none" stroke="${K.ink}" stroke-width="7" stroke-linecap="round"/><path d="M-6 -36 Q-26 -22 -30 -2" fill="none" stroke="#2a2438" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M-31 -2 L-27 3 L-33 8 L-35 2Z" fill="#2a2438" ${S(2)}/>` +
    `<path d="M-23 4 L-17 -34 Q0 -42 17 -34 L23 4 Q0 12 -23 4Z" fill="${K.brick}" ${S(4.5)}/>` +
    `<ellipse cx="0" cy="-35" rx="17" ry="5.5" fill="${K.brickLight}" ${S(3.5)}/>` +
    `<path d="M-22 0 Q0 8 22 0 L21 7 Q0 14 -21 7Z" fill="${K.brickDark}" ${S(3)}/>` +
    `<path d="M-13 -26 Q-15 -14 -14 -6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
  cap: () =>
    `<path d="M-30 2 Q-32 -18 -6 -26 Q22 -30 32 -10 Q36 0 28 4 Q0 12 -30 2Z" fill="${K.blue}" ${S(4.5)}/>` +
    `<path d="M-6 -26 Q10 -18 8 6" fill="none" stroke="${K.blueDark}" stroke-width="3"/>` +
    `<path d="M-2 -28 Q-4 -34 2 -34" fill="none" ${S(3)}/><circle cx="2" cy="-31" r="3" fill="${K.blueDark}" ${S(2)}/>` +
    `<path d="M10 4 Q36 12 40 2 Q38 -4 28 2Z" fill="${K.blueDark}" ${S(3.5)}/>` +
    `<path d="M-22 -12 Q-14 -20 -4 -22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>` +
    `<g fill="${K.ink}" opacity=".25"><circle cx="-16" cy="-6" r="1.4"/><circle cx="-4" cy="-12" r="1.4"/><circle cx="14" cy="-14" r="1.4"/><circle cx="22" cy="-4" r="1.4"/></g>`,
  straw: () =>
    `<ellipse cx="0" cy="2" rx="40" ry="9" fill="${K.mustardLight}" ${S(4.5)}/>` +
    `<path d="M-21 2 Q-22 -26 0 -28 Q22 -26 21 2Z" fill="${K.mustardLight}" ${S(4.5)}/>` +
    `<path d="M-21.5 -6 Q0 0 21.5 -6 L21 2 Q0 8 -21 2Z" fill="${K.brick}" ${S(3)}/>` +
    `<g stroke="${K.mustardDark}" stroke-width="1.6" stroke-linecap="round" opacity=".7"><path d="M-14 -22 L-12 -10M-6 -26 L-5 -10M3 -27 L3 -10M12 -24 L11 -10"/><path d="M-34 2 Q-20 6 -8 8M34 2 Q20 6 8 8"/></g>`,
  chef: () =>
    `<path d="M-19 4 L-17 -12 L17 -12 L19 4 Q0 10 -19 4Z" fill="${K.white}" ${S(4)}/>` +
    `<circle cx="-16" cy="-22" r="12" fill="${K.white}" ${S(4)}/><circle cx="16" cy="-22" r="12" fill="${K.white}" ${S(4)}/><circle cx="0" cy="-32" r="14" fill="${K.white}" ${S(4)}/>` +
    `<path d="M-17 -12 Q0 -6 17 -12" fill="${K.white}" ${S(3)}/><path d="M-6 -30 Q-2 -24 -6 -18M8 -30 Q5 -24 8 -19" fill="none" stroke="${K.paperDark}" stroke-width="2.4" stroke-linecap="round"/>`,
  party: () =>
    `<path d="M-20 4 L0 -44 L20 4 Q0 10 -20 4Z" fill="${K.teal}" ${S(4.5)}/>` +
    `<path d="M-14 -10 L14 -10 M-9 -22 L9 -22" stroke="${K.mustard}" stroke-width="5" stroke-linecap="round"/>` +
    `<g fill="${K.brick}"><circle cx="-6" cy="-3" r="2.4"/><circle cx="6" cy="-4" r="2.4"/><circle cx="0" cy="-16" r="2.2"/></g>` +
    `<circle cx="0" cy="-46" r="7" fill="${K.mustard}" ${S(3.5)}/><path d="M-20 4 Q0 10 20 4" fill="none" ${S(3)}/>`,
  crown: () =>
    `<path d="M-24 6 L-27 -22 L-13 -8 L0 -30 L13 -8 L27 -22 L24 6 Q0 12 -24 6Z" fill="${K.mustard}" ${S(4.5)}/>` +
    `<path d="M-24 -2 Q0 5 24 -2" fill="none" stroke="${K.mustardDark}" stroke-width="3"/>` +
    `<circle cx="0" cy="-34" r="4" fill="${K.brick}" ${S(2.4)}/><circle cx="-27" cy="-25" r="3.6" fill="${K.teal}" ${S(2.4)}/><circle cx="27" cy="-25" r="3.6" fill="${K.teal}" ${S(2.4)}/>` +
    `<circle cx="0" cy="-8" r="4.2" fill="${K.brick}" ${S(2.4)}/><circle cx="-14" cy="-1" r="3" fill="${K.tealLight}" ${S(2)}/><circle cx="14" cy="-1" r="3" fill="${K.tealLight}" ${S(2)}/>` +
    `<path d="M-18 -14 L-20 -4" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`
};

const saucer = (w = 17) => `<ellipse cx="0" cy="-1" rx="${w}" ry="4.6" fill="${K.white}" ${S(3.2)}/><ellipse cx="0" cy="-2.4" rx="${w * 0.58}" ry="2.2" fill="${K.paperDark}"/>`;
const steam = (x, dy = 0) => `<path d="M${x} ${-32 + dy} Q${x + 5} ${-38 + dy} ${x} ${-44 + dy} Q${x - 5} ${-50 + dy} ${x} ${-56 + dy}" fill="none" stroke="${K.ink}" stroke-width="2.4" stroke-linecap="round" opacity=".3"/>`;

const CUP_ART = {
  tea: liq =>
    saucer() + `<path d="M-9 -34 Q-13 -14 -7.5 -3 L7.5 -3 Q13 -14 9 -34Z" fill="${K.white}" fill-opacity=".7" ${S(3.2)}/>` +
    `<path d="M-10.600 -26 Q-12.500 -12 -7.300 -4 L7.300 -4 Q12.500 -12 10.600 -26Z" fill="${liq}"/><path d="M-9 -34 Q0 -31 9 -34" fill="none" ${S(2.6)}/>` +
    `<path d="M-6 -22 Q-8 -14 -5.500 -9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/><path d="M5 -40 L13 -22" stroke="${K.ink}" stroke-width="2.4" stroke-linecap="round"/>` + steam(-2) + steam(5, 3),
  coffee: liq =>
    saucer(16) + `<path d="M-11 -17 L11 -17 Q10.500 -3 0 -3 Q-10.500 -3 -11 -17Z" fill="${K.white}" ${S(3.2)}/>` +
    `<ellipse cx="0" cy="-17" rx="11" ry="3.400" fill="${liq}" ${S(2.4)}/><ellipse cx="-2" cy="-17.500" rx="4" ry="1.300" fill="#fff" opacity=".28"/>` +
    `<path d="M-8 -14 Q-6 -8 -3 -6" fill="none" stroke="${K.brick}" stroke-width="2" stroke-linecap="round"/>` + steam(-3, 14) + steam(4, 17),
  sahlab: liq =>
    saucer(18) + `<path d="M-14 -24 L14 -24 Q14 -3 0 -3 Q-14 -3 -14 -24Z" fill="${K.white}" ${S(3.2)}/><path d="M14 -20 Q24 -20 22 -12 Q20 -8 12 -9" fill="none" ${S(3.2)}/>` +
    `<ellipse cx="0" cy="-24" rx="14" ry="4" fill="${liq}" ${S(2.4)}/><g fill="${K.brown}"><circle cx="-6" cy="-25" r="1.700"/><circle cx="0" cy="-23.500" r="1.700"/><circle cx="6" cy="-25" r="1.700"/><circle cx="-2" cy="-26" r="1.400" fill="${K.brick}"/></g>` + steam(-3, 6) + steam(5, 8),
  karkade: liq =>
    saucer(15) + `<path d="M-11 -38 L11 -38 L9 -3 L-9 -3Z" fill="${K.white}" fill-opacity=".7" ${S(3.2)}/><path d="M-10 -30 L10 -30 L8.600 -4.500 L-8.600 -4.500Z" fill="${liq}"/>` +
    `<g fill="#fff" fill-opacity=".55" stroke="${K.ink}" stroke-width="1.600"><rect x="-6" y="-26" width="7" height="7" rx="1.600" transform="rotate(-10 -3 -22)"/><rect x="0" y="-18" width="7" height="7" rx="1.600" transform="rotate(12 3 -14)"/></g>` +
    `<path d="M2 -48 L-1 -22" stroke="${K.brick}" stroke-width="3.600" stroke-linecap="round"/><path d="M2 -48 L-1 -22" stroke="${K.ink}" stroke-width="1.200" stroke-linecap="round" opacity=".5"/>`,
  lemon: liq =>
    saucer(16) + `<path d="M-12 -36 L12 -36 L10 -3 L-10 -3Z" fill="${K.white}" fill-opacity=".7" ${S(3.2)}/><path d="M-11 -28 L11 -28 L9.200 -4.500 L-9.200 -4.500Z" fill="${liq}"/>` +
    `<circle cx="11" cy="-36" r="8" fill="#f6dc55" ${S(2.800)}/><circle cx="11" cy="-36" r="4.800" fill="#fbf0a0"/><path d="M11 -41 V-31 M6 -36 H16" stroke="#f6dc55" stroke-width="1.400"/>` +
    `<path d="M-6 -40 Q-14 -50 -4 -48 Q0 -46 -3 -40Z" fill="${K.teal}" ${S(2)}/><path d="M-1 -39 Q0 -52 8 -46 Q8 -40 2 -38Z" fill="${K.tealDark}" ${S(2)}/>`
};

const hatArt = id => (HAT_ART[id] || HAT_ART.tarboosh)();
const cupArt = id => { const c = CUPS.find(x => x.id === id) || CUPS[0]; return (CUP_ART[c.id] || CUP_ART.tea)(c.liquid); };
