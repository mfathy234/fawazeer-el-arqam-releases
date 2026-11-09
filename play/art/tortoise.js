/* Haj Salhafa (الحاج سلحفة): a wise old tortoise in a waistcoat, glasses and a white moustache, reading the paper at his cafe table.
   tortoiseArt(pose, hat, cup) is one 200 x 205 drawing; poses idle cheer oops think sip. The hat and the cup come from hats.js and are the shop's. */

const TORTOISE_POSES = ['idle', 'cheer', 'oops', 'think', 'sip'];
const TORTOISE_VB = '0 0 200 205';
const SHELL_LINE = K.oliveDark;

/** The newspaper he reads, centred on (0,0), 84 x 58: masthead bar, headlines, columns and a mini number crossword. */
function newspaperArt() {
  const cells = [[0, 0, 1], [1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 1], [2, 1, 0], [0, 2, 0], [1, 2, 0], [2, 2, 1]]
    .map(([c, r, dark]) => `<rect x="${8 + c * 9}" y="${-10 + r * 9}" width="9" height="9" fill="${dark ? K.ink : K.white}" stroke="${K.ink}" stroke-width="1.4"/>`).join('');
  const lines = (x, y, w, n) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 4.400}" width="${i === n - 1 ? w * 0.6 : w}" height="1.800" rx=".9" fill="${K.inkSoft}" opacity=".7"/>`).join('');
  return `<path d="M-42 -29 L42 -29 L44 29 L-44 29Z" fill="${K.paperLight}" ${S(3.6)}/>` +
    `<path d="M0 -29 V29" stroke="${K.ink}" stroke-width="1.600" opacity=".25"/>` +
    `<rect x="-38" y="-25" width="76" height="9" rx="1.500" fill="${K.ink}"/><rect x="-30" y="-22.500" width="38" height="2.600" rx="1.300" fill="${K.paperLight}"/><rect x="14" y="-22.500" width="18" height="2.600" rx="1.300" fill="${K.mustard}"/>` +
    `<rect x="-38" y="-12" width="40" height="5.500" fill="${K.ink}"/><rect x="-38" y="-4.500" width="26" height="3.600" fill="${K.inkSoft}"/>` +
    lines(-38, 2, 38, 6) + `<rect x="5" y="-14" width="37" height="39" fill="${K.paperDark}" opacity=".5"/>` + cells +
    `<rect x="6" y="19" width="31" height="1.800" fill="${K.inkSoft}" opacity=".7"/><rect x="6" y="23" width="20" height="1.800" fill="${K.inkSoft}" opacity=".7"/>`;
}

function hexPath(x, y, r) {
  const p = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i + Math.PI / 6; return (x + r * Math.cos(a)).toFixed(1) + ' ' + (y + r * 0.92 * Math.sin(a)).toFixed(1); });
  return 'M' + p.join(' L') + 'Z';
}

function shellArt() {
  const hexes = [[40, 98, 20], [160, 98, 20], [30, 130, 17], [170, 130, 17], [58, 60, 15], [142, 60, 15], [100, 40, 14], [24, 78, 12], [176, 78, 12]]
    .map(([x, y, r]) => `<path d="${hexPath(x, y, r)}" fill="${K.shellLight}" stroke="${K.shellDark}" stroke-width="3.400" stroke-linejoin="round"/>`).join('');
  return `<ellipse cx="100" cy="112" rx="84" ry="64" fill="${K.shell}" ${S(5)}/>` + hexes +
    `<path d="M50 52 Q64 42 80 44" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>`;
}

function vestArt() {
  return `<path d="M56 176 Q50 118 80 106 L120 106 Q150 118 144 176Z" fill="${K.brick}" ${S(4.500)}/>` +
    `<path d="M86 106 L100 128 L114 106Z" fill="${K.white}" ${S(3)}/><path d="M100 128 V176" stroke="${K.brickDark}" stroke-width="2.600"/>` +
    `<g fill="${K.mustard}" ${S(2.200)}><circle cx="108" cy="140" r="3.600"/><circle cx="108" cy="156" r="3.600"/></g>` +
    `<path d="M70 146 Q86 158 100 150" fill="none" stroke="${K.mustard}" stroke-width="2.400"/><circle cx="70" cy="146" r="4" fill="${K.mustardLight}" ${S(2)}/>`;
}

