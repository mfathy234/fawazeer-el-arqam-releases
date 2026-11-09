/* The list screens: menu, issues (booklets), one issue's puzzles, free play, the daily puzzle and trophies. Rules are in meta.js; this only draws and wires. */

let menuMoodTimer = 0, bubbleTimer = 0;

/* ---------- menu ---------- */
function menuSay(text) {
  const b = $('#menuSay');
  b.textContent = text;
  b.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => b.classList.remove('show'), 2800);
}

function menuMood(m, ms) {
  $('#menuTortoise').innerHTML = hostSvg(m);
  clearTimeout(menuMoodTimer);
  if (ms) menuMoodTimer = setTimeout(() => { $('#menuTortoise').innerHTML = hostSvg('idle'); }, ms);
}

function renderMenu() {
  const s = UI.save;
  $('#menuTortoise').innerHTML = hostSvg('idle');
  $('#menuBird').innerHTML = birdSvg('idle');
  $('#menuCoins').textContent = nf(s.coins);
  $('#trophyCount').textContent = nf(s.ach.length) + '/' + nf(ACHIEVEMENTS.length);
  $('#dailyDot').classList.toggle('hidden', dailyDone(s, todayKey()));
  const on = passOn();
  $('#btnPass').classList.toggle('hidden', on);
  $('#passChip').classList.toggle('hidden', !on);
  if (on) $('#passChip').textContent = t('passChip', fmtPassLeft());
  hydrate($('#menu'));
}

function wireMenu() {
  $('#menuMute').addEventListener('click', toggleMute);
  $('#btnPlay').addEventListener('click', () => { Sound.play('click'); openBooks(); });
  $('#btnFree').addEventListener('click', () => { Sound.play('click'); openFree(); });
  $('#btnDaily').addEventListener('click', () => { Sound.play('click'); openDaily(); });
  $('#btnShop').addEventListener('click', () => { Sound.play('click'); openShop(); });
  $('#btnTrophies').addEventListener('click', () => { Sound.play('click'); openTrophies(); });
  $('#btnSettings').addEventListener('click', () => { Sound.play('click'); openSettings(); });
  $('#btnPass').addEventListener('click', () => { setSave(startPass(UI.save, nowMs())); Sound.play('buy'); toast(t('passStarted')); renderMenu(); });
  $('#menuTortoise').addEventListener('click', () => { Sound.play('tea'); menuMood('sip', 1500); menuSay(line('idle')); });
  $('#menuBird').addEventListener('click', () => { Sound.play('hint'); $('#menuBird').innerHTML = birdSvg('chirp'); setTimeout(() => { $('#menuBird').innerHTML = birdSvg('idle'); }, 1200); menuSay(line('sparrow')); });
  UI.render.menu = renderMenu;
}

/* ---------- issues ---------- */
function openBooks() { showScreen('books'); renderBooks(); }

function renderBooks() {
  const s = UI.save, list = $('#bookList');
  list.innerHTML = '';
  BOOKLETS.forEach((b, i) => {
    const open = bookUnlocked(s, i, nowMs()), done = bookCleared(s, b.id), solved = bookSolved(s, b.id);
    const card = el('button', 'book' + (open ? '' : ' locked'));
    card.type = 'button';
    card.innerHTML = `<svg class="cover" viewBox="0 0 100 130" aria-hidden="true">${coverArt(b, i + 1, done)}</svg>` + (open ? '' : icon('lock', 'lockbadge')) +
      `<b>${bookName(b)}</b><small>${open ? t('solvedOf', nf(solved), nf(BOOKLET.size)) : t('lockedBook', nf(BOOKLET.unlockAt))}</small>` +
      (open ? `<div class="bar-prog"><i style="width:${solved / BOOKLET.size * 100}%"></i></div>` : '');
    card.addEventListener('click', () => { if (open) { Sound.play('click'); openIssue(b.id); } else { Sound.play('bad'); toast(t('lockedBook', nf(BOOKLET.unlockAt))); } });
    list.append(card);
  });
  hydrate($('#books'));
}

function openIssue(id) { UI.book = id; showScreen('issue'); renderIssue(); }

function renderIssue() {
  const b = bookById(UI.book), s = UI.save, row = bookRow(s, b.id);
  $('#issueTitle').textContent = bookName(b);
  $('#issueSub').textContent = t('solvedOf', nf(bookSolved(s, b.id)), nf(BOOKLET.size)) + ' · ' + nf(bookStarTotal(s, b.id)) + '/' + nf(BOOKLET.size * 3) + ' ★';
  const g = $('#puzzleGrid');
  g.innerHTML = '';
  row.forEach((stars, i) => {
    const btn = el('button', 'pz ' + bookDiff(i));
    btn.type = 'button';
    btn.innerHTML = `<span>${nf(i + 1)}</span><span class="stars">${starsRow(stars)}</span>`;
    btn.setAttribute('aria-label', t('puzzleNo', nf(i + 1)) + ' · ' + t(bookDiff(i)));
    btn.addEventListener('click', () => { Sound.play('click'); startPuzzle({ kind: 'book', book: b.id, idx: i }); });
    g.append(btn);
  });
  hydrate($('#issue'));
}

