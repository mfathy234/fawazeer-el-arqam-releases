/* «عمود الأمثال» proverb column: a well-known Egyptian proverb arrives as scrambled word tiles; drag or tap them into the column in order. Shorter proverbs come first.
   A wrong full row lights the words already in place; the sparrow can lock one word and explains the meaning at the end. Result rules: recordProverb() in wmeta.js. */
const PROVERB_LIST = PROVERBS.map((p, i) => ({ ...p, i, words: p.p.split(' ') })).sort((a, b) => a.words.length - b.words.length || a.i - b.i);
const ProverbMod = (() => {
  const m = { id: 'proverb', el: null };
  let Pv = null, board = null, host = null;
  const ps = () => UI.save.words.proverb;

  function start(level) {
    const idx = ((level % PROVERB_LIST.length) + PROVERB_LIST.length) % PROVERB_LIST.length, pv = PROVERB_LIST[idx];
    Pv = { idx, pv, items: pv.words.map((w, i) => ({ id: i, label: w })), hints: 0, wrong: 0, done: false };
  }
  m.help = () => wHelp('help', ['proverbHow1', 'proverbHow2', 'proverbHow3']);
  m.dirty = () => !!Pv && !Pv.done && (board ? board.place().some(p => p >= 0) : false);
  m.leaveName = () => t('leaveProverb');
  m.stop = () => { Pv = null; board = null; };
  m.open = () => { start(ps().level); m.build(); };
  m.build = () => {
    const n = Pv.items.length;
    m.el.innerHTML = wBar('proverbName') + `<div class="whostrow">${wHostHTML()}<div class="lvl"><b>${t('pLevel', nf(Pv.idx + 1), nf(PROVERB_LIST.length))}</b><span class="cnt">${t('wordsFound', nf(0), nf(n))}</span></div></div>
      <div class="column" id="pBoard"><div class="colhead"><span>${t('columnTitle')}</span></div><div class="colbody"><div class="wslots pslots" dir="rtl"></div><div class="wtray ptray" dir="rtl"></div></div></div>
      <div class="rtools"><button class="tool wide" id="pHint">${wBird('idle')}<small id="pHintL"></small></button><button class="btn small" id="pShuf">${icon('shuffle')} ${t('pShuffle')}</button></div>`;
    host = wHost(m.el);
    const maxLen = Math.max(...Pv.items.map(i => i.label.length)), sw = Math.max(54, Math.min(124, maxLen * 12 + 28));
    $('#pBoard', m.el).style.setProperty('--sw', sw + 'px');
    board = SlotBoard($('#pBoard', m.el), { items: Pv.items, n, onChange, numbers: true });
    const rnd = rngFor('fw:proverb:' + Pv.idx); let tries = 0;
    do { board.shuffleTray(rnd); tries++; } while (tries < 10 && n > 1 && board.order().map(id => Pv.items[id].label).join(' ') === Pv.pv.p);
    $('#pShuf', m.el).onclick = () => { board.shuffleTray(); wSnd('flip'); };
    $('#pHint', m.el).onclick = () => hint();
    hintLabel(); host.say(t('pTap'), 'idle', 0);
  };
  function hintLabel() { const free = Math.max(0, WORDS.proverb.freeHints - Pv.hints); $('#pHintL', m.el).textContent = free > 0 ? `${t('pHint')} · ${nf(free)} ${t('wFree')}` : `${t('pHint')} · ${nf(WORDS.proverb.hintCost)}`; }
  function onChange(pl) {
    const ok = pl.filter((id, s) => id >= 0 && Pv.items[id].label === Pv.pv.words[s]).length;
    $('.cnt', m.el).textContent = t('wordsFound', nf(ok), nf(pl.length));
    if (pl.some(p => p < 0) || Pv.done) return;
    if (ok === pl.length) { solved(); return; }
    Pv.wrong++; wSnd('bad'); host.say(t('pWrong'), 'oops', 2200);
    $$('.wslot', m.el).forEach((s, i) => s.classList.add(Pv.items[pl[i]].label === Pv.pv.words[i] ? 'rt' : 'wr'));
    wRestart($('.pslots', m.el));
  }
  async function hint() {
    if (Pv.done) return;
    if (Pv.hints >= WORDS.proverb.freeHints && !(await wPay(WORDS.proverb.hintCost, 'pHintT', 'pHintB', 'pHintOk'))) return;
    const pl = board.place(), words = Pv.pv.words;
    const s = pl.findIndex((id, i) => !board.isLocked(i) && (id < 0 || Pv.items[id].label !== words[i])); if (s < 0) return;
    const cand = Pv.items.filter(it => it.label === words[s] && !(pl.indexOf(it.id) >= 0 && board.isLocked(pl.indexOf(it.id))));
    if (!cand.length) return; const it = cand.find(c => pl.indexOf(c.id) < 0) || cand[0];
    Pv.hints++; hintLabel(); wSnd('hint'); host.say(line('hint'), 'think', 1800); board.setLocked(s, it.id); onChange(board.place());
  }
  function solved() {
    Pv.done = true;
    const mine = Pv, pv = Pv.pv, res = recordProverb(UI.save, { idx: pv.i, pos: Pv.idx, count: Pv.items.length, hints: Pv.hints, wrong: Pv.wrong }, nowMs());
    const notes = wApply(res);
    host.say(line('cheer'), 'cheer', 2500); $$('.wslot', m.el).forEach((s, i) => { s.classList.remove('rt', 'wr'); s.classList.add('pop'); s.style.animationDelay = i * 60 + 'ms'; });
    setTimeout(() => {
      if (Pv !== mine) return;
      wWinCard({
        title: t('pWin'), stars: res.stars, coins: res.coins, notes,
        body: `<p class="wproverb" dir="rtl">${esc(pv.p)}</p><div class="wsparrow-note"><span class="wsp big">${birdSvg('note')}</span><div><p class="mini">${t('pMeans')}</p><p class="wmean" dir="rtl">${esc(pv.m)}</p><p class="wmean en" dir="ltr">${esc(pv.e)}</p></div></div>`,
        onNext: () => { start(ps().level); m.build(); if (ps().level >= PROVERB_LIST.length) toast(t('pDone')); }
      });
    }, 650);
  }
  m.state = () => Pv; m.board = () => board; m.start = start; m.list = PROVERB_LIST;
  return m;
})();
wReg(ProverbMod);
