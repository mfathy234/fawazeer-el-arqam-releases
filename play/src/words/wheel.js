/* «عجلة الحروف» letter-wheel crossword: swipe over the wheel's letters to spell the grid's words (right to left across, top to bottom down), bonus words pay a coin,
   the sparrow reveals a letter and a whole word can be bought. Levels follow the save (words.wheel.level); the daily puzzle is seeded by the date.
   The generator is wheelgen.js, the result rules are recordWheel() in wmeta.js. */
const WheelMod = (() => {
  const m = { id: 'wheel', el: null };
  let W = null, host = null, sel = [], tapMode = false, order = [], pos = [], justFilled = [], dragInfo = null;
  const frontier = () => UI.save.words.wheel.level;
  const wordKeyAt = w => Array.from({ length: w.k.length }, (_, i) => ({ r: w.r + (w.d ? i : 0), c: w.col + (w.d ? 0 : i) }));

  function newPuzzle(mode, level) {
    const seedKey = mode === 'daily' ? 'fw:wheel:daily:' + todayKey() : 'fw:wheel:L' + level;
    const cfg = WheelGen.cfgFor(mode === 'daily' ? 9 : level), P = WheelGen.gen(rngFor(seedKey), cfg);
    const cells = new Map();
    P.words.forEach(w => wordKeyAt(w).forEach((p, i) => { const kk = p.r + ',' + p.c; const cur = cells.get(kk); const canon = w.c[i]; if (!cur || (canon !== w.k[i] && cur.c === cur.k)) cells.set(kk, { k: w.k[i], c: canon }); }));
    W = { mode, level, P, cells, filled: new Set(), hinted: new Set(), found: new Set(), bonus: [], hints: 0, reveals: 0, wrong: 0, won: false, bonusCoins: 0 };
    order = shuffled(P.wheel.map((_, i) => i), rngFor(seedKey + ':wheel')); pos = order.map(i => P.wheel[i]); sel = []; tapMode = false;
  }
  m.help = () => wHelp('help', ['wheelHow1', 'wheelHow2', 'wheelHow3']);
  m.dirty = () => !!W && !W.won && (W.found.size > 0 || W.filled.size > 0 || W.bonus.length > 0);
  m.leaveName = () => (W.mode === 'daily' ? t('dailyTitle') : t('leaveWheel', nf(W.level)));
  m.stop = () => { W = null; sel = []; };
  m.open = () => {
    if (!W || W.won) newPuzzle('level', frontier());
    m.build();
  };
  m.build = () => {
    if (!m.el) return;
    const title = W.mode === 'daily' ? t('dailyTitle') : t('level', nf(W.level));
    m.el.innerHTML = wBar('wheelName') + wTabs([['level', t('tabLevels')], ['daily', t('tabDaily') + (wDone('wheel') ? ' ✓' : '')]], W.mode) + `
      <div class="whostrow">${wHostHTML()}<div class="lvl"><b>${esc(title)}</b><span class="cnt">${t('wordsFound', nf(W.found.size), nf(W.P.words.length))}</span></div></div>
      <div class="found" id="wFound" dir="rtl" aria-label="${t('gridWords')}"></div>
      <div class="gridwrap"><div class="wgrid" id="wGrid" dir="rtl"></div></div>
      <div class="prevrow"><button class="round" id="wBk" aria-label="${t('wUndo')}">${icon('bksp')}</button><div class="prev" id="wPrev" dir="rtl" aria-live="polite"></div><button class="round ok" id="wOk" aria-label="${t('submit')}">${icon('ok')}</button></div>
      <div class="wheelrow"><button class="tool" id="wHint" aria-label="${t('hintBtn')}">${wBird('idle')}<small id="wHintL"></small></button>
        <div class="wheel" id="wWheel" dir="ltr"><svg class="wline" id="wLine"></svg><div id="wLetters"></div><button class="shuf" id="wShuf" aria-label="${t('shuffle')}">${icon('shuffle')}</button></div>
        <button class="tool" id="wRev" aria-label="${t('revealBtn')}">${icon('eye')}<small>${t('revealBtn')} · ${nf(WORDS.wheel.revealCost)}</small></button></div>`;
    host = wHost(m.el);
    wire(); drawGrid(); drawFound(); drawWheel(); drawPrev(); fit();
    host.say(W.won ? '' : t('swipeHint'), 'idle', 0);
  };

  function wire() {
    wWireTabs(m, W.mode, mode => {
      newPuzzle(mode, frontier()); m.build();
      if (mode === 'daily' && wDone('wheel')) toast(t('dailyDoneToast'));
    });
    $('#wShuf', m.el).onclick = () => { order = shuffled(order); pos = order.map(i => W.P.wheel[i]); sel = []; tapMode = false; drawWheel(); drawPrev(); wSnd('flip'); };
    $('#wBk', m.el).onclick = () => { sel.pop(); if (!sel.length) tapMode = false; drawWheel(); drawPrev(); wSnd('tap'); };
    $('#wOk', m.el).onclick = () => submit();
    $('#wHint', m.el).onclick = () => useHint();
    $('#wRev', m.el).onclick = () => useReveal();
    const wh = $('#wWheel', m.el);
    wh.addEventListener('pointerdown', onDown); wh.addEventListener('pointermove', onMove); wh.addEventListener('pointerup', onUp); wh.addEventListener('pointercancel', onCancel);
    $('#wLetters', m.el).addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b && e.detail === 0) { const p = +b.dataset.p; if (sel.includes(p)) { if (sel[sel.length - 1] === p) sel.pop(); } else sel.push(p); tapMode = sel.length > 0; drawWheel(); drawPrev(); } });
  }

  /* sizing */
  function fit() {
    const gw = $('.gridwrap', m.el), g = $('#wGrid', m.el); if (!gw || !W) return;
    const rect = gw.getBoundingClientRect(), gap = 3;
    const cs = Math.max(18, Math.min(54, Math.floor((rect.width - 4 - gap * (W.P.cols - 1)) / W.P.cols), Math.floor((rect.height - 4 - gap * (W.P.rows - 1)) / W.P.rows)));
    g.style.setProperty('--cs', cs + 'px');
    const game = $('#game').getBoundingClientRect(), wr = $('.wheelrow', m.el).getBoundingClientRect();
    const ws = Math.max(150, Math.min(236, Math.floor(wr.width - 2 * 76), Math.floor(game.height * 0.31)));
    const wh = $('#wWheel', m.el); wh.style.setProperty('--ws', ws + 'px');
  }
  new ResizeObserver(() => { if (m.el && m.el.classList.contains('show')) fit(); }).observe(document.body);
  addEventListener('resize', () => { if (m.el && m.el.classList.contains('show')) fit(); });

  /* drawing */
  function drawGrid() {
    const g = $('#wGrid', m.el), P = W.P; let html = '';
    g.style.gridTemplateColumns = `repeat(${P.cols}, var(--cs))`; g.style.gridAutoRows = 'var(--cs)';
    let n = 0;
    for (let r = 0; r < P.rows; r++) for (let c = 0; c < P.cols; c++) {
      const cell = W.cells.get(r + ',' + c);
      if (!cell) { html += '<div class="wx"></div>'; continue; }
      const f = W.filled.has(r + ',' + c), pop = justFilled.includes(r + ',' + c);
      html += `<div class="wc${f ? ' f' : ''}${W.hinted.has(r + ',' + c) ? ' h' : ''}${pop ? ' pop' : ''}" style="${pop ? `animation-delay:${(n++) * 70}ms` : ''}" data-rc="${r},${c}">${f ? esc(cell.c) : ''}</div>`;
    }
    g.innerHTML = html; justFilled = [];
  }
  function drawFound() {
    const f = $('#wFound', m.el), gw = W.P.words.filter(w => W.found.has(w.k)).map(w => `<span class="fw">${esc(w.c)}</span>`);
    const bw = W.bonus.map(b => `<span class="fw bonus">${esc(b)}</span>`);
    f.innerHTML = gw.concat(bw).join('') || `<span class="none">${t('gridWords')}: ${nf(0)}/${nf(W.P.words.length)}</span>`;
    $('.cnt', m.el).textContent = t('wordsFound', nf(W.found.size), nf(W.P.words.length));
    f.scrollLeft = 0;
  }
  function drawWheel() {
    const n = pos.length, L = $('#wLetters', m.el);
    L.innerHTML = pos.map((p, i) => {
      const a = (-90 + i * 360 / n) * Math.PI / 180, x = 50 + 37 * Math.cos(a), y = 50 + 37 * Math.sin(a);
      return `<button type="button" class="wl${sel.includes(i) ? ' on' : ''}" data-p="${i}" style="left:${x}%;top:${y}%" aria-label="${esc(p.d)}" aria-pressed="${sel.includes(i)}">${esc(p.d)}</button>`;
    }).join('');
    drawLine(null);
    const free = Math.max(0, WORDS.wheel.freeHints - W.hints); $('#wHintL', m.el).textContent = free > 0 ? `${t('hintBtn')} · ${nf(free)} ${t('wFree')}` : `${t('hintBtn')} · ${nf(WORDS.wheel.hintCost)}`;
  }
  function centers() { const wr = $('#wWheel', m.el).getBoundingClientRect(), n = pos.length; return { wr, pts: pos.map((_, i) => { const a = (-90 + i * 360 / n) * Math.PI / 180; return { x: wr.width * (0.5 + 0.37 * Math.cos(a)), y: wr.height * (0.5 + 0.37 * Math.sin(a)) }; }) }; }
  function drawLine(cur) {
    const svg = $('#wLine', m.el); if (!svg) return; const { wr, pts } = centers();
    svg.setAttribute('viewBox', `0 0 ${wr.width} ${wr.height}`);
    const path = sel.map(p => pts[p]); if (cur && sel.length) path.push(cur);
    svg.innerHTML = path.length > 1 ? `<polyline points="${path.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ')}" fill="none" stroke="${K.ink}" stroke-width="${wr.width * 0.075}" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/><polyline points="${path.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ')}" fill="none" stroke="${K.mustard}" stroke-width="${wr.width * 0.045}" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  }
  const joined = arr => arr.map((i, j) => { const p = pos[i]; return p.k === 'ه' ? (j === arr.length - 1 && p.d === 'ة' ? 'ة' : 'ه') : p.d; }).join('');
  function drawPrev() {
    const p = $('#wPrev', m.el);
    p.innerHTML = sel.length ? `<span class="pw">${esc(joined(sel))}</span>` : `<span class="ph">${t('swipeHint')}</span>`;
    $('#wBk', m.el).disabled = !sel.length; $('#wOk', m.el).disabled = !sel.length;
  }

  /* swipe input */
  function hit(e) {
    const { wr, pts } = centers(), x = e.clientX - wr.left, y = e.clientY - wr.top, rad = wr.width * 0.1;
    let best = -1, bd = 1e9; pts.forEach((p, i) => { const d = Math.hypot(p.x - x, p.y - y); if (d < rad * 1.15 && d < bd) { bd = d; best = i; } });
    return { i: best, x, y };
  }
  function onDown(e) {
    if (e.target.closest('.shuf') || W.won) return;
    const h = hit(e); if (h.i < 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfo = { pid: e.pointerId, dragged: false, startLen: sel.length };
    if (!sel.includes(h.i)) { sel.push(h.i); wSnd('tap'); }
    else if (sel[sel.length - 1] === h.i && tapMode) { sel.pop(); dragInfo.removed = true; }
    drawWheel(); drawPrev(); drawLine({ x: h.x, y: h.y });
  }
  function onMove(e) {
    if (!dragInfo || e.pointerId !== dragInfo.pid) return;
    const h = hit(e);
    if (h.i >= 0) {
      if (sel.length >= 2 && sel[sel.length - 2] === h.i) { sel.pop(); dragInfo.dragged = true; wSnd('tap'); drawWheel(); drawPrev(); }
      else if (!sel.includes(h.i)) { sel.push(h.i); dragInfo.dragged = true; wSnd('tap'); drawWheel(); drawPrev(); }
    }
    drawLine({ x: h.x, y: h.y });
  }
  function onUp(e) {
    if (!dragInfo || e.pointerId !== dragInfo.pid) return;
    const d = dragInfo; dragInfo = null;
    if (d.dragged) { tapMode = false; submit(); } else { tapMode = sel.length > 0; drawLine(null); }
  }
  function onCancel() { dragInfo = null; drawLine(null); }

  /* game rules */
  function say(kind, pose) { host.say(line(kind), pose, 2000); }
  function shake() { const p = $('#wPrev', m.el); p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); }
  function submit() {
    if (W.won || !sel.length) return;
    const k = sel.map(i => pos[i].k).join(''), shown = joined(sel);
    sel = []; tapMode = false;
    const flash = (cls, txt) => { const p = $('#wPrev', m.el); drawWheel(); p.innerHTML = `<span class="pw ${cls}">${esc(txt)}</span>`; setTimeout(() => { if (!sel.length) drawPrev(); }, 700); };
    if (k.length < WORDS.wheel.minWord) { wSnd('bad'); drawWheel(); flash('', shown); shake(); say('short', 'think'); return; }
    const gw = W.P.words.find(w => w.k === k);
    if (gw && W.found.has(k)) { flash('', shown); say('again', 'think'); wSnd('tap'); return; }
    if (W.bonus.some(b => wNorm(b) === k)) { flash('', shown); say('again', 'think'); wSnd('tap'); return; }
    if (gw) {
      fillWord(gw); W.found.add(k); flash('good', gw.c); wSnd('good'); say('cheer', 'cheer'); afterChange(); return;
    }
    if (Dict.has(k)) {
      const c = Dict.canon(k); W.bonus.push(c); setSave(addCoins(UI.save, WORDS.wheel.bonusCoin)); flash('bonus', c); wSnd('bonus'); host.say(t('bonusMsg'), 'cheer', 1800); drawFound(); return;
    }
    W.wrong++; wSnd('bad'); flash('badw', shown); shake(); say('bad', 'oops');
  }
  function fillWord(w) { wordKeyAt(w).forEach(p => { const kk = p.r + ',' + p.c; if (!W.filled.has(kk)) { W.filled.add(kk); justFilled.push(kk); } }); }
  function afterChange() {
    W.P.words.forEach(w => { if (!W.found.has(w.k) && wordKeyAt(w).every(p => W.filled.has(p.r + ',' + p.c))) W.found.add(w.k); });
    drawGrid(); drawFound();
    if (W.P.words.every(w => W.found.has(w.k))) win();
  }
  async function useHint() {
    if (W.won) return;
    if (W.hints >= WORDS.wheel.freeHints && !(await wPay(WORDS.wheel.hintCost, 'hintPayT', 'hintPayB', 'hintPayOk'))) return;
    const open = W.P.words.filter(w => !W.found.has(w.k)); if (!open.length) return;
    const w = pickOf(open), cells = wordKeyAt(w).filter(p => !W.filled.has(p.r + ',' + p.c)); if (!cells.length) return;
    const p = pickOf(cells), kk = p.r + ',' + p.c, mine = W; W.hints++;
    wFlyBird($('#wHint .wsp', m.el), $(`[data-rc="${kk}"]`, m.el), () => {
      if (W !== mine) return;
      W.filled.add(kk); W.hinted.add(kk); justFilled.push(kk); wSnd('hint'); say('hint', 'think'); afterChange(); drawWheel();
    });
  }
  async function useReveal() {
    if (W.won || !(await wPay(WORDS.wheel.revealCost, 'revT', 'revB', 'revOk'))) return;
    const open = W.P.words.filter(w => !W.found.has(w.k)); if (!open.length) return;
    const w = pickOf(open); W.reveals++; fillWord(w); W.found.add(w.k); wSnd('hint'); say('hint', 'think'); afterChange();
  }
  function win() {
    W.won = true;
    const mine = W, mode = W.mode, res = recordWheel(UI.save, { mode, level: W.level, words: W.P.words.length, hints: W.hints, reveals: W.reveals, wrong: W.wrong, bonus: W.bonus.length }, wToday(), nowMs());
    const notes = wApply(res);
    drawGrid(); host.say(t('winWheel'), 'cheer', 3000);
    const words = W.P.words.map(w => `<span class="fw">${esc(w.c)}</span>`).join(''), bonus = W.bonus.map(b => `<span class="fw bonus">${esc(b)}</span>`).join('');
    setTimeout(() => {
      if (W !== mine) return;
      wWinCard({
        title: t('winWheel'), stars: res.stars, coins: res.coins, notes, next: mode === 'daily' ? t('toMenu') : t('next'),
        body: `<div class="wlist" dir="rtl">${words}</div>${bonus ? `<p class="mini">${t('bonusWords')}</p><div class="wlist" dir="rtl">${bonus}</div>` : ''}`,
        onNext: () => { if (mode === 'daily') wHome(); else { newPuzzle('level', frontier()); m.build(); } }
      });
    }, 650);
  }

  document.addEventListener('keydown', e => {
    if (UI.state !== 'wWheel' || !W || W.won || wModalOpen() || $('#confirm').classList.contains('show') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') { if (!sel.length) return; e.preventDefault(); submit(); }
    else if (e.key === 'Backspace') { e.preventDefault(); sel.pop(); if (!sel.length) tapMode = false; drawWheel(); drawPrev(); }
    else if (e.key === 'Escape') { sel = []; tapMode = false; drawWheel(); drawPrev(); }
    else if (e.key.length === 1 && /[ء-ي]/.test(e.key)) {
      const k = wNorm(e.key), i = pos.findIndex((p, idx) => p.k === k && !sel.includes(idx));
      if (i >= 0) { sel.push(i); tapMode = true; wSnd('tap'); drawWheel(); drawPrev(); e.preventDefault(); } else { wSnd('bad'); }
    }
  });
  m.state = () => W; m.wheelPos = () => pos; m.newPuzzle = newPuzzle; m.select = i => { sel.push(i); };
  return m;
})();
wReg(WheelMod);
