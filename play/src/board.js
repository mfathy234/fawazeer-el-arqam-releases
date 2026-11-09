/* One puzzle being played: tiles, which blank holds which tile, undo, hints, mistakes and the state of every equation.
   Pure rules (no DOM). The board object is the one mutable thing in the game: functions edit it in place and return what happened,
   so the UI can animate it. Equation state st[i]: '' = not full, 'o' = true, 'b' = false. */

function newBoard(p) {
  const ce = p.cells.map(() => []);
  p.eqs.forEach((e, i) => e.ids.forEach(id => ce[id].push(i)));
  return {
    p, ce, bl: new Set(p.blanks), tiles: p.tray.map((v, i) => ({ id: i, v, at: -1 })), order: p.tray.map((_, i) => i),
    ct: new Map(), lock: new Set(), sel: -1, undo: [], mist: 0, hints: 0, moves: 0, time: 0, st: p.eqs.map(() => ''), won: false
  };
}

const boardCell = (B, id) => B.p.cells[id];
const isBlank = (B, id) => B.bl.has(id);
function cellValue(B, id) {
  if (!isBlank(B, id)) return boardCell(B, id).v;
  const t = B.ct.get(id);
  return t == null ? 0 : B.tiles[t].v;
}
const trayTiles = B => B.order.map(i => B.tiles[i]).filter(x => x.at === -1);
const solvedCount = B => B.st.filter(s => s === 'o').length;
const hintCost = B => (B.hints < STARS.freeHints ? 0 : STARS.hintCost);

/** Applies a list of [tileId, from, to] moves. */
function applyMoves(B, moves) {
  moves.forEach(([, f]) => { if (f >= 0) B.ct.delete(f); });
  moves.forEach(([id, , to]) => { B.tiles[id].at = to; if (to >= 0) B.ct.set(to, id); });
}

/** Re-checks every equation. user = the player caused it (counts mistakes). Returns the equation indices that just became true / false. */
function evalBoard(B, user) {
  const pops = [], bads = [];
  B.p.eqs.forEach((e, i) => {
    const a = cellValue(B, e.ids[0]), b = cellValue(B, e.ids[2]), c = cellValue(B, e.ids[4]);
    const s = a && b && c ? (evalOp(e.op, a, b) === c ? 'o' : 'b') : '';
    if (s === B.st[i]) return;
    if (s === 'o') pops.push(i);
    if (s === 'b' && user) { bads.push(i); B.mist++; }
    B.st[i] = s;
  });
  return { pops, bads };
}

const boardDone = B => B.st.every(s => s === 'o');

/** Moves a tile to a blank (cid >= 0) or back to the tray (cid = -1). A tile already there swaps into the first tile's old place. */
function placeTile(B, tid, cid) {
  if (B.won) return null;
  const tl = B.tiles[tid];
  if (!tl || tl.at === cid || (cid >= 0 && (B.lock.has(cid) || !isBlank(B, cid)))) return null;
  const other = cid >= 0 ? B.ct.get(cid) : null, moves = [];
  if (other != null) moves.push([other, cid, tl.at]);
  moves.push([tid, tl.at, cid]);
  applyMoves(B, moves);
  B.undo.push(moves); B.moves++; B.sel = -1;
  const r = evalBoard(B, true);
  return { ...r, done: boardDone(B), landed: cid >= 0 ? tid : -1 };
}

function undoMove(B) {
  if (B.won) return null;
  const moves = B.undo.pop();
  if (!moves) return null;
  applyMoves(B, moves.map(([id, f, to]) => [id, to, f]));
  B.sel = -1;
  const r = evalBoard(B, false);
  return { ...r, done: boardDone(B), landed: -1 };
}

/** Puts one correct tile in a blank and locks it. pick(list) chooses among candidates. Does not charge coins (see hintCost). */
function hintMove(B, pick) {
  if (B.won) return null;
  const bad = B.p.blanks.filter(id => !B.lock.has(id) && (B.ct.get(id) == null || B.tiles[B.ct.get(id)].v !== boardCell(B, id).v));
  if (!bad.length) return null;
  const empty = bad.filter(id => B.ct.get(id) == null), cid = pick(empty.length ? empty : bad), v = boardCell(B, cid).v;
  const tl = trayTiles(B).find(x => x.v === v) || B.tiles.find(x => x.at >= 0 && !B.lock.has(x.at) && x.v === v && boardCell(B, x.at).v !== v);
  if (!tl) return null;
  const moves = [], oc = B.ct.get(cid);
  if (oc != null) moves.push([oc, cid, -1]);
  moves.push([tl.id, tl.at, cid]);
  applyMoves(B, moves);
  B.lock.add(cid); B.hints++; B.undo = []; B.sel = -1;
  const r = evalBoard(B, false);
  return { ...r, done: boardDone(B), landed: tl.id, cell: cid };
}

function shuffleOrder(B, shuf) { B.order = shuf(B.order); }

/** Back to the start of the same puzzle (hints and mistakes are kept out: a restart is a fresh try). */
function restartBoard(B) { const fresh = newBoard(B.p); Object.keys(fresh).forEach(k => { B[k] = fresh[k]; }); }

/** Marks the board won and returns what recordSolve needs. */
function finishBoard(B) { B.won = true; B.sel = -1; return { diff: B.p.diff, grade: B.p.grade, mist: B.mist, hints: B.hints, time: B.time }; }
