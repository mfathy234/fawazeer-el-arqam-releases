/* One puzzle session: start (booklet page, free play or the daily), moves and their reactions (Haj Salhafa's moods and lines, the sparrow's hints),
   the timer, restart / leave with a confirmation, and the win flow (stars, coins, trophies, the win card). Pure rules are in board.js and meta.js. */

let playTimer = 0, sayTimer = 0, moodTimer = 0, lastTick = 0, resizeObs = null;
const pick1 = a => a[Math.floor(Math.random() * a.length)];

const puzzleLabel = c => (c.kind === 'daily' ? t('daily') : c.kind === 'free' ? t('free') : t('puzzleNo', nf(c.idx + 1)));

function startPuzzle(ctx) {
  const seed = ctx.seed != null ? ctx.seed : (Math.random() * 4294967296) >>> 0;
  const p = ctx.kind === 'book' ? bookPuzzle(ctx.book, ctx.idx) : ctx.kind === 'daily' ? dailyPuzzle(todayKey()) : freePuzzle(ctx.diff, ctx.grade, seed);
  UI.ctx = { ...ctx, seed, diff: p.diff, grade: p.grade };
  UI.board = newBoard(p);
  UI.fx = { pop: [], shake: [] }; UI.landed = -1; UI.busy = false; UI.result = null;
  $('#winOv').classList.remove('show');
  showScreen('cw');
  mood('idle');
  say(t('tip'), 'tip');
  clearInterval(playTimer);
  lastTick = performance.now();
  playTimer = setInterval(tick, 250);
  renderPlay();
  layoutBoard(true);
}

function stopPuzzle() {
  clearInterval(playTimer); clearTimeout(sayTimer); clearTimeout(moodTimer);
  endDrag(true);
  UI.board = null; UI.busy = false;
  $('#winOv').classList.remove('show');
  $('#cwFx').innerHTML = '';
  $$('.bird-fly').forEach(n => n.remove());
}

function tick() {
  const n = performance.now(), dt = Math.min(0.5, (n - lastTick) / 1000);
  lastTick = n;
  const B = UI.board;
  if (!B || B.won || document.hidden || UI.state !== 'play') return;
  B.time += dt;
  hudUpdate();
}

/* ---------- Haj Salhafa and the sparrow ---------- */
function say(txt, kind, sec) {
  const e = $('#cwSay');
  e.textContent = txt; e.className = kind || 'tip';
  clearTimeout(sayTimer);
  if (sec && sec < 90) sayTimer = setTimeout(() => { const B = UI.board; if (B && !B.won) say(B.sel >= 0 ? t('sel') : t('tip'), 'tip'); }, sec * 1000);
}

function mood(m, ms) {
  $('#cwHost').innerHTML = hostSvg(m);
  $('#cwBird').innerHTML = birdSvg(m === 'cheer' ? 'fly0' : m === 'sip' ? 'chirp' : 'idle');
  clearTimeout(moodTimer);
  if (ms && ms < 90000) moodTimer = setTimeout(() => mood('idle'), ms);
}

/* ---------- moves ---------- */
function movePlace(tid, cid) {
  const B = UI.board;
  if (!B || B.won || UI.busy) return;
  const r = placeTile(B, tid, cid);
  if (r) afterMove(r, true);
}

function afterMove(r, user) {
  UI.fx = { pop: r.pops, shake: r.bads }; UI.landed = r.landed;
  if (user && !r.done) {
    if (r.pops.length) { Sound.play('ok', 1 + Math.min(4, solvedCount(UI.board)) * 0.03); say(line('praise'), 'good', 1.8); mood('cheer', 1000); }
    else if (r.bads.length) { Sound.play('bad'); say(line('oops'), 'bad', 2); mood('oops', 1100); }
    else Sound.play('drop');
  }
  renderBoard();
  if (r.done) winPuzzle();
}

function undoClick() {
  const B = UI.board;
  if (!B || B.won || UI.busy) return;
  const r = undoMove(B);
  if (!r) return;
  Sound.play('undo');
  afterMove(r, false);
}

function cellCenter(cid) {
  const n = $(`#cwGrid .cell:nth-child(${cid + 1})`);
  return n ? n.getBoundingClientRect() : null;
}

function birdFlight(cid, done) {
  const from = $('#cwBird').getBoundingClientRect(), to = cellCenter(cid), host = $('#cw').getBoundingClientRect();
  if (!to || Calm.on()) { done(); return; }
  const b = el('div', 'bird-fly');
  b.innerHTML = birdSvg('fly0');
  b.style.left = from.left - host.left + 'px'; b.style.top = from.top - host.top + 'px';
  $('#cw').appendChild(b);
  let f = 0;
  const flap = setInterval(() => { f = 1 - f; b.innerHTML = birdSvg(f ? 'fly1' : 'fly0'); }, 120);
  requestAnimationFrame(() => { b.style.transform = `translate(${to.left - from.left + (to.width - from.width) / 2}px,${to.top - from.top + (to.height - from.height) / 2 - 8}px)`; });
  setTimeout(() => { clearInterval(flap); b.remove(); done(); }, 640);
}

function useHint() {
  const B = UI.board;
  if (!B || B.won || UI.busy) return;
  const cost = hintCost(B);
  if (cost && UI.save.coins < cost) { say(t('nohint'), 'bad', 2.4); Sound.play('bad'); return; }
  let chosen = -1;
  const r = hintMove(B, list => { chosen = pick1(list); return chosen; });
  if (!r) return;
  if (cost) setSave(addCoins(UI.save, -cost));
  UI.busy = true;
  Sound.play('hint');
  $('#cwBird').innerHTML = birdSvg('note');
  say(line('sparrow'), 'good', 2.4);
  birdFlight(chosen, () => {
    UI.busy = false;
    if (!UI.board) return;
    Sound.play('drop');
    mood('think', 900);
    afterMove(r, false);
  });
}

