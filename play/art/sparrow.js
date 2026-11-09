/* Asfoura (عصفورة): the cheeky newspaper-delivery sparrow in a blue newsboy cap who brings hints to Haj Salhafa.
   sparrowArt(pose) is one 100 x 100 drawing; poses idle chirp fly0 fly1 note. */

const SPARROW_POSES = ['idle', 'chirp', 'fly0', 'fly1', 'note'];
const SPARROW_VB = '0 0 100 100';

function noteSlip(x, y, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-10" y="-12" width="20" height="24" rx="2.400" fill="${K.paperLight}" ${S(2.600)}/>` +
    `<path d="M-5 -6 H5 M-5 -1 H5 M-5 4 H2" stroke="${K.inkSoft}" stroke-width="1.800" stroke-linecap="round"/><circle cx="5" cy="6" r="2.600" fill="${K.brick}"/></g>`;
}

function sparrowArt(pose = 'idle') {
  const p = SPARROW_POSES.includes(pose) ? pose : 'idle';
  const flying = p === 'fly0' || p === 'fly1';
  const wingUp = p === 'fly0';
  const tail = `<path d="M62 78 L84 90 L76 96 L58 88Z" fill="${K.brownDark}" ${S(3.200)}/><path d="M66 82 L78 90" stroke="${K.brown}" stroke-width="2" stroke-linecap="round"/>`;
  const legs = flying ? `<path d="M44 82 Q42 90 38 92M56 82 Q58 90 62 92" fill="none" stroke="${K.mustardDark}" stroke-width="3" stroke-linecap="round"/>`
    : `<g fill="none" stroke="${K.ink}" stroke-width="3.200" stroke-linecap="round"><path d="M42 82 V93 M36 94 H48 M56 82 V93 M52 94 H64"/></g><g fill="none" stroke="${K.mustard}" stroke-width="1.400" stroke-linecap="round"><path d="M42 82 V93M56 82 V93"/></g>`;
  const body = `<ellipse cx="50" cy="56" rx="27" ry="28" fill="${K.brown}" ${S(4)}/><ellipse cx="50" cy="68" rx="18" ry="17" fill="${K.cream}"/>` +
    `<path d="M40 52 Q50 64 60 52 Q60 47 50 47Z" fill="${K.blue}" ${S(2.400)}/>` +
    `<ellipse cx="30" cy="52" rx="5.500" ry="4" fill="${K.pink}" opacity=".75"/><ellipse cx="70" cy="52" rx="5.500" ry="4" fill="${K.pink}" opacity=".75"/>` +
    `<path d="M28 60 Q30 76 42 80M72 60 Q70 76 58 80" fill="none" stroke="${K.brownDark}" stroke-width="2.400" stroke-linecap="round" opacity=".5"/>`;
  const open = p === 'chirp';
  const beak = open ? `<path d="M44 49 L56 49 L50 56Z" fill="${K.mustard}" ${S(2.600)}/><path d="M45 51 L55 51 L50 62Z" fill="#7a1a1a" ${S(2.600)}/>`
    : `<path d="M44 49 L56 49 L50 58Z" fill="${K.mustard}" ${S(2.600)}/>`;
  const eyes = p === 'note' ? pieEye(40, 43, 6.500, 7.500, 1, 1) + `<path d="M56 43 Q62 37 68 43" fill="none" ${S(3.200)}/>`
    : pieEye(40, 43, 6.500, 7.500, -1, 1) + pieEye(60, 43, 6.500, 7.500, -1, 1);
  const cap = `<path d="M26 36 Q26 14 50 14 Q74 14 74 36 Q50 30 26 36Z" fill="${K.blue}" ${S(3.800)}/>` +
    `<path d="M50 14 Q54 24 54 31" fill="none" stroke="${K.blueDark}" stroke-width="2.400"/><circle cx="50" cy="13" r="3.200" fill="${K.mustard}" ${S(2)}/>` +
    `<path d="M62 33 Q86 30 88 38 Q74 41 58 37Z" fill="${K.blueDark}" ${S(3.200)}/><path d="M32 22 Q38 17 46 17" fill="none" stroke="#fff" stroke-width="2.400" stroke-linecap="round" opacity=".4"/>`;
  let arms;
  if (flying) {
    arms = wingUp
      ? hose('M26 58 Q8 44 8 24', K.brown, 8) + glove(8, 20, 6.500) + hose('M74 58 Q92 44 92 24', K.brown, 8) + glove(92, 20, 6.500)
      : hose('M26 60 Q8 72 8 88', K.brown, 8) + glove(8, 90, 6.500) + hose('M74 60 Q92 72 92 88', K.brown, 8) + glove(92, 90, 6.500);
  } else if (p === 'chirp') {
    arms = hose('M26 62 Q14 70 18 82', K.brown, 8) + glove(19, 84, 6.500) + hose('M74 62 Q86 70 82 82', K.brown, 8) + glove(81, 84, 6.500);
  } else if (p === 'note') {
    arms = hose('M26 62 Q14 70 18 82', K.brown, 8) + glove(19, 84, 6.500) + hose('M74 60 Q90 56 88 36', K.brown, 8) + noteSlip(86, 22, 12) + glove(88, 36, 6.500);
  } else {
    arms = hose('M26 62 Q14 70 20 82', K.brown, 8) + glove(21, 84, 6.500) + hose('M74 62 Q86 70 80 82', K.brown, 8) + glove(79, 84, 6.500);
  }
  const notes = open ? `<g fill="${K.ink}"><path d="M84 14 V4 L92 2 V12" fill="none" stroke="${K.ink}" stroke-width="2.200"/><circle cx="82" cy="14" r="3"/><circle cx="90" cy="12" r="3"/></g>` : '';
  return tail + legs + body + eyes + beak + cap + arms + notes;
}
