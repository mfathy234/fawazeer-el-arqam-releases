/* The save fields of the word games (save.words): defaults and sanitize. Pure and immutable like save.js, which calls newWords() / sanitizeWords().
   Progress rules (what a finished puzzle changes) are in wmeta.js. Old saves have no `words` field and load with the defaults. */

const WORDLE_DIST = WORDS.wordle.tries + 1;
const WORD_DAILY_IDS = ['wheel', 'riddle', 'wordle'];
const GUESS_OK = /^[ء-ي]{5}$/;

const newWordle = () => ({ date: '', guesses: [], done: false, won: false, played: 0, wins: 0, streak: 0, bestStreak: 0, lastWin: '', dist: Array(WORDLE_DIST).fill(0) });
const newWords = () => ({
  stars: 0, bonusDays: 0, daily: { date: '', wheel: false, riddle: false, wordle: false },
  wheel: { level: 1, best: {}, bonus: 0 }, riddle: { next: 0, solved: {} }, wordle: newWordle(), proverb: { level: 0, best: {} }
});

function sanitizeBestMap(raw, max, lo, hi) {
  const out = {};
  Object.keys(asObject(raw)).forEach(k => {
    const i = Number(k), v = toInt(asObject(raw)[k], 0, hi);
    if (/^\d+$/.test(k) && i < max && v >= lo) out[k] = v;
  });
  return out;
}

function sanitizeWordle(raw) {
  const r = asObject(raw), d = newWordle(), date = dateKeyOr(r.date);
  const guesses = date ? asArray(r.guesses).filter(g => typeof g === 'string' && GUESS_OK.test(g)).slice(0, WORDS.wordle.tries) : [];
  const dist = Array.from({ length: WORDLE_DIST }, (_, i) => toInt(asArray(r.dist)[i], 0, 1e6));
  const streak = toInt(r.streak, 0, 1e5);
  const won = date && r.won === true && guesses.length > 0, done = date && (won || r.done === true) && guesses.length > 0;
  return {
    date: guesses.length || done ? date : '', guesses, done: Boolean(done), won: Boolean(won), played: toInt(r.played, 0, 1e7), wins: Math.min(toInt(r.wins, 0, 1e7), toInt(r.played, 0, 1e7)),
    streak, bestStreak: Math.max(streak, toInt(r.bestStreak, 0, 1e5)), lastWin: dateKeyOr(r.lastWin), dist: dist.length === d.dist.length ? dist : d.dist
  };
}

function sanitizeWords(raw) {
  const r = asObject(raw), daily = asObject(r.daily), wheel = asObject(r.wheel), riddle = asObject(r.riddle), proverb = asObject(r.proverb);
  const date = dateKeyOr(daily.date), flag = id => Boolean(date) && daily[id] === true;
  return {
    stars: toInt(r.stars, 0, 1e7), bonusDays: toInt(r.bonusDays, 0, 1e5),
    daily: { date, wheel: flag('wheel'), riddle: flag('riddle'), wordle: flag('wordle') },
    wheel: { level: Math.max(1, toInt(wheel.level, 1, 1e5)), best: sanitizeBestMap(wheel.best, 1e5, 1, 3), bonus: toInt(wheel.bonus, 0, 1e7) },
    riddle: { next: toInt(riddle.next, 0, RIDDLES.length * 100), solved: sanitizeBestMap(riddle.solved, RIDDLES.length, 1, 100) },
    wordle: sanitizeWordle(r.wordle),
    proverb: { level: toInt(proverb.level, 0, PROVERBS.length), best: sanitizeBestMap(proverb.best, PROVERBS.length, 1, 3) }
  };
}

/** How many word puzzles are solved in all (levels, riddles, wins, proverbs): shown by the reset dialog. */
const wordsSolvedCount = save => Object.keys(save.words.wheel.best).length + Object.keys(save.words.riddle.solved).length + save.words.wordle.wins + Object.keys(save.words.proverb.best).length;
