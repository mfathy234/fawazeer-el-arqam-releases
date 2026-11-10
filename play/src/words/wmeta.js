/* Pure progress rules of the word games. Each record*() is the one place a finished puzzle changes the save (coins, stars, levels, dailies, achievements),
   like recordSolve() for the number puzzles. They return { save, stars, coins, earned, ... } and never edit their input. */

const wDailyDone = (save, id, today) => save.words.daily.date === today && save.words.daily[id] === true;
const wDailyCount = (save, today) => WORD_DAILY_IDS.filter(id => wDailyDone(save, id, today)).length;

/** Marks one word daily done today. When it was the third one of the day the "all three" counter grows. */
function wMarkDaily(words, id, today) {
  const cur = words.daily.date === today ? words.daily : { date: today, wheel: false, riddle: false, wordle: false };
  const daily = { ...cur, [id]: true };
  const all = WORD_DAILY_IDS.every(k => daily[k]) && !WORD_DAILY_IDS.every(k => cur[k]);
  return { ...words, daily, bonusDays: words.bonusDays + (all ? 1 : 0) };
}

const WORD_ACH_RULES = {
  wheel1: s => Object.keys(s.words.wheel.best).length >= 1, wheel10: s => Object.keys(s.words.wheel.best).length >= 10, bonus25: s => s.words.wheel.bonus >= 25,
  riddle5: s => Object.keys(s.words.riddle.solved).length >= 5, riddle20: s => Object.keys(s.words.riddle.solved).length >= 20,
  wordle1: s => s.words.wordle.wins >= 1, wordle2: s => s.words.wordle.dist[1] + s.words.wordle.dist[2] >= 1, wordle7: s => s.words.wordle.bestStreak >= 7,
  proverb10: s => Object.keys(s.words.proverb.best).length >= 10, proverbAll: s => Object.keys(s.words.proverb.best).length >= PROVERBS.length,
  wdays: s => s.words.bonusDays >= 1
};
Object.assign(ACH_RULES, WORD_ACH_RULES);

const achCoins = ids => ids.reduce((n, id) => n + ACHIEVEMENTS.find(a => a.id === id).coins, 0);

/** Applies a words patch and the coins, runs the achievements, and shapes the result. */
function wFinish(save, words, coins, now, extra) {
  const g = grantAchievements({ ...save, words, coins: save.coins + coins, updatedAt: now || save.updatedAt });
  return { ...extra, save: g.save, coins: coins + achCoins(g.earned), earned: g.earned };
}

/** r = { mode: 'level' | 'daily', level, words (count in the grid), hints, reveals, wrong, bonus (bonus words found) } */
function recordWheel(save, r, today, now = 0) {
  const W = WORDS.wheel, pen = r.hints + 2 * r.reveals + Math.floor(r.wrong / 3), stars = pen <= 0 ? 3 : pen <= 2 ? 2 : 1;
  let coins = W.base + W.perWord * r.words + W.perStar * stars, words = save.words, starGain = 0;
  if (r.mode === 'daily') {
    if (wDailyDone(save, 'wheel', today)) coins = 0;
    else { coins += W.dailyBonus; words = wMarkDaily(words, 'wheel', today); }
  } else {
    const prev = words.wheel.best[r.level] || 0;
    starGain = Math.max(0, stars - prev);
    words = { ...words, wheel: { ...words.wheel, best: { ...words.wheel.best, [r.level]: Math.max(prev, stars) }, level: Math.max(words.wheel.level, r.level + 1) } };
  }
  words = { ...words, stars: words.stars + starGain, wheel: { ...words.wheel, bonus: words.wheel.bonus + r.bonus } };
  return wFinish(save, words, coins, now, { stars });
}

const riddlePoints = (sec, reveals) => Math.max(WORDS.riddle.minPts, WORDS.riddle.maxPts - Math.max(0, Math.floor((sec - WORDS.riddle.graceSec) * WORDS.riddle.perSec)) - WORDS.riddle.revealPenalty * reveals);

