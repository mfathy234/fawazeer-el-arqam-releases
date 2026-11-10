/* The letter-wheel crossword generator (pure, seeded): picks a seed word whose letters form the wheel, lays out the words that can be spelled from them
   as a crossing grid, and verify() re-proves a puzzle (fits the dictionary, letters, crossings, no accidental runs). cfgFor(level) gives the size per level. */

const WheelGen = (() => {
  const N = 15, key = (r, c) => r * 32 + c;
  const counts = k => { const c = {}; for (const ch of k) c[ch] = (c[ch] || 0) + 1; return c; };
  const formable = (wk, sc) => { const c = {}; for (const ch of wk) { c[ch] = (c[ch] || 0) + 1; if (c[ch] > (sc[ch] || 0)) return false; } return true; };
  const cfgFor = L => (L <= 2 ? { lMin: 4, lMax: 5, wMin: 3, wMax: 4, maxDim: 6 } : L <= 5 ? { lMin: 5, lMax: 5, wMin: 4, wMax: 5, maxDim: 6 }
    : L <= 10 ? { lMin: 5, lMax: 6, wMin: 5, wMax: 6, maxDim: 7 } : L <= 20 ? { lMin: 6, lMax: 6, wMin: 6, wMax: 7, maxDim: 8 } : { lMin: 6, lMax: 7, wMin: 7, wMax: 8, maxDim: 9 });

  function tryLayout(pool, rnd, target, maxDim, shortQuota) {
    const g = new Map(), placed = [], used = new Set();
    let r0 = 7, r1 = 7, c0 = 3, c1 = 3;
    const put = (w, r, c, d) => { for (let i = 0; i < w.k.length; i++) g.set(key(r + (d ? i : 0), c + (d ? 0 : i)), w.k[i]); placed.push({ w, r, c, d }); used.add(w.k); const L = w.k.length; r0 = Math.min(r0, r); c0 = Math.min(c0, c); r1 = Math.max(r1, r + (d ? L - 1 : 0)); c1 = Math.max(c1, c + (d ? 0 : L - 1)); };
    put(pool[0], 7, 3, 0); r1 = 7; c1 = 3 + pool[0].k.length - 1; r0 = 7; c0 = 3;
    const rest = shuffled(pool.slice(1), rnd);
    let shorts = pool[0].k.length === 3 ? 1 : 0;
    const valid = (w, r, c, d) => {
      const dr = d ? 1 : 0, dc = d ? 0 : 1, L = w.k.length;
      if (r < 0 || c < 0 || r + dr * (L - 1) >= N || c + dc * (L - 1) >= N) return null;
      if (g.has(key(r - dr, c - dc)) || g.has(key(r + dr * L, c + dc * L))) return null;
      let ov = 0, prev = false;
      for (let i = 0; i < L; i++) {
        const rr = r + dr * i, cc = c + dc * i, ex = g.get(key(rr, cc));
        if (ex !== undefined) { if (ex !== w.k[i] || prev) return null; ov++; prev = true; }
        else { prev = false; if (g.has(key(rr + dc, cc + dr)) || g.has(key(rr - dc, cc - dr))) return null; }
      }
      if (ov === 0 || ov === L) return null;
      const nr0 = Math.min(r0, r), nc0 = Math.min(c0, c), nr1 = Math.max(r1, r + dr * (L - 1)), nc1 = Math.max(c1, c + dc * (L - 1));
      const h = nr1 - nr0 + 1, wd = nc1 - nc0 + 1; if (h > maxDim || wd > maxDim) return null;
      return ov * 3 - 0.4 * h * wd - Math.abs(h - wd) * 0.3;
    };
    while (placed.length < target) {
      let best = null, bs = -1e9;
      for (const w of rest) {
        if (used.has(w.k) || (w.k.length === 3 && shorts >= shortQuota)) continue;
        for (const [ck, letter] of g) {
          const cr = Math.floor(ck / 32), cc = ck % 32;
          for (let i = 0; i < w.k.length; i++) {
            if (w.k[i] !== letter) continue;
            for (let d = 0; d < 2; d++) {
              const r = cr - (d ? i : 0), c = cc - (d ? 0 : i), s = valid(w, r, c, d);
              if (s !== null) { const sc = s + rnd() * 2.5; if (sc > bs) { bs = sc; best = { w, r, c, d }; } }
            }
          }
        }
      }
      if (!best) break;
      if (best.w.k.length === 3) shorts++;
      put(best.w, best.r, best.c, best.d);
    }
    return { placed, r0, c0, r1, c1 };
  }

  function build(seed, lay) {
    const rows = lay.r1 - lay.r0 + 1, cols = lay.c1 - lay.c0 + 1;
    const words = lay.placed.map(p => ({ k: p.w.k, c: p.w.c, r: p.r - lay.r0, col: p.c - lay.c0, d: p.d }));
    return { rows, cols, words, seedK: seed.k, seedC: seed.c };
  }

  /** Returns a list of problems (empty = the puzzle is valid). */
  function verify(P) {
    const errs = [], sc = counts(P.seedK), seen = new Set(), g = [];
    for (let r = 0; r < P.rows; r++) g.push(Array(P.cols).fill(''));
    if (P.rows > 9 || P.cols > 9) errs.push('size');
    if (P.words.length < 3) errs.push('few words');
    P.words.forEach(w => {
      if (!Dict.main.has(w.k)) errs.push('not in dictionary ' + w.k);
      if (!formable(w.k, sc)) errs.push('not formable ' + w.k);
      if (seen.has(w.k)) errs.push('duplicate ' + w.k); seen.add(w.k);
      for (let i = 0; i < w.k.length; i++) {
        const r = w.r + (w.d ? i : 0), c = w.col + (w.d ? 0 : i);
        if (r >= P.rows || c >= P.cols) { errs.push('out of bounds'); continue; }
        if (g[r][c] && g[r][c] !== w.k[i]) errs.push('crossing mismatch ' + w.k);
        g[r][c] = w.k[i];
      }
    });
    const starts = new Set(P.words.map(w => `${w.r},${w.col},${w.d},${w.k.length}`));
    let runs = 0;
    for (let d = 0; d < 2; d++) {
      const A1 = d ? P.cols : P.rows, A2 = d ? P.rows : P.cols;
      for (let a = 0; a < A1; a++) {
        let b = 0;
        while (b < A2) {
          const at = (x) => (d ? g[x][a] : g[a][x]);
          if (!at(b)) { b++; continue; }
          let e = b; while (e < A2 && at(e)) e++;
          if (e - b >= 2) { runs++; const r = d ? b : a, c = d ? a : b; if (!starts.has(`${r},${c},${d},${e - b}`)) errs.push(`accidental run at ${r},${c}`); }
          b = e;
        }
      }
    }
    if (runs !== P.words.length) errs.push(`runs ${runs} != words ${P.words.length}`);
    // every word crosses another one
    P.words.forEach(w => { let cross = false; for (let i = 0; i < w.k.length; i++) { const r = w.r + (w.d ? i : 0), c = w.col + (w.d ? 0 : i); if (P.words.some(o => o !== w && o.d !== w.d && cellIn(o, r, c))) cross = true; } if (!cross) errs.push('no crossing ' + w.k); });
    return errs;
  }
  function cellIn(w, r, c) { return w.d ? (c === w.col && r >= w.r && r < w.r + w.k.length) : (r === w.r && c >= w.col && c < w.col + w.k.length); }

  const dbg = { small: 0, short: 0, err: null };
  function gen(rnd, cfg) {
    const bases = Dict.seeds.filter(s => s.k.length <= cfg.lMax && s.k.length >= Math.max(4, cfg.lMin - 2)), EXTRA = Array.from('اااللمنريويتبسهكد');
    const mainList = Array.from(Dict.main, ([k, c]) => ({ k, c }));
    let fallback = null;
    for (let attempt = 0; attempt < 120; attempt++) {
      const need = attempt < 50 ? cfg.wMin : attempt < 90 ? Math.max(4, cfg.wMin - 1) : 3;
      const base = pickOf(bases, rnd), L = Math.max(base.k.length, cfg.lMin + Math.floor(rnd() * (cfg.lMax - cfg.lMin + 1)));
      let sk = base.k; while (sk.length < L) sk += pickOf(EXTRA, rnd);
      const seed = { k: sk, c: base.c }, sc = counts(seed.k);
      const pool = mainList.filter(w => formable(w.k, sc));
      if (pool.length < need) { dbg.small++; continue; }
      pool.sort((a, b) => b.k.length - a.k.length || rnd() - 0.5);
      const target = Math.min(pool.length, cfg.wMin + Math.floor(rnd() * (cfg.wMax - cfg.wMin + 1)));
      const quota = Math.max(1, Math.floor(target / (cfg.lMin >= 6 ? 3 : 2)));
      let bestLay = null;
      for (let tries = 0; tries < 10; tries++) {
        const lay = tryLayout(pool, rnd, target, cfg.maxDim, quota + (attempt > 60 ? 3 : 0));
        if (!bestLay || lay.placed.length > bestLay.placed.length) bestLay = lay;
        if (lay.placed.length >= target) break;
      }
      if (bestLay.placed.length >= need) {
        const P = build(seed, bestLay); const er = verify(P);
        if (!er.length) return finish(P, seed); dbg.err = er;
      } else if (dbg.short++ >= 0 && bestLay.placed.length >= 3 && !fallback) { const P = build(seed, bestLay); if (!verify(P).length) fallback = finish(P, seed); }
    }
    return fallback;
  }
  function finish(P, seed) {
    const hasTa = seed.c.indexOf('ة') >= 0;
    P.wheel = Array.from(seed.k).map(k => ({ k, d: k === 'ه' && hasTa ? 'ة' : k }));
    return P;
  }
  return { gen, verify, cfgFor, cellIn, dbg };
})();