/* ---------- free play ---------- */
const maxFreeGrade = () => BOOKLETS.reduce((m, b, i) => (bookUnlocked(UI.save, i, nowMs()) ? i : m), 0);

function openFree() {
  if (UI.freeGrade == null || UI.freeGrade > maxFreeGrade()) UI.freeGrade = maxFreeGrade();
  showScreen('free');
  renderFree();
}

function renderFree() {
  const g = UI.freeGrade, A = GRADES[g].A;
  $('#gradeVal').textContent = t('issue', nf(g + 1)) + ' · ' + (LANG.cur === 'ar' ? 'لحد ' : 'up to ') + nf(A);
  $('#gradePrev').disabled = g <= 0; $('#gradeNext').disabled = g >= maxFreeGrade();
  const box = $('#freeDiffs');
  box.innerHTML = '';
  DIFF_IDS.forEach((d, i) => {
    const btn = el('button', 'diff d' + i);
    btn.type = 'button';
    btn.innerHTML = `<span>${t(d)}</span><small>${t('best')}: ${UI.save.best[d] ? mmss(UI.save.best[d]) : '—'}</small><span class="chip">${icon('coin')}<b>${nf(Math.ceil(coinsFor(d, g, 3) * FREE.coinShare))}</b></span>`;
    btn.addEventListener('click', () => { Sound.play('click'); startPuzzle({ kind: 'free', diff: d, grade: g }); });
    box.append(btn);
  });
  hydrate($('#free'));
}

/* ---------- daily ---------- */
const dateLabel = key => new Date(key + 'T12:00:00').toLocaleDateString((LANG.cur === 'ar' ? 'ar-EG' : 'en-GB') + '-u-nu-' + (indicOn() ? 'arab' : 'latn'), { weekday: 'long', day: 'numeric', month: 'long' });
const shortDay = key => new Date(key + 'T12:00:00').toLocaleDateString((LANG.cur === 'ar' ? 'ar-EG' : 'en-GB') + '-u-nu-' + (indicOn() ? 'arab' : 'latn'), { weekday: 'short' });

function openDaily() { showScreen('dailyScr'); renderDaily(); }

function renderDaily() {
  const s = UI.save, today = todayKey(), done = dailyDone(s, today);
  $('#dailyHost').innerHTML = hostSvg(done ? 'cheer' : 'idle');
  $('#dailyDate').textContent = dateLabel(today);
  const keys = [today];
  for (let i = 0; i < 6; i++) keys.unshift(prevDay(keys[0]));
  $('#dailyDays').innerHTML = keys.map(k => `<div class="day${k === today ? ' today' : ''}"><i class="${s.daily.days.includes(k) ? 'on' : ''}">${s.daily.days.includes(k) ? icon('tick') : ''}</i>${shortDay(k)}</div>`).join('');
  $('#dailyStreak').textContent = t('dailyStreak', nf(dailyStreakNow(s, today)));
  $('#dailyNote').textContent = done ? (s.daily.best ? t('dailyBest', mmss(s.daily.best)) : t('dailyDone')) : t('dailyBonus');
  const go = $('#dailyGo');
  go.disabled = done;
  go.textContent = done ? t('dailyDone') : t('dailyPlay');
}

/* ---------- trophies ---------- */
function openTrophies() { showScreen('trophies'); renderTrophies(); }

function renderTrophies() {
  const s = UI.save, box = $('#trophyList');
  $('#trophiesSub').textContent = t('trophiesCount', nf(s.ach.length), nf(ACHIEVEMENTS.length));
  box.innerHTML = ACHIEVEMENTS.map(a => {
    const on = s.ach.includes(a.id);
    return `<div class="tr${on ? '' : ' off'}">${icon(on ? 'trophy' : 'lock')}<div><b>${achName(a.id)}</b><small>${achDesc(a.id)}</small></div><span class="reward">${icon('coin')}${nf(a.coins)}</span></div>`;
  }).join('');
  hydrate($('#trophies'));
}

function wireScreens() {
  $('#booksBack').addEventListener('click', () => { Sound.play('click'); goMenu(); });
  $('#issueBack').addEventListener('click', () => { Sound.play('click'); openBooks(); });
  $('#freeBack').addEventListener('click', () => { Sound.play('click'); goMenu(); });
  $('#dailyBack').addEventListener('click', () => { Sound.play('click'); goMenu(); });
  $('#trophiesBack').addEventListener('click', () => { Sound.play('click'); goMenu(); });
  $('#gradePrev').addEventListener('click', () => { UI.freeGrade = Math.max(0, UI.freeGrade - 1); Sound.play('click'); renderFree(); });
  $('#gradeNext').addEventListener('click', () => { UI.freeGrade = Math.min(maxFreeGrade(), UI.freeGrade + 1); Sound.play('click'); renderFree(); });
  $('#dailyGo').addEventListener('click', () => { Sound.play('click'); startPuzzle({ kind: 'daily' }); });
  UI.render.books = renderBooks; UI.render.issue = renderIssue; UI.render.free = renderFree; UI.render.dailyScr = renderDaily; UI.render.trophies = renderTrophies;
}
