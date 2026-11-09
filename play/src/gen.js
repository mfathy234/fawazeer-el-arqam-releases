/* Puzzle generator: seeded, so a booklet page or the daily puzzle is the same for everyone.
   Builds crossing equations of 5 cells (a op b = c), then removes numbers until exactly one filling remains (solver.js). */

const mkRng = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ x >>> 15, x | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; }; };
const hashStr = s => [...s].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

function makeRand(rn) {
  const int = (a, b) => a + Math.floor(rn() * (b - a + 1));
  const pick = a => a[int(0, a.length - 1)];
  const shuf = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = int(0, i); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  return { rn, int, pick, shuf };
}

/** One random equation that has v in the given role (0 = a, 2 = b, 4 = c). Returns [a, b, c, op] or null. */
function eqWith(R, role, v, ops, A, M) {
  for (const op of R.shuf(ops)) {
    const o = [];
    if (role === 4) {
      if (op === '+') for (let a = 1; a < v; a++) o.push([a, v - a, v]);
      else if (op === '−') for (let b = 1; v + b <= A; b++) o.push([v + b, b, v]);
      else if (op === '×') { for (let a = 2; a <= M; a++) if (v % a === 0 && v / a >= 2 && v / a <= M) o.push([a, v / a, v]); }
      else if (v >= 2) for (let b = 2; b <= M; b++) if (v * b <= A) o.push([v * b, b, v]);
    } else if (role === 0) {
      if (op === '+') for (let b = 1; v + b <= A; b++) o.push([v, b, v + b]);
      else if (op === '−') for (let b = 1; b < v; b++) o.push([v, b, v - b]);
      else if (op === '×') for (let b = 2; b <= M; b++) { if (v * b <= A) o.push([v, b, v * b]); }
      else for (let b = 2; b <= M; b++) if (v % b === 0 && v / b >= 2) o.push([v, b, v / b]);
    } else {
      if (op === '+') for (let a = 1; a + v <= A; a++) o.push([a, v, a + v]);
      else if (op === '−') for (let c = 1; c + v <= A; c++) o.push([v + c, v, c]);
      else if (v >= 2 && v <= M) { if (op === '×') for (let a = 2; a <= M; a++) o.push([a, v, a * v]); else for (let c = 2; c <= M; c++) if (v * c <= A) o.push([v * c, v, c]); }
    }
    if (o.length) { const e = R.pick(o); return [e[0], e[1], e[2], op]; }
  }
  return null;
}

/** The crossing layout: equations grow from a first one, each new one crossing an existing number cell. Returns the cells or null. */
function layoutEquations(R, D, A, M, ops) {
  const nEq = R.int(D.eq[0], D.eq[1]), occ = new Map(), E = [], B = { r0: 0, r1: 0, c0: 0, c1: 0 };
  const key = (r, c) => (r + 50) * 128 + c + 50;
  const fits = (h, r, c, vs) => {
    const dr = h ? 0 : 1, dc = h ? 1 : 0;
    if (E.length) { if (Math.max(B.r1, r + 4 * dr) - Math.min(B.r0, r) + 1 > D.h || Math.max(B.c1, c + 4 * dc) - Math.min(B.c0, c) + 1 > D.w) return -1; }
    if (occ.has(key(r - dr, c - dc)) || occ.has(key(r + 5 * dr, c + 5 * dc))) return -1;
    let sh = 0;
    for (let i = 0; i < 5; i++) {
      const y = r + i * dr, x = c + i * dc, ex = occ.get(key(y, x));
      if (ex) { if (i % 2 || ex.k !== 'n' || ex.v !== vs[i] || (h ? ex.hq : ex.vq) >= 0) return -1; sh++; }
      else if (occ.has(key(y + dc, x + dr)) || occ.has(key(y - dc, x - dr))) return -1;
    }
    return sh;
  };
  const put = (h, r, c, vs) => {
    const idx = E.length;
    for (let i = 0; i < 5; i++) {
      const y = r + i * (h ? 0 : 1), x = c + i * (h ? 1 : 0), kk = key(y, x);
      let ex = occ.get(kk);
      if (!ex) { ex = { r: y, c: x, k: i % 2 ? (i === 1 ? 'o' : 'e') : 'n', v: vs[i], hq: -1, vq: -1 }; occ.set(kk, ex); }
      if (h) ex.hq = idx; else ex.vq = idx;
    }
    if (!E.length) { B.r0 = r; B.c0 = c; B.r1 = r + (h ? 0 : 4); B.c1 = c + (h ? 4 : 0); }
    else { B.r0 = Math.min(B.r0, r); B.c0 = Math.min(B.c0, c); B.r1 = Math.max(B.r1, r + (h ? 0 : 4)); B.c1 = Math.max(B.c1, c + (h ? 4 : 0)); }
    E.push(1);
  };
  for (let k = 0; k < 30 && !E.length; k++) {
    const role = R.pick([0, 2, 4]), v = 1 + Math.floor(Math.pow(R.rn(), 1.4) * (A - 1)), e = eqWith(R, role, v, ops, A, M);
    if (e) put(true, 0, 0, [e[0], e[3], e[1], '=', e[2]]);
  }
  if (!E.length) return null;
  for (let tries = 0; E.length < nEq && tries < 500; tries++) {
    const cands = [...occ.values()].filter(x => x.k === 'n' && (x.hq < 0) !== (x.vq < 0));
    const p = R.pick(cands), h = p.hq < 0, role = R.pick([0, 2, 4]), e = eqWith(R, role, p.v, ops, A, M);
    if (!e) continue;
    const vs = [e[0], e[3], e[1], '=', e[2]], r = p.r - (h ? 0 : role), c = p.c - (h ? role : 0);
    if (fits(h, r, c, vs) > 0) put(h, r, c, vs);
  }
  return E.length < nEq ? null : [...occ.values()];
}

