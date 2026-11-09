/* spriteCatalogue(): the one list of every sprite (key, viewBox, size, svg fragment). The game (data URIs for <img data-sprite>) and the exporter both read it. */

function spriteCatalogue() {
  const out = [];
  const add = (key, vb, w, h, svg) => out.push({ key, vb, w, h, svg });
  TORTOISE_POSES.forEach(p => add('tortoise:' + p, TORTOISE_VB, 200, 205, tortoiseArt(p)));
  add('tortoise:head', TORTOISE_HEAD_VB, 120, 112, tortoiseHead());
  SPARROW_POSES.forEach(p => add('bird:' + p, SPARROW_VB, 100, 100, sparrowArt(p)));
  HATS.forEach(h => add('hat:' + h.id, '-44 -56 88 70', 88, 70, hatArt(h.id)));
  CUPS.forEach(c => add('cup:' + c.id, '-30 -66 60 76', 60, 76, cupArt(c.id)));
  THEMES.forEach(t => add('tile:' + t.id, '0 0 100 100', 100, 100, tileSvg(t, 12).replace(/^<svg[^>]*>|<\/svg>$/g, '')));
  add('given:12', '0 0 100 100', 100, 100, givenSvg(12).replace(/^<svg[^>]*>|<\/svg>$/g, ''));
  ['+', '−', '×', '÷', '='].forEach((o, i) => add('stamp:' + ['plus', 'minus', 'times', 'div', 'eq'][i], '0 0 100 100', 100, 100, stampSvg(o).replace(/^<svg[^>]*>|<\/svg>$/g, '')));
  add('slot', '0 0 100 100', 100, 100, slotSvg().replace(/^<svg[^>]*>|<\/svg>$/g, ''));
  Object.keys(ICON_ART).forEach(n => add('icon:' + n, '0 0 24 24', 24, 24, ICON_ART[n]));
  BOOKLETS.forEach((b, i) => add('cover:' + b.id, '0 0 100 130', 100, 130, coverArt(b, i + 1)));
  add('bg:cafe', '0 0 360 640', 360, 640, bgCafe());
  add('logo:masthead', '0 0 480 190', 480, 190, mastheadArt());
  return out;
}

const spriteSvgDoc = s => svgDoc(s.vb, s.svg, `width="${s.w}" height="${s.h}"`);