function shuffleClick() {
  const B = UI.board;
  if (!B || B.won) return;
  shuffleOrder(B, list => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
  Sound.play('shuffle');
  renderBoard();
}

function restartClick() {
  const B = UI.board;
  if (!B || B.won) return;
  const name = puzzleLabel(UI.ctx);
  const go = () => { restartBoard(UI.board); UI.fx = { pop: [], shake: [] }; Sound.play('click'); say(t('tip'), 'tip'); mood('idle'); renderBoard(); };
  if (!B.moves) { go(); return; }
  confirmAction({ title: t('restartTitle', name), body: t('restartBody'), yes: t('restartYes', name), no: t('leaveNo'), onYes: go });
}

/* ---------- leaving ---------- */
function exitPuzzle() {
  const c = UI.ctx;
  stopPuzzle();
  if (c && c.kind === 'book') openIssue(c.book);
  else if (c && c.kind === 'free') openFree();
  else if (c && c.kind === 'daily') openDaily();
  else goMenu();
}

function leavePuzzle() {
  const B = UI.board;
  if (!B) { goMenu(); return; }
  if (B.won || !B.moves) { exitPuzzle(); return; }
  const name = puzzleLabel(UI.ctx);
  confirmAction({ title: t('leaveTitle', name), body: t('leaveBody'), yes: t('leaveYes', name), no: t('leaveNo'), onYes: exitPuzzle });
}

/* ---------- winning ---------- */
function winPuzzle() {
  const B = UI.board, c = UI.ctx;
  if (!B || B.won) return;
  const res = finishBoard(B);
  const out = recordSolve(UI.save, { kind: c.kind, book: c.book, idx: c.idx, diff: res.diff, grade: res.grade, mist: res.mist, hints: res.hints, time: res.time }, todayKey(), nowMs());
  setSave(out.save);
  UI.result = out;
  Sound.play(out.stars === 3 ? 'stars' : 'win');
  mood('cheer', 99999);
  say(line('win'), 'good', 99);
  confetti();
  renderBoard();
  setTimeout(() => { if (UI.board === B) showWin(out, res); }, 900);
}

function showWin(out, res) {
  const c = UI.ctx;
  $('#winHost').innerHTML = hostSvg('cheer');
  $('#winStars').innerHTML = [0, 1, 2].map(i => icon(i < out.stars ? 'star' : 'starOff').replace('<svg', `<svg style="animation-delay:${0.25 + i * 0.2}s"`)).join('');
  $('#wTime').textContent = mmss(Math.max(1, Math.round(res.time)));
  $('#wMist').textContent = nf(res.mist); $('#wHints').textContent = nf(res.hints); $('#wCoins').textContent = '+' + nf(out.coins);
  $('#winRec').classList.toggle('on', out.record);
  const notes = $('#winNotes');
  notes.innerHTML = '';
  if (out.cleared) notes.append(el('p', '', t('bookCleared', bookName(bookById(c.book)))));
  if (out.opened) notes.append(el('p', '', t('bookOpened', bookName(bookById(out.opened)))));
  out.earned.forEach(id => notes.append(el('p', '', t('trophyToast', achName(id)))));
  const last = c.kind === 'daily' || (c.kind === 'book' && c.idx + 1 >= BOOKLET.size);
  $('#winNext').classList.toggle('hidden', last);
  $('#winIssue').textContent = c.kind === 'book' ? t('toIssue') : c.kind === 'daily' ? t('dailyTitle') : t('freeTitle');
  $('#winOv').classList.add('show');
  $('#winNext').focus({ preventScroll: true });
  if (out.opened || out.cleared) Sound.play('unlock');
}

function nextPuzzle() {
  const c = UI.ctx;
  Sound.play('click');
  if (c.kind === 'book' && c.idx + 1 < BOOKLET.size) startPuzzle({ kind: 'book', book: c.book, idx: c.idx + 1 });
  else if (c.kind === 'free') startPuzzle({ kind: 'free', diff: c.diff, grade: c.grade });
  else exitPuzzle();
}

/* ---------- the screen ---------- */
function renderPlay() {
  const B = UI.board;
  if (!B) return;
  $('#cwNote').textContent = puzzleLabel(UI.ctx) + ' · ' + t(B.p.diff);
  hydrate($('#cw'));
  if (!B.won) say(B.sel >= 0 ? t('sel') : t('tip'), 'tip');
  mood(B.won ? 'cheer' : 'idle');
  renderBoard();
}

function wirePlay() {
  $('#cwHome').innerHTML = icon('home');
  $('#cwHome').addEventListener('click', leavePuzzle);
  $('#cwMute').addEventListener('click', toggleMute);
  $('#cwUndo').addEventListener('click', undoClick);
  $('#cwHint').addEventListener('click', useHint);
  $('#cwShuf').addEventListener('click', shuffleClick);
  $('#cwRestart').addEventListener('click', restartClick);
  $('#winNext').addEventListener('click', nextPuzzle);
  $('#winIssue').addEventListener('click', () => { Sound.play('click'); exitPuzzle(); });
  $('#winMenu').addEventListener('click', () => { Sound.play('click'); goMenu(); });
  resizeObs = new ResizeObserver(() => layoutBoard(false));
  resizeObs.observe($('#cwBoard'));
  UI.render.cw = renderPlay;
}