const EYE_ARC = (mood, cx) => (mood === 'happy'
  ? `<path d="M${cx - 6.500} 75 Q${cx} 65 ${cx + 6.500} 75" fill="none" ${S(4)}/>`
  : `<path d="M${cx - 6.500} 71 Q${cx} 78 ${cx + 6.500} 71" fill="none" ${S(4)}/>`);

function headArt(pose) {
  const eyes = pose === 'cheer' ? EYE_ARC('happy', 86) + EYE_ARC('happy', 114)
    : pose === 'sip' ? EYE_ARC('calm', 86) + EYE_ARC('calm', 114)
    : pose === 'oops' ? pieEye(86, 72, 8.500, 9.500, 0, 0) + pieEye(114, 72, 8.500, 9.500, 0, 0)
    : pose === 'think' ? pieEye(86, 72, 8, 9, 3, -3) + pieEye(114, 72, 8, 9, 3, -3)
    : pieEye(86, 72, 8, 9, -1, 2) + pieEye(114, 72, 8, 9, -1, 2);
  const brows = pose === 'cheer' ? hose('M74 54 Q86 46 97 53', K.white, 4.500) + hose('M103 53 Q114 46 126 54', K.white, 4.500)
    : pose === 'oops' ? hose('M74 58 Q86 54 97 47', K.white, 4.500) + hose('M103 47 Q114 54 126 58', K.white, 4.500)
    : pose === 'think' ? hose('M75 59 Q86 55 96 58', K.white, 4.500) + hose('M103 52 Q114 45 125 51', K.white, 4.500)
    : hose('M75 57 Q86 51 96 57', K.white, 4.500) + hose('M104 57 Q114 51 125 57', K.white, 4.500);
  const mouth = pose === 'cheer' ? `<path d="M90 96 Q100 116 110 96Z" fill="#7a1a1a" ${S(3)}/><path d="M95 107 Q100 102 105 107 Q100 112 95 107Z" fill="#d9695f"/>`
    : pose === 'oops' ? `<ellipse cx="100" cy="102" rx="5.500" ry="6.500" fill="#7a1a1a" ${S(3)}/>`
    : pose === 'think' ? `<path d="M93 100 Q100 98 107 101" fill="none" ${S(3)}/>`
    : `<path d="M92 98 Q100 104 108 98" fill="none" ${S(3)}/>`;
  const sweat = pose === 'oops' ? `<path d="M130 52 Q135 60 130 64 Q125 60 130 52Z" fill="${K.tealLight}" ${S(2)}/>` : '';
  return `<path d="M89 110 Q87 94 90 84 L110 84 Q113 94 111 110Z" fill="${K.skin}" ${S(4.500)}/><path d="M90 98 Q100 103 110 98M91 105 Q100 109 109 105" fill="none" stroke="${K.skinDark}" stroke-width="2.200" stroke-linecap="round"/>` +
    `<ellipse cx="100" cy="75" rx="32" ry="28" fill="${K.skin}" ${S(4.500)}/><ellipse cx="100" cy="90" rx="17" ry="11" fill="${K.skinLight}"/>` +
    `<path d="M92 80 Q100 70 108 80 Q106 88 100 91 Q94 88 92 80Z" fill="${K.skinLight}" ${S(3.200)}/><circle cx="97" cy="82" r="1.600" fill="${K.ink}"/><circle cx="103" cy="82" r="1.600" fill="${K.ink}"/>` +
    `<path d="M70 66 Q69 80 75 88" fill="none" stroke="${K.skinDark}" stroke-width="2.200" stroke-linecap="round" opacity=".7"/><path d="M130 66 Q131 80 125 88" fill="none" stroke="${K.skinDark}" stroke-width="2.200" stroke-linecap="round" opacity=".7"/>` +
    
    `<ellipse cx="75" cy="86" rx="5.500" ry="4" fill="${K.pink}" opacity=".7"/><ellipse cx="125" cy="86" rx="5.500" ry="4" fill="${K.pink}" opacity=".7"/>` +
    `<circle cx="86" cy="72" r="12" fill="${K.white}" fill-opacity=".3" ${S(3.800)}/><circle cx="114" cy="72" r="12" fill="${K.white}" fill-opacity=".3" ${S(3.800)}/>` +
    `<circle cx="86" cy="72" r="12" fill="none" stroke="${K.mustard}" stroke-width="1.600"/><circle cx="114" cy="72" r="12" fill="none" stroke="${K.mustard}" stroke-width="1.600"/>` +
    `<path d="M98 70 Q100 67 102 70M74 70 L68 67M126 70 L132 67" fill="none" ${S(2.800)}/>` + eyes + brows + mouth +
    `<path d="M100 85 C94 79 85 81 81 87 C77 92 80 97 84 95 C88 99 96 97 100 92 C104 97 112 99 116 95 C120 97 123 92 119 87 C115 81 106 79 100 85Z" fill="${K.white}" ${S(3.200)}/>` +
    `<path d="M88 90 Q92 93 97 91M103 91 Q108 93 112 90" fill="none" stroke="${K.paperDark}" stroke-width="2" stroke-linecap="round"/>` + sweat;
}

