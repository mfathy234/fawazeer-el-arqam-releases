/* «فزّورة اليوم» riddle of the day: Haj Salhafa reads a riddle and the answer's letters arrive scrambled; drag or tap them into the slots. The daily riddle is seeded by the date,
   the pack goes through all riddles in order. Points fall with time and with each letter the sparrow reveals (riddlePoints in wmeta.js, which also records the result). */
const RiddleMod = (() => {
  const m = { id: 'riddle', el: null };
  let R = null, board = null, host = null, timer = 0;
  const rs = () => UI.save.words.riddle;
  const dailyIdx = () => hashStr('fw:riddle:' + todayKey()) % RIDDLES.length;
  const elapsed = () => Math.floor((Date.now() - R.t0) / 1000);

  function start(mode, force) {
    const idx = force != null ? force : mode === 'daily' ? dailyIdx() : rs().next % RIDDLES.length, rd = RIDDLES[idx], letters = Array.from(rd.a);
    const items = letters.map((ch, i) => ({ id: i, label: ch }));
    R = { mode, idx, rd, letters, items, t0: Date.now(), reveals: 0, done: false, wrong: 0 };
  }
  m.help = () => wHelp('help', ['riddleHow1', 'riddleHow2', 'riddleHow3']);
  m.dirty = () => !!R && !R.done && (board ? board.place().some(p => p >= 0) : false);
  m.leaveName = () => (R.mode === 'daily' ? t('dailyTitle') : t('leaveRiddle'));
  m.stop = () => { clearInterval(timer); R = null; board = null; };
  m.open = () => { start('daily'); m.build(); };
  m.build = () => {
    const title = R.mode === 'daily' ? t('tabDaily') : t('riddleNo', nf(R.idx + 1), nf(RIDDLES.length));
    m.el.innerHTML = wBar('riddleName') + wTabs([['daily', t('tabDaily') + (wDone('riddle') ? ' ✓' : '')], ['pack', t('tabPack')]], R.mode) + `
      <div class="whostrow">${wHostHTML()}<div class="lvl"><b>${esc(title)}</b><span class="cnt rcnt"><bdi id="rTime"></bdi><bdi id="rPts"></bdi></span></div></div>
      <div class="rmain"><div class="wpaper" dir="rtl"><p class="rq">${esc(R.rd.q)}</p>${wIsEn() ? `<p class="re" dir="ltr">${esc(R.rd.e)}</p>` : ''}</div>
      <div class="wboard" id="rBoard"><div class="wslots rslots" dir="rtl"></div><div class="wtray rtray" dir="rtl"></div></div>
      <div class="rtools"><button class="tool wide" id="rHint">${wBird('idle')}<small>${t('rHint')}</small></button><button class="btn small" id="rShuf">${icon('shuffle')} ${t('rShuffle')}</button><button class="btn small" id="rClr">${t('rClear')}</button></div></div>`;
    host = wHost(m.el);
    board = SlotBoard($('#rBoard', m.el), { items: R.items, n: R.letters.length, onChange: onChange });
    const rnd = rngFor('fw:riddle:shuf:' + R.idx + R.mode);
    let tries = 0; do { board.shuffleTray(rnd); tries++; } while (tries < 10 && R.letters.length > 1 && board.order().map(id => R.items[id].label).join('') === R.letters.join(''));
    wWireTabs(m, R.mode, mode => { start(mode); m.build(); });
    $('#rShuf', m.el).onclick = () => { board.shuffleTray(); wSnd('flip'); };
    $('#rClr', m.el).onclick = () => { board.clearUnlocked(); wSnd('tap'); onChange(board.place()); };
    $('#rHint', m.el).onclick = () => hint();
    fit(); tick(); clearInterval(timer); timer = setInterval(tick, 1000);
    host.say(t('tapTiles'), 'think', 0);
  };
  function fit() {
    const n = R.letters.length, bw = $('#rBoard', m.el).getBoundingClientRect().width || 330;
    const ts = Math.max(30, Math.min(58, Math.floor((bw - 6 * (n - 1)) / n)));
    $('#rBoard', m.el).style.setProperty('--ts', ts + 'px');
  }
  addEventListener('resize', () => { if (m.el && m.el.classList.contains('show') && R) fit(); });
  function tick() {
    if (!R || !m.el || !$('#rTime', m.el)) return;
    const s = R.done ? R.finalSec : elapsed();
    $('#rTime', m.el).textContent = t('timeS', nf(s)); $('#rPts', m.el).textContent = nf(riddlePoints(s, R.reveals)) + ' ' + t('pts');
  }
  function guess(pl) { return pl.map(id => (id >= 0 ? R.items[id].label : '')).join(''); }
  function onChange(pl) {
    if (R.done || pl.some(p => p < 0)) return;
    if (wNorm(guess(pl)) === wNorm(R.rd.a)) { solved(); }
    else { R.wrong++; wSnd('bad'); const s = $('.rslots', m.el); wRestart(s); host.say(t('riddleWrong'), 'oops', 1800); }
  }
  function hint() {
    if (R.done) return; const pl = board.place(); const n = R.letters.length;
    if (R.reveals >= n - 1) { toast(t('rNoMore')); return; }
    const s = pl.findIndex((id, i) => !board.isLocked(i) && (id < 0 || wNorm(R.items[id].label) !== wNorm(R.letters[i])));
    if (s < 0) return;
    const want = wNorm(R.letters[s]); const cand = R.items.filter(it => wNorm(it.label) === want && !(pl.indexOf(it.id) >= 0 && board.isLocked(pl.indexOf(it.id))));
    if (!cand.length) return; const it = cand.find(c => pl.indexOf(c.id) < 0) || cand[0];
    R.reveals++; wSnd('hint'); host.say(line('hint'), 'think', 1800); board.setLocked(s, it.id); tick(); onChange(board.place());
  }
  function solved() {
    R.done = true; R.finalSec = elapsed(); clearInterval(timer);
    const mine = R, mode = R.mode, res = recordRiddle(UI.save, { mode, idx: R.idx, sec: R.finalSec, reveals: R.reveals }, wToday(), nowMs());
    const notes = wApply(res);
    host.say(line('cheer'), 'cheer', 2500); $$('.wslot', m.el).forEach((s, i) => { s.classList.add('pop'); s.style.animationDelay = i * 70 + 'ms'; });
    setTimeout(() => {
      if (R !== mine) return;
      wWinCard({
        title: t('riddleWin'), stars: res.stars, coins: res.coins, notes,
        body: `<p class="mini">${t('theAnswer')}</p><p class="wbigword" dir="rtl">${esc(mine.rd.a)}</p><p class="mini">${nf(res.pts)} ${t('pts')} · ${t('timeS', nf(mine.finalSec))}</p>${wIsEn() ? `<p class="mini">${esc(mine.rd.e)}</p>` : ''}`,
        next: mode === 'daily' ? t('tabPack') : t('next'), onNext: () => { start('pack'); m.build(); }
      });
    }, 700);
  }
  m.state = () => R; m.board = () => board; m.start = start;
  return m;
})();
wReg(RiddleMod);
