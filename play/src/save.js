/* Save model: pure and immutable. Every function returns a new save and never edits its input. Storage adapters are at the bottom.
   The shop is in shop.js, results / daily / achievements are in meta.js. Anything read from storage goes through sanitizeSave. */

const SAVE_VERSION = 1;
const HOUR_MS = 3600 * 1000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DIGIT_MODES = ['auto', 'indic', 'latin'];

const toInt = (v, min, max) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Math.max(min, Math.min(max, Math.floor(Number(v)))) : min);
const asObject = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const asArray = v => (Array.isArray(v) ? v : []);
const dateKeyOr = v => (typeof v === 'string' && DATE_KEY.test(v) ? v : '');
const uniq = a => [...new Set(a)];

const newPrefs = () => ({ music: 80, sfx: 100, vibrate: true, calm: false, digits: 'auto' });
const newDaily = () => ({ lastWin: '', streak: 0, bestStreak: 0, best: 0, days: [] });
const newStats = () => ({ solved: 0, threes: 0, clean: 0, hards: 0, fast: 0, hints: 0, mistakes: 0, dailies: 0 });

function sanitizePrefs(raw) {
  const r = asObject(raw), d = newPrefs();
  const level = (v, def) => toInt(v == null ? def : v, 0, 100);
  return { music: level(r.music, d.music), sfx: level(r.sfx, d.sfx), vibrate: r.vibrate !== false, calm: r.calm === true, digits: DIGIT_MODES.includes(r.digits) ? r.digits : 'auto' };
}

function newSave(now = 0) {
  const owned = {}, worn = {};
  Object.keys(SHOP_DEFAULTS).forEach(k => { owned[k] = [SHOP_DEFAULTS[k]]; worn[k] = SHOP_DEFAULTS[k]; });
  return {
    v: SAVE_VERSION, createdAt: now, updatedAt: now, lang: 'ar', muted: false, coins: 0, prefs: newPrefs(), books: {}, best: { easy: 0, medium: 0, hard: 0 }, free: { solved: 0 },
    daily: newDaily(), stats: newStats(), owned, worn, ach: [], passUntil: 0, seen: { hint: false }
  };
}

function sanitizeBooks(raw) {
  const out = {};
  BOOKLETS.forEach(b => {
    const row = asArray(asObject(raw)[b.id]);
    if (row.some(x => Number(x) > 0)) out[b.id] = Array.from({ length: BOOKLET.size }, (_, i) => toInt(row[i], 0, 3));
  });
  return out;
}

function sanitizeDaily(raw) {
  const d = asObject(raw), days = uniq(asArray(d.days).filter(k => DATE_KEY.test(k))).sort().slice(-DAILY.keepDays);
  const streak = toInt(d.streak, 0, 1e5);
  return { lastWin: dateKeyOr(d.lastWin), streak, bestStreak: Math.max(streak, toInt(d.bestStreak, 0, 1e5)), best: toInt(d.best, 0, 1e6), days };
}

function sanitizeStats(raw) {
  const r = asObject(raw), out = newStats();
  Object.keys(out).forEach(k => { out[k] = toInt(r[k], 0, 1e7); });
  return out;
}

function sanitizeShop(rawOwned, rawWorn, passOn) {
  const owned = {}, worn = {};
  Object.keys(SHOP_KINDS).forEach(kind => {
    const ids = SHOP_KINDS[kind].map(x => x.id), def = SHOP_DEFAULTS[kind];
    owned[kind] = uniq([def, ...asArray(asObject(rawOwned)[kind]).filter(id => ids.includes(id))]);
    const w = asObject(rawWorn)[kind];
    worn[kind] = ids.includes(w) && (owned[kind].includes(w) || passOn) ? w : def;
  });
  return { owned, worn };
}