/** Arms and gloves per pose. Returns the hose arms, the newspaper where it sits, and the cup held (or null). */
function armsArt(pose, cupId) {
  const arm = (d, gx, gy) => hose(d, K.skin, 8.500) + glove(gx, gy, 7.600);
  const sheet = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${newspaperArt()}</g>`;
  if (pose === 'cheer') {
    return arm('M64 126 Q38 120 44 92', 44, 86) + sheet(158, 78, 0.72, 14) + arm('M136 126 Q150 112 150 84', 150, 82);
  }
  if (pose === 'oops') {
    return `<g transform="translate(50 166) rotate(-10) scale(.62 .34)">${newspaperArt()}</g>` + arm('M64 128 Q44 118 60 90', 61, 86) + arm('M136 128 Q156 118 140 90', 139, 86);
  }
  if (pose === 'think') {
    return `<g transform="translate(46 166) rotate(-8) scale(.62 .34)">${newspaperArt()}</g>` + arm('M64 128 Q58 106 88 103', 90, 103) + arm('M136 128 Q150 142 138 156', 138, 156);
  }
  if (pose === 'sip') {
    return sheet(58, 144, 0.7, -12) + arm('M64 130 Q54 140 62 150', 62, 152) +
      `<g transform="translate(126 118) rotate(8) scale(.86)">${cupArt(cupId)}</g>` + arm('M136 128 Q150 118 132 112', 128, 112);
  }
  return sheet(100, 132, 1, -1.500) + arm('M66 126 Q50 134 58 146', 59, 148) + arm('M134 126 Q150 134 142 146', 141, 148);
}

function tableArt(cupId, showCup) {
  return `<path d="M6 172 A94 15 0 0 0 194 172 L194 180 A94 15 0 0 1 6 180Z" fill="${K.woodLight}" ${S(4.500)}/>` +
    `<path d="M86 192 L89 204 L111 204 L114 192Z" fill="${K.woodDark}" ${S(4)}/>` +
    `<ellipse cx="100" cy="172" rx="94" ry="15" fill="${K.paperLight}" ${S(4.500)}/><ellipse cx="100" cy="173" rx="76" ry="9" fill="none" stroke="${K.paperDark}" stroke-width="3"/>` +
    (showCup ? `<g transform="translate(152 176)">${cupArt(cupId)}</g>` : '');
}

/** The whole host. hat / cup are shop ids; default is what the player wears. */
function tortoiseArt(pose = 'idle', hat = 'tarboosh', cup = 'tea') {
  const p = TORTOISE_POSES.includes(pose) ? pose : 'idle';
  return shellArt() + vestArt() + headArt(p) + `<g transform="translate(100 50) scale(.84)">${hatArt(hat)}</g>` + tableArt(cup, p !== 'sip') + armsArt(p, cup);
}

/** Head and hat only, for avatars and the app icon. viewBox TORTOISE_HEAD_VB. */
const TORTOISE_HEAD_VB = '40 6 120 112';
function tortoiseHead(hat = 'tarboosh', pose = 'idle') {
  return shellArt() + headArt(pose) + `<g transform="translate(100 50) scale(.84)">${hatArt(hat)}</g>`;
}
