/* Pure progress rules: stars, coins for a solved puzzle, booklet unlocking, the daily puzzle and its streak, achievements.
   recordSolve() is the one place a finished puzzle changes the save. */

const pad2 = n => String(n).padStart(2, '0');
const todayKey = (d = new Date()) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const keyToDate = key => { const [y, m, d] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const prevDay = key => { const d = keyToDate(key); d.setUTCDate(d.getUTCDate() - 1); return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); };

/** 1 to 3 stars from mistakes, hints and time. */
function starsFor(diff, mist, hints, time) {
  const pen = mist + hints * STARS.hintPenalty + (time > DIFFS[diff].par ? 0.5 : 0);
  return pen <= STARS.pen3 ? 3 : pen <= STARS.pen2 ? 2 : 1;
}

/* ---------- Booklets ---------- */
const bookRow = (save, id) => save.books[id] || Array(BOOKLET.size).fill(0);
const bookSolved = (save, id) => bookRow(save, id).filter(s => s > 0).length;
const bookStarTotal = (save, id) => bookRow(save, id).reduce((a, b) => a + b, 0);
const bookCleared = (save, id) => bookSolved(save, id) >= BOOKLET.size;
function bookUnlocked(save, index, now = passClock.now()) {
  return index === 0 || passActive(save, now) || bookSolved(save, BOOKLETS[index - 1].id) >= BOOKLET.unlockAt;
}
const totalSolved = save => BOOKLETS.reduce((n, b) => n + bookSolved(save, b.id), 0);

const gradeMult = grade => GRADE_COIN[grade] || 1;
const coinsFor = (diff, grade, stars) => Math.ceil(DIFFS[diff].coin * gradeMult(grade) * stars / 3);

/* ---------- Daily ---------- */
const dailyDone = (save, dateKey) => save.daily.lastWin === dateKey;
/** The streak shown today: it survives until a whole day is missed. */
function dailyStreakNow(save, dateKey) {
  const d = save.daily;
  return d.lastWin === dateKey || d.lastWin === prevDay(dateKey) ? d.streak : 0;
}
const dailyBonus = streak => DAILY.firstBonus + Math.min(streak, DAILY.streakCap) * DAILY.streakStep;

/* ---------- Achievements ---------- */
const ACH_RULES = {
  first: s => s.stats.solved >= 1, solved10: s => s.stats.solved >= 10, solved50: s => s.stats.solved >= 50, solved150: s => s.stats.solved >= 150,
  stars3x10: s => s.stats.threes >= 10, clean: s => s.stats.clean >= 5, hardwin: s => s.stats.hards >= 1, fast: s => s.stats.fast >= 1,
  daily3: s => s.daily.bestStreak >= 3, daily7: s => s.daily.bestStreak >= 7,
  booklet1: s => BOOKLETS.some(b => bookCleared(s, b.id)), allbooklets: s => BOOKLETS.every(b => bookCleared(s, b.id)),
  shopper: s => boughtCount(s) >= 1, collector: s => boughtCount(s) >= 6
};

/** Grants every achievement whose rule now holds. Returns { save, earned } (earned = new ids; their coins are added). */
function grantAchievements(save) {
  const earned = ACHIEVEMENTS.filter(a => !save.ach.includes(a.id) && ACH_RULES[a.id](save)).map(a => a.id);
  if (!earned.length) return { save, earned };
  const coins = earned.reduce((n, id) => n + ACHIEVEMENTS.find(a => a.id === id).coins, 0);
  return { save: { ...save, coins: save.coins + coins, ach: [...save.ach, ...earned] }, earned };
}

/* ---------- A finished puzzle ---------- */
/** r = { kind: 'book' | 'free' | 'daily', book, idx, diff, grade, mist, hints, time (seconds) }.
    Returns { save, stars, coins, record (new best time), earned (achievement ids), cleared (booklet just finished), opened (next booklet just unlocked) }. */
function recordSolve(save, r, today, now = 0) {
  const stars = starsFor(r.diff, r.mist, r.hints, r.time), time = Math.max(1, Math.round(r.time));
  let coins = 0, books = save.books, daily = save.daily, free = save.free, cleared = false, opened = null;
  if (r.kind === 'book') {
    const row = bookRow(save, r.book).slice(), prev = row[r.idx], wasSolved = bookSolved(save, r.book), index = BOOKLETS.findIndex(b => b.id === r.book);
    row[r.idx] = Math.max(prev, stars);
    coins = coinsFor(r.diff, r.grade, Math.max(0, stars - prev));
    books = { ...save.books, [r.book]: row };
    cleared = wasSolved < BOOKLET.size && row.every(x => x > 0);
    if (cleared) coins += Math.round(BOOKLET.clearBonus * gradeMult(r.grade));
    const next = BOOKLETS[index + 1];
    if (next && wasSolved < BOOKLET.unlockAt && row.filter(x => x > 0).length >= BOOKLET.unlockAt) opened = next.id;
  } else if (r.kind === 'free') {
    coins = Math.ceil(coinsFor(r.diff, r.grade, stars) * FREE.coinShare);
    free = { solved: save.free.solved + 1 };
  } else if (r.kind === 'daily' && save.daily.lastWin !== today) {
    const streak = save.daily.lastWin === prevDay(today) ? save.daily.streak + 1 : 1;
    coins = coinsFor(r.diff, r.grade, stars) + dailyBonus(streak);
    daily = { ...save.daily, lastWin: today, streak, bestStreak: Math.max(save.daily.bestStreak, streak), best: save.daily.best ? Math.min(save.daily.best, time) : time, days: [...save.daily.days, today].slice(-DAILY.keepDays) };
  }
  const first = !save.best[r.diff] || time < save.best[r.diff];
  const dailyFirst = r.kind === 'daily' && daily !== save.daily;
  const st = save.stats;
  const stats = {
    solved: st.solved + 1, threes: st.threes + (stars === 3 ? 1 : 0), clean: st.clean + (r.mist === 0 && r.hints === 0 ? 1 : 0), hards: st.hards + (r.diff === 'hard' ? 1 : 0),
    fast: st.fast + (r.diff === 'easy' && time <= FAST_SECONDS ? 1 : 0), hints: st.hints + r.hints, mistakes: st.mistakes + r.mist, dailies: st.dailies + (dailyFirst ? 1 : 0)
  };
  const next = { ...save, books, daily, free, stats, coins: save.coins + coins, best: { ...save.best, [r.diff]: first ? time : save.best[r.diff] }, updatedAt: now || save.updatedAt };
  const g = grantAchievements(next);
  return { save: g.save, stars, coins: coins + g.earned.reduce((n, id) => n + ACHIEVEMENTS.find(a => a.id === id).coins, 0), record: first, earned: g.earned, cleared, opened };
}

/** Achievements can also be earned by buying things; call this after a purchase. */
const afterShop = save => grantAchievements(save);