/** r = { mode: 'daily' | 'pack', idx, sec, reveals } */
function recordRiddle(save, r, today, now = 0) {
  const R = WORDS.riddle, pts = riddlePoints(r.sec, r.reveals), stars = pts >= R.stars3 ? 3 : pts >= R.stars2 ? 2 : 1;
  let coins = Math.round(pts / 10) + 2, words = save.words;
  if (r.mode === 'daily') {
    if (wDailyDone(save, 'riddle', today)) coins = 0;
    else { coins += R.dailyBonus; words = wMarkDaily(words, 'riddle', today); }
  } else {
    const had = words.riddle.solved[r.idx] > 0;
    if (had) coins = Math.round(coins / 2);
    const solved = had ? words.riddle.solved : { ...words.riddle.solved, [r.idx]: pts };
    words = { ...words, stars: words.stars + (had ? 0 : stars), riddle: { next: Math.min(RIDDLES.length * 100, words.riddle.next + 1), solved } };
  }
  return wFinish(save, words, coins, now, { stars, pts });
}

const wordleStars = tries => (tries <= 2 ? 3 : tries <= 4 ? 2 : 1);

/** Keeps today's daily guesses in the save while the game is on. */
function wordleStore(save, state) {
  return { ...save, words: { ...save.words, wordle: { ...save.words.wordle, date: state.date, guesses: state.guesses.slice(), done: state.done, won: state.won } } };
}

/** r = { mode: 'daily' | 'practice', tries, won }. The daily's own guesses are stored by wordleStore. */
function recordWordle(save, r, today, now = 0) {
  const W = WORDS.wordle, wd = save.words.wordle, stars = r.won ? wordleStars(r.tries) : 0;
  let coins = r.won ? Math.max(W.min, W.base - W.step * (r.tries - 1)) : W.lose, words = save.words, streak = wd.streak, bestStreak = wd.bestStreak, lastWin = wd.lastWin;
  const dist = wd.dist.slice();
  if (r.won) dist[r.tries] += 1;
  if (r.mode === 'daily') {
    if (wDailyDone(save, 'wordle', today)) coins = 0;
    else {
      if (r.won) coins += W.dailyBonus;
      words = wMarkDaily(words, 'wordle', today);
    }
    if (r.won && lastWin !== today) { streak = lastWin === prevDay(today) ? wd.streak + 1 : 1; bestStreak = Math.max(bestStreak, streak); lastWin = today; }
  } else coins = Math.round(coins / 2);
  const gain = r.won && r.mode === 'daily' && !wDailyDone(save, 'wordle', today) ? stars : 0;
  words = { ...words, stars: words.stars + gain, wordle: { ...words.wordle, played: wd.played + 1, wins: wd.wins + (r.won ? 1 : 0), streak, bestStreak, lastWin, dist } };
  return wFinish(save, words, coins, now, { stars });
}

/** The streak shown today: it survives until a whole day is missed. */
const wordleStreakNow = (save, today) => (save.words.wordle.lastWin === today || save.words.wordle.lastWin === prevDay(today) ? save.words.wordle.streak : 0);

/** r = { idx (the proverb's own index, the key of its stars), pos (its place in the short-to-long list, the next one is pos + 1), count (words), hints, wrong } */
function recordProverb(save, r, now = 0) {
  const P = WORDS.proverb, pv = save.words.proverb, stars = r.hints === 0 && r.wrong <= 1 ? 3 : r.hints <= 1 && r.wrong <= 3 ? 2 : 1;
  const first = !(pv.best[r.idx] > 0), coins = Math.round((P.base + P.perWord * r.count + P.perStar * stars) * (first ? 1 : P.replayShare));
  const words = { ...save.words, stars: save.words.stars + (first ? stars : 0), proverb: { level: r.pos + 1, best: { ...pv.best, [r.idx]: Math.max(pv.best[r.idx] || 0, stars) } } };
  return wFinish(save, words, coins, now, { stars, first });
}