/** Equations in placement order: a cell's hq / vq are the equation indices, so group the cells of each index in line order. */
function collectEquations(cells) {
  const lines = new Map();
  const add = (k, x) => { if (!lines.has(k)) lines.set(k, []); lines.get(k).push(x); };
  cells.forEach(x => { if (x.hq >= 0) add('h' + x.hq, x); if (x.vq >= 0) add('v' + x.vq, x); });
  return [...lines.entries()].sort((p, q) => Number(p[0].slice(1)) - Number(q[0].slice(1)))
    .map(([, cs]) => { const ids = cs.sort((x, y) => x.r - y.r || x.c - y.c).map(x => x.id); return { ids, op: cells[ids[1]].v }; });
}

function tryGen(R, D, A, M, ops, attempt) {
  const raw = layoutEquations(R, D, A, M, ops);
  if (!raw) return null;
  const cells = raw.sort((x, y) => x.r - y.r || x.c - y.c);
  const R0 = Math.min(...cells.map(x => x.r)), C0 = Math.min(...cells.map(x => x.c));
  cells.forEach((x, i) => { x.id = i; x.r -= R0; x.c -= C0; });
  const eqs = collectEquations(cells);
  const nums = cells.filter(x => x.k === 'n').map(x => x.id);
  const ev = eqs.map(e => [e.ids[0], e.ids[2], e.ids[4], e.op]), cq = cells.map(() => []);
  ev.forEach((q, i) => { cq[q[0]].push(i); cq[q[1]].push(i); cq[q[2]].push(i); });
  const solve = makeSolver(ev, cq), truth = new Int32Array(cells.length);
  cells.forEach(x => { if (x.k === 'n') truth[x.id] = x.v; });
  const uniq = (bl, extra) => {
    const vals = truth.slice(), m = new Map();
    bl.forEach(id => { vals[id] = 0; m.set(truth[id], (m.get(truth[id]) || 0) + 1); });
    (extra || []).forEach(v => m.set(v, (m.get(v) || 0) + 1));
    const pv = [...m.keys()];
    return solve(vals, pv, pv.map(k => m.get(k)), 2) === 1;
  };
  const bl = new Set(), tgt = R.int(D.bl[0], D.bl[1]);
  const tryAdd = id => { bl.add(id); if (uniq(bl)) return true; bl.delete(id); return false; };
  for (const e of R.shuf(eqs.map((_, i) => i))) {
    const ids = [0, 2, 4].map(j => eqs[e].ids[j]);
    if (ids.some(id => bl.has(id))) continue;
    for (const id of R.shuf(ids)) if (tryAdd(id)) break;
  }
  for (const id of R.shuf(nums)) { if (bl.size >= tgt) break; if (!bl.has(id)) tryAdd(id); }
  if (eqs.some(e => ![0, 2, 4].some(j => bl.has(e.ids[j])))) return null;
  if (bl.size < Math.max(3, D.bl[0] - Math.floor(attempt / 6))) return null;
  const extra = [], nd = R.int(D.dec[0], D.dec[1]);
  for (let k = 0, n = 0; k < nd && n < 8; n++) { const v = clampN(truth[R.pick(nums)] + R.int(-3, 3), 1, A); if (uniq(bl, extra.concat(v))) { extra.push(v); k++; } }
  return {
    cells: cells.map(x => ({ id: x.id, r: x.r, c: x.c, k: x.k, v: x.v })), eqs, blanks: [...bl].sort((a, b) => a - b),
    tray: R.shuf([...bl].map(id => truth[id]).concat(extra)),
    rows: Math.max(...cells.map(x => x.r)) + 1, cols: Math.max(...cells.map(x => x.c)) + 1, decoys: extra.length
  };
}

/** One puzzle for a difficulty id, grade index and seed. Returns null when this seed finds nothing (makePuzzle always finds one). */
function gen(diff, grade, seed) {
  const D = DIFFS[diff], g = GRADES[grade], ops = g.M ? ['+', '−', '×', '÷'] : ['+', '−'];
  const R = makeRand(mkRng(seed));
  for (let at = 0; at < 90; at++) {
    const p = tryGen(R, D, g.A, g.M, ops, at);
    if (p) return Object.assign(p, { diff, grade, seed, tries: at + 1 });
  }
  return null;
}

/** Always returns a puzzle: a seed that finds nothing moves on to the next one, deterministically. */
function makePuzzle(diff, grade, seed) {
  for (let k = 0; k < 40; k++) { const p = gen(diff, grade, (seed + k * 7919) >>> 0); if (p) return p; }
  return null;
}

const bookDiff = idx => (idx < BOOKLET.tiers.medium ? 'easy' : idx < BOOKLET.tiers.hard ? 'medium' : 'hard');
const bookById = id => BOOKLETS.find(b => b.id === id) || null;
const bookPuzzle = (bookId, idx) => makePuzzle(bookDiff(idx), bookById(bookId).grade, hashStr('fz:' + bookId + ':' + idx));
const dailyPuzzle = dateKey => makePuzzle(DAILY.diff, DAILY.grade, hashStr('fz:daily:' + dateKey));
const freePuzzle = (diff, grade, seed) => makePuzzle(diff, grade, seed >>> 0);
