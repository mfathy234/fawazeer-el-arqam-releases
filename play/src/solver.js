/* Pure arithmetic and the uniqueness solver for the number crossword. A puzzle is a list of equations a op b = c over cells;
   some cells are blanks that the player fills from a tray of tiles. solver() counts how many different fillings satisfy every equation. */

const OPS = ['+', '−', '×', '÷'];

const evalOp = (o, a, b) => (o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : (b && a % b === 0 ? a / b : -1));

/** The value that completes an equation with one unknown. w = which of a, b, c is missing (0, 1, 2). -1 when there is none. */
function missing(o, w, a, b, c) {
  if (w === 2) return evalOp(o, a, b);
  if (o === '+') return w === 0 ? c - b : c - a;
  if (o === '−') return w === 0 ? c + b : a - c;
  if (o === '×') return w === 0 ? (b && c % b === 0 ? c / b : -1) : (a && c % a === 0 ? c / a : -1);
  return w === 0 ? c * b : (c && a % c === 0 ? a / c : -1);
}

const SOLVER_NODES = 6000;

/** ev = [[cellA, cellB, cellC, op]...], cq = per cell the equations it is in.
    Returns solve(vals, pv, pc, limit): vals = cell values (0 = empty), pv = distinct tile values, pc = how many of each. */
function makeSolver(ev, cq) {
  const ok = (vals, q) => { const a = vals[q[0]], b = vals[q[1]], c = vals[q[2]]; return !(a && b && c) || evalOp(q[3], a, b) === c; };
  return (vals, pv, pc, lim) => {
    let found = 0, nodes = 0;
    const rec = () => {
      if (found >= lim || ++nodes > SOLVER_NODES) return;
      let best = -1, bu = 9;
      for (let i = 0; i < ev.length; i++) {
        const q = ev[i], u = (vals[q[0]] ? 0 : 1) + (vals[q[1]] ? 0 : 1) + (vals[q[2]] ? 0 : 1);
        if (u && u < bu) { bu = u; best = i; }
      }
      if (best < 0) { found++; return; }
      const q = ev[best], w = !vals[q[0]] ? 0 : !vals[q[1]] ? 1 : 2, cell = q[w];
      const go = (v, pi) => { vals[cell] = v; pc[pi]--; if (cq[cell].every(j => ok(vals, ev[j]))) rec(); pc[pi]++; vals[cell] = 0; };
      if (bu === 1) {
        const need = missing(q[3], w, vals[q[0]], vals[q[1]], vals[q[2]]), pi = need > 0 ? pv.indexOf(need) : -1;
        if (pi >= 0 && pc[pi] > 0) go(need, pi);
      } else for (let pi = 0; pi < pv.length; pi++) if (pc[pi] > 0) go(pv[pi], pi);
    };
    rec();
    return nodes > SOLVER_NODES ? 9 : found;
  };
}

/** Independent check of a finished puzzle: every equation true, tray = blank answers + decoys, and exactly one filling exists.
    Returns an array of problems (empty = valid). */
function verifyPuzzle(p) {
  const bad = [];
  const val = p.cells.map(c => (c.k === 'n' ? c.v : 0));
  p.eqs.forEach((e, i) => {
    const [a, b, c] = [0, 2, 4].map(j => p.cells[e.ids[j]]);
    if (evalOp(e.op, a.v, b.v) !== c.v) bad.push('equation ' + i + ' is false');
    if (![a, b, c].every(x => x.k === 'n') || p.cells[e.ids[1]].k !== 'o' || p.cells[e.ids[3]].k !== 'e') bad.push('equation ' + i + ' has wrong cell kinds');
  });
  if (!p.eqs.every(e => [0, 2, 4].some(j => p.blanks.includes(e.ids[j])))) bad.push('an equation has no blank');
  const need = p.blanks.map(id => p.cells[id].v).sort((x, y) => x - y);
  const have = p.tray.slice().sort((x, y) => x - y);
  const rest = have.slice();
  need.forEach(v => { const i = rest.indexOf(v); if (i < 0) bad.push('tray misses ' + v); else rest.splice(i, 1); });
  if (rest.length !== p.decoys) bad.push('decoy count differs');
  const ev = p.eqs.map(e => [e.ids[0], e.ids[2], e.ids[4], e.op]), cq = p.cells.map(() => []);
  ev.forEach((q, i) => { cq[q[0]].push(i); cq[q[1]].push(i); cq[q[2]].push(i); });
  const vals = val.slice(), m = new Map();
  p.blanks.forEach(id => { vals[id] = 0; });
  p.tray.forEach(v => m.set(v, (m.get(v) || 0) + 1));
  const pv = [...m.keys()];
  const n = makeSolver(ev, cq)(vals, pv, pv.map(k => m.get(k)), 3);
  if (n !== 1) bad.push('solutions: ' + n);
  const cellSet = new Set(p.cells.map(c => c.r + ',' + c.c));
  if (cellSet.size !== p.cells.length) bad.push('overlapping cells');
  return bad;
}