/** Anything goes in, a valid save (or null for a non-save) comes out. */
function sanitizeSave(raw, now = 0) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const known = ['coins', 'books', 'owned', 'daily', 'stats', 'lang', 'prefs', 'worn', 'best', 'free', 'ach'];
  if (!known.some(k => k in raw)) return null;
  const passUntil = Number(raw.passUntil) > now ? Math.min(Math.floor(Number(raw.passUntil)), now + PASS.hours * HOUR_MS) : 0;
  const shop = sanitizeShop(raw.owned, raw.worn, passUntil > 0);
  const best = asObject(raw.best), free = asObject(raw.free);
  const ids = ACHIEVEMENTS.map(a => a.id);
  return {
    v: SAVE_VERSION, createdAt: toInt(raw.createdAt, 0, 1e15), updatedAt: toInt(raw.updatedAt, 0, 1e15), lang: raw.lang === 'en' ? 'en' : 'ar', muted: raw.muted === true,
    coins: toInt(raw.coins, 0, 1e9), prefs: sanitizePrefs(raw.prefs), books: sanitizeBooks(raw.books),
    best: { easy: toInt(best.easy, 0, 1e6), medium: toInt(best.medium, 0, 1e6), hard: toInt(best.hard, 0, 1e6) }, free: { solved: toInt(free.solved, 0, 1e7) },
    daily: sanitizeDaily(raw.daily), stats: sanitizeStats(raw.stats), owned: shop.owned, worn: shop.worn,
    ach: uniq(asArray(raw.ach).filter(id => ids.includes(id))), passUntil, seen: { hint: asObject(raw.seen).hint === true }
  };
}

const touch = (save, patch, now) => ({ ...save, ...patch, updatedAt: now == null ? save.updatedAt : now });

function setLang(save, lang) { return lang === save.lang || (lang !== 'ar' && lang !== 'en') ? save : { ...save, lang }; }
function setMuted(save, muted) { return Boolean(muted) === save.muted ? save : { ...save, muted: Boolean(muted) }; }

/** Change one preference. Unknown keys and bad values leave the save as it was. */
function setPref(save, key, value) {
  if (!(key in save.prefs)) return save;
  const prefs = sanitizePrefs({ ...save.prefs, [key]: value });
  return JSON.stringify(prefs) === JSON.stringify(save.prefs) ? save : { ...save, prefs };
}

const addCoins = (save, n) => ({ ...save, coins: Math.max(0, save.coins + Math.floor(n)) });

/** Wipes progress, coins, purchases and records; keeps language, sound and the other settings. */
function resetProgress(save, now = 0) {
  return { ...newSave(now), lang: save.lang, muted: save.muted, prefs: save.prefs };
}

/* ---------- The quick pass: free access while save.passUntil is in the future; nothing is granted for good ---------- */
const passClock = { now: () => Date.now() };
const passActive = (save, now = passClock.now()) => Boolean(save) && save.passUntil > now;
const passRemaining = (save, now = passClock.now()) => (passActive(save, now) ? save.passUntil - now : 0);

/** Days and hours left, rounded up to the hour. */
function passSplit(ms) {
  const h = Math.max(0, Math.ceil(ms / HOUR_MS));
  return { days: Math.floor(h / 24), hours: h % 24 };
}

/** Starts a pass now. A running one is left alone; an ended one can be started again. */
const startPass = (save, now = passClock.now()) => (passActive(save, now) ? save : { ...save, passUntil: now + PASS.hours * HOUR_MS, updatedAt: now });

/** After the pass ends the worn things fall back to what is owned for good. Returns the same save when nothing changes. */
function settlePass(save, now = passClock.now()) {
  if (passActive(save, now)) return save;
  const worn = sanitizeShop(save.owned, save.worn, false).worn;
  return JSON.stringify(worn) === JSON.stringify(save.worn) && !save.passUntil ? save : { ...save, worn, passUntil: 0 };
}

/* ---------- Storage adapters ---------- */
function loadSave(storage, now = Date.now()) {
  try { return sanitizeSave(JSON.parse(storage.getItem(SAVE_KEY)), now) || newSave(now); } catch (e) { return newSave(now); }
}

function persistSave(storage, save) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch (e) { return false; }
}
