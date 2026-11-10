/* «كلمة السر» Arabic Wordle: guess a five-letter word in six tries with the on-screen Arabic keyboard (or the device's). The daily word is seeded by the date and kept in the save
   (so a half-played daily survives a restart); practice words are random. Scoring is wordle-rules.js, the results and the streak are recordWordle() in wmeta.js. */
const WordleMod = (() => {
  const m = { id: 'wordle', el: null };
  let Wd = null, host = null, busy = false;
  const ws = () => UI.save.words.wordle;
  const dailyAns = () => Dict.ans5[hashStr('fw:wordle:' + todayKey()) % Dict.ans5.length];

  function start(mode) {
    if (mode === 'daily') {
      const d = ws(), same = d.date === wToday();
      Wd = { mode, ans: dailyAns(), guesses: same ? d.guesses.slice() : [], cur: '', done: same && d.done, won: same && d.won };
    } else {
      const cand = Dict.ans5.filter(a => !(Wd && Wd.ans && Wd.ans.k === a.k));
      Wd = { mode, ans: pickOf(cand), guesses: [], cur: '', done: false, won: false };
    }
  }
  const keyStatesNow = () => keyStates(Wd.guesses, Wd.ans.k);
  m.help = () => wHelp('help', ['wordleHow1', 'wordleHow2', 'wordleHow3']);
  m.dirty = () => !!Wd && !Wd.done && Wd.mode === 'practice' && Wd.guesses.length > 0;
  m.leaveName = () => t('leaveWordle');
  m.stop = () => { Wd = null; busy = false; };
  m.open = () => { start('daily'); m.build(); if (Wd.done) setTimeout(() => host.say(t('wDoneToday'), 'think', 3000), 200); };
  m.build = () => {
    m.el.innerHTML = wBar('wordleName') + wTabs([['daily', t('tabDaily') + (wDone('wordle') ? ' ✓' : '')], ['practice', t('tabPractice')]], Wd.mode) + `
      <div class="whostrow">${wHostHTML()}<div class="lvl"><b id="wdTitle"></b><span class="cnt legend"><span><i class="lg g"></i> ${t('wCorrect')}</span><span><i class="lg y"></i> ${t('wPresent')}</span></span></div></div>
      <div class="gridwrap"><div class="wdboard" id="wdBoard" dir="rtl"></div></div>
      <div class="prev slim" id="wdPrev" dir="rtl" aria-live="polite"></div>
      <div id="wdBottom"></div>`;
    host = wHost(m.el);
    wWireTabs(m, Wd.mode, mode => { start(mode); m.build(); });
    draw(); fit();
    if (!Wd.done) host.say(t('wordleSub'), 'idle', 0); else host.say(Wd.won ? t('wWin') : `${t('wLose')} ${Wd.ans.c}`, Wd.won ? 'cheer' : 'oops', 0);
  };
  function fit() {
    const gw = $('.gridwrap', m.el), r = gw.getBoundingClientRect(), gap = 5;
    const cs = Math.max(26, Math.min(50, Math.floor((r.width - 4 * gap) / 5), Math.floor((r.height - 5 * gap) / 6)));
    $('#wdBoard', m.el).style.setProperty('--cs', cs + 'px');
  }
  addEventListener('resize', () => { if (m.el && m.el.classList.contains('show') && Wd) fit(); });
  function draw(flipRow = -1) {
    $('#wdTitle', m.el).textContent = Wd.mode === 'daily' ? t('dailyTitle') : t('tabPractice');
    let rows = '';
    for (let r = 0; r < WORDS.wordle.tries; r++) {
      const g = Wd.guesses[r], isCur = r === Wd.guesses.length && !Wd.done, sc = g ? scoreGuess(g, Wd.ans.k) : null;
      let cells = '';
      for (let i = 0; i < 5; i++) {
        const ch = g ? g[i] : isCur ? (Wd.cur[i] || '') : '';
        cells += `<div class="wt ${sc ? sc[i] : ''}${!g && ch ? ' typed' : ''}" ${r === flipRow ? `style="animation-delay:${i * 130}ms" data-flip` : ''}>${esc(ch)}</div>`;
      }
      rows += `<div class="wrow" data-row="${r}" role="row">${cells}</div>`;
    }
    $('#wdBoard', m.el).innerHTML = rows;
    $$('.wt[data-flip]', m.el).forEach(e => e.classList.add('flip'));
    const last = Wd.guesses[Wd.guesses.length - 1];
    $('#wdPrev', m.el).innerHTML = Wd.cur ? `<span class="pw">${esc(Wd.cur)}</span>` : last ? `<span class="pw dim">${esc(last)}</span>` : `<span class="ph">${t('wordleSub')}</span>`;
    drawBottom();
  }
  function drawBottom() {
    const b = $('#wdBottom', m.el);
    if (Wd.done) {
      b.innerHTML = `<div class="rtools"><button class="btn small mustard" id="wdShare">${icon('copy')} ${t('wShare')}</button><button class="btn small" id="wdNew">${t('wNew')}</button></div>`;
      $('#wdShare', m.el).onclick = () => showResult();
      $('#wdNew', m.el).onclick = () => { start('practice'); m.build(); };
      return;
    }
    const ks = keyStatesNow();
    b.innerHTML = `<div class="kbd" dir="rtl">${WORDLE_ROWS.map((row, ri) => `<div class="krow">${ri === 2 ? `<button class="key wide" data-k="enter" aria-label="${t('wEnter')}">${icon('ok')}</button>` : ''}${row.map(ch => `<button class="key ${ks[ch] || ''}" data-k="${ch}">${ch}</button>`).join('')}${ri === 2 ? `<button class="key wide" data-k="del" aria-label="${t('wDel')}">${icon('bksp')}</button>` : ''}</div>`).join('')}</div>`;
    $$('.key', b).forEach(k => { k.onclick = () => press(k.dataset.k); });
  }
  function press(k) {
    if (!Wd || Wd.done || busy) return;
    if (k === 'enter') return submit();
    if (k === 'del') { Wd.cur = Wd.cur.slice(0, -1); wSnd('tap'); draw(); return; }
    if (Wd.cur.length < 5) { Wd.cur += k; wSnd('pick'); draw(); }
  }
  function shakeRow() { const r = $(`[data-row="${Wd.guesses.length}"]`, m.el); if (r) { r.classList.remove('shake'); void r.offsetWidth; r.classList.add('shake'); } }
  function submit() {
    const g = Wd.cur;
    if (g.length < 5) { shakeRow(); wSnd('bad'); host.say(t('wShort'), 'think', 1800); return; }
    if (!Dict.guess5.has(g)) { shakeRow(); wSnd('bad'); host.say(t('wNot'), 'oops', 1800); return; }
    Wd.guesses.push(g); Wd.cur = '';
    const won = g === Wd.ans.k, over = won || Wd.guesses.length >= WORDS.wordle.tries;
    draw(Wd.guesses.length - 1); wSnd('flip');
    if (Calm.on()) { /* instant */ }
    busy = true;
    setTimeout(() => {
      busy = false;
      if (over) finish(won); else { persist(); host.say(line('think'), 'think', 1500); }
    }, Calm.on() ? 0 : 750);
  }
  function persist() { if (Wd.mode === 'daily') setSave(wordleStore(UI.save, { date: wToday(), guesses: Wd.guesses, done: Wd.done, won: Wd.won })); }
  function finish(won) {
    Wd.done = true; Wd.won = won; persist();
    const res = recordWordle(UI.save, { mode: Wd.mode, tries: Wd.guesses.length, won }, wToday(), nowMs());
    Wd.notes = wApply(res); Wd.reward = { stars: res.stars, coins: res.coins };
    drawBottom();
    host.say(won ? line('cheer') : `${t('wLose')} ${Wd.ans.c}`, won ? 'cheer' : 'oops', 4000);
    wSnd(won ? 'win' : 'bad');
    const mine = Wd;
    setTimeout(() => { if (Wd === mine) showResult(); }, 700);
  }
  function shareText() {
    const rows = Wd.guesses.map(g => scoreGuess(g, Wd.ans.k).map(s => (s === 'g' ? '🟩' : s === 'y' ? '🟨' : '⬛')).reverse().join('')).join('\n');
    return `${t('wShareHead')}\n‎${Wd.mode === 'daily' ? wToday() : t('tabPractice')} · ${Wd.won ? Wd.guesses.length : 'X'}/${WORDS.wordle.tries}\n\n${rows}`;
  }
  function showResult() {
    const rw = Wd.reward || { stars: Wd.won ? 1 : 0, coins: 0 }, text = shareText();
    if (Wd.won) confetti('#wFx');
    const mm = wModal(`<h3 class="${Wd.won ? 'win' : ''}">${Wd.won ? t('wWin') : t('wLose')}</h3>
      <p class="wbigword" dir="rtl">${esc(Wd.ans.c)}</p>${Wd.won ? `<div class="wstars">${wStarsRow(rw.stars)}</div>` : ''}${rw.coins ? `<p class="wreward">+${nf(rw.coins)} ${icon('coin')}</p>` : ''}
      <pre class="emo" dir="ltr">${esc(text)}</pre><div id="wdFb"></div><div class="notes">${Wd.notes || ''}</div>
      <button class="btn mustard" type="button" data-focus id="wdCopy">${icon('copy')} ${t('wShare')}</button><div class="row"><button class="btn small" type="button" data-menu>${t('toMenu')}</button><button class="btn small" type="button" id="wdPr">${t('wNew')}</button></div>`, 'wwin');
    $('[data-menu]', mm.el).onclick = () => { mm.close(); wHome(); };
    $('#wdPr', mm.el).onclick = () => { mm.close(); start('practice'); m.build(); };
    $('#wdCopy', mm.el).onclick = () => {
      const fb = () => { const box = $('#wdFb', mm.el); box.innerHTML = `<p class="mini">${t('wSelect')}</p><textarea class="wsel" readonly rows="6" dir="ltr"></textarea>`; const ta = $('textarea', box); ta.value = text; ta.focus(); ta.select(); try { document.execCommand('copy'); } catch (e) { /* manual copy */ } };
      try { navigator.clipboard.writeText(text).then(() => toast(t('copied')), fb); } catch (e) { fb(); }
    };
  }
  document.addEventListener('keydown', e => {
    if (UI.state !== 'wWordle' || !Wd || Wd.done || wModalOpen() || $('#confirm').classList.contains('show') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') { if (!Wd.cur.length) return; e.preventDefault(); press('enter'); }
    else if (e.key === 'Backspace') { e.preventDefault(); press('del'); }
    else if (e.key.length === 1 && /[ء-ي]/.test(e.key)) { const k = wNorm(e.key); if (/[ءؤئ]/.test(k)) return; e.preventDefault(); press(k); }
  });
  m.state = () => Wd; m.press = press; m.start = start;
  return m;
})();
wReg(WordleMod);
