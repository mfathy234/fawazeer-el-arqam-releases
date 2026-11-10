/* Word games, pure helpers: Arabic letter folding (wNorm), seeded random, and the dictionary (Dict) built from the word lists in wdata-dict.js.
   The generator, the Wordle scoring and the save rules use only this file and the data files, so node tests load them without a browser. */

const wNorm = s => String(s).replace(/[ً-ٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

const rngFor = s => mkRng(hashStr(String(s)));
function shuffled(arr, rnd = Math.random) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pickOf = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];

/** main = words the wheel generator may use (3 to 6 letters); all = every valid word (bonus words, 3 to 7 letters); ans5 = Wordle answers; guess5 = accepted Wordle guesses. Keys are folded, values keep the written form. */
const Dict = (() => {
  const OK = /^[ء-ي]+$/, HAMZA = /[ءؤئ]/;
  const main = new Map(), all = new Map();
  const put = (m, w, lo, hi) => { if (!OK.test(w)) return; const k = wNorm(w); if (k.length < lo || k.length > hi) return; if (!m.has(k)) m.set(k, w); };
  DICT_MAIN.split(/\s+/).forEach(w => { if (w) { put(main, w, 3, 6); put(all, w, 3, 7); } });
  DICT_EXTRA.split(/\s+/).forEach(w => { if (w) put(all, w, 3, 7); });
  A5.split(/\s+/).forEach(w => { if (w) put(all, w, 5, 5); });
  const seeds = [];
  main.forEach((c, k) => { if (k.length >= 4) seeds.push({ k, c }); });
  ['تلفزيون', 'كمبيوتر', 'مدرسين', 'مكتبات'].forEach(w => { all.set(wNorm(w), w); seeds.push({ k: wNorm(w), c: w }); });
  const ans5 = [], seen = new Set();
  A5.split(/\s+/).forEach(w => { if (!w || !OK.test(w)) return; const k = wNorm(w); if (k.length === 5 && !HAMZA.test(k) && !seen.has(k)) { seen.add(k); ans5.push({ k, c: w }); } });
  const guess5 = new Set();
  all.forEach((c, k) => { if (k.length === 5 && !HAMZA.test(k)) guess5.add(k); });
  return { main, all, seeds, ans5, guess5, has: k => all.has(k), canon: k => all.get(k) || k };
})();
