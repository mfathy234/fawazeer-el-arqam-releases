/* Drawing the puzzle: grid cells (given numbers, operator stamps, slots with tiles), the tray, the tool buttons and the top bar.
   The board object (board.js) is the truth; this file only turns it into DOM. Cell size follows the space the board gets. */

const TILE_STEP = 52;

function layoutBoard(force) {
  const B = UI.board;
  if (!B) return;
  const tr = $('#cwTray'), per = Math.max(1, Math.floor((tr.clientWidth + 6) / TILE_STEP)), rows = Math.max(1, Math.ceil(B.p.tray.length / per));
  tr.style.height = Math.min(rows, 3) * TILE_STEP + 'px';
  const b = $('#cwBoard'), bw = b.clientWidth - 14, bh = b.clientHeight - 14, P = B.p;
  const s = clampN(Math.min(Math.floor(bw / P.cols), Math.max(Math.floor(bh / P.rows), 34)), 24, 60);
  if (!force && s === UI.cell && UI.lw === bw) return;
  UI.cell = s; UI.lw = bw;
  const g = $('#cwGrid');
  g.style.width = P.cols * s + 'px'; g.style.height = P.rows * s + 'px';
  renderBoard();
}

const focusKey = e => (e.dataset.slot != null ? 's' + e.dataset.slot : e.dataset.tile != null ? 't' + e.dataset.tile : '');

function cellHtml(B, x, th, fx) {
  const s = UI.cell, es = B.ce[x.id];
  const bad = es.some(i => B.st[i] === 'b'), ok = !bad && es.some(i => B.st[i] === 'o');
  const pop = es.find(i => fx.pop.includes(i)), shk = es.find(i => fx.shake.includes(i));
  const cl = (bad ? ' bad' : ok ? ' ok' : '') + (pop != null ? ' pop' : '') + (shk != null ? ' shake' : '');
  const dl = pop != null ? `;--d:${B.p.eqs[pop].ids.indexOf(x.id) * 0.07}s` : '';
  const sty = `left:${x.c * s}px;top:${x.r * s}px;width:${s}px;height:${s}px${dl}`;
  if (x.k !== 'n') return `<div class="cell op${cl}" style="${sty}">${stampSvg(x.k === 'e' ? '=' : x.v)}</div>`;
  if (!isBlank(B, x.id)) return `<div class="cell giv${cl}" style="${sty}">${givenSvg(x.v)}</div>`;
  const tid = B.ct.get(x.id), tl = tid != null ? B.tiles[tid] : null, lk = B.lock.has(x.id);
  const label = tl ? t('tile') + ' ' + nf(tl.v) : t('slot');
  const inner = tl ? `<div class="tl${lk ? ' fixed' : ''}${B.sel === tid ? ' sel' : ''}${UI.landed === tid ? ' land' : ''}" ${lk ? '' : `data-tile="${tid}"`}>${tileSvg(th, tl.v)}</div>` : '';
  return `<div class="cell slot ${tl ? 'full' : 'blank'}${lk ? ' lock' : ''}${cl}" style="${sty}" ${lk ? '' : `data-slot="${x.id}" tabindex="0" role="button"`} aria-label="${label}">${inner}</div>`;
}

function renderBoard() {
  const B = UI.board;
  if (!B) return;
  const a = document.activeElement, fk = a && $('#cw').contains(a) ? focusKey(a) : '', th = currentTheme(), fx = UI.fx || { pop: [], shake: [] };
  $('#cwGrid').innerHTML = B.p.cells.map(x => cellHtml(B, x, th, fx)).join('');
  const ts = trayTiles(B);
  $('#cwTray').innerHTML = ts.length
    ? ts.map(x => `<button class="tile${B.sel === x.id ? ' sel' : ''}" data-tile="${x.id}" aria-label="${t('tile')} ${nf(x.v)}">${tileSvg(th, x.v)}</button>`).join('')
    : `<p class="empty">${t('empty')}</p>`;
  $('#cwUndo').disabled = !B.undo.length || B.won;
  $('#cwHint').disabled = B.won; $('#cwShuf').disabled = B.won;
  const cost = hintCost(B);
  $('#cwHb').textContent = cost ? nf(cost) : nf(STARS.freeHints - B.hints);
  $('#cwHb').classList.toggle('coin', cost > 0);
  hudUpdate();
  UI.fx = { pop: [], shake: [] }; UI.landed = -1;
  if (fk) { const n = fk[0] === 's' ? $(`#cwGrid [data-slot="${fk.slice(1)}"]`) : $(`#cwTray .tile[data-tile="${fk.slice(1)}"]`); (n || $('#cwTray .tile') || $('#cwHome')).focus({ preventScroll: true }); }
}

function hudUpdate() {
  const B = UI.board;
  if (!B) return;
  $('#cwCoins').textContent = nf(UI.save.coins);
  $('#cwProg').textContent = nf(solvedCount(B)) + '/' + nf(B.p.eqs.length);
  $('#cwTime').textContent = mmss(B.time);
}

function confetti() {
  const f = $('#cwFx'), cols = [K.brick, K.mustard, K.teal, K.blue, K.paperLight], n = Calm.on() ? 0 : 34;
  let h = '';
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, d = 90 + Math.random() * 190;
    h += `<i class="cf" style="background:${cols[i % 5]};--dx:${Math.cos(a) * d | 0}px;--dy:${Math.sin(a) * d * 0.8 - 40 | 0}px;--r:${Math.random() * 720 - 360 | 0}deg;animation-delay:${Math.random() * 0.15}s"></i>`;
  }
  f.innerHTML = h;
  setTimeout(() => { f.innerHTML = ''; }, 1700);
}
