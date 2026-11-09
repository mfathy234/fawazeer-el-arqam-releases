/* Puzzle input: drag a tile with mouse or touch (a ghost follows the finger, the nearest slot lights up), tap a tile then a slot, or use the keyboard
   (arrows move between slots and tiles, Enter / Space picks and drops, Esc cancels or leaves, M mutes). All moves go through movePlace() in play.js. */

let drag = null;

function cellAt(x, y) {
  let best = -1, bd = 1e9;
  $$('#cwGrid [data-slot]').forEach(e => {
    const r = e.getBoundingClientRect(), d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)), inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    const dd = inside ? 0 : d;
    if (dd < bd && (inside || d < r.width * 0.62)) { bd = dd; best = +e.dataset.slot; }
  });
  return best;
}

function onDown(e) {
  const B = UI.board;
  if (!B || B.won || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const node = e.target.closest('[data-tile]');
  if (!node) return;
  e.preventDefault();
  drag = { id: +node.dataset.tile, x0: e.clientX, y0: e.clientY, pid: e.pointerId, el: node, on: false, touch: e.pointerType !== 'mouse', gx: 0, gy: 0, lx: e.clientX };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}

function ghostMove(e) {
  const s = UI.cell * 1.1, lift = drag.touch ? s * 0.5 : 0;
  drag.gx = e.clientX; drag.gy = e.clientY - lift;
  const tilt = clampN((e.clientX - drag.lx) * 0.5, -14, 14);
  drag.lx = e.clientX;
  drag.g.style.transform = `translate(${drag.gx - s / 2}px,${drag.gy - s / 2}px)`;
  drag.g.firstChild.style.rotate = tilt + 'deg';
}

function onMove(e) {
  if (!drag || e.pointerId !== drag.pid) return;
  if (!drag.on) {
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
    drag.on = true;
    const g = el('div', 'ghost'), s = UI.cell * 1.1;
    g.style.width = g.style.height = s + 'px';
    g.innerHTML = '<div class="gi">' + drag.el.innerHTML + '</div>';
    $('#cw').appendChild(g);
    drag.g = g; drag.el.classList.add('dragging');
    Sound.play('pick');
  }
  ghostMove(e);
  const c = cellAt(drag.gx, drag.gy);
  if (c !== drag.hot) {
    $$('#cwGrid .hot').forEach(n => n.classList.remove('hot'));
    drag.hot = c;
    const n = c >= 0 && $(`#cwGrid [data-slot="${c}"]`);
    if (n) n.classList.add('hot');
  }
  const b = $('#cwBoard').getBoundingClientRect();
  if (e.clientY < b.top + 36) $('#cwBoard').scrollTop -= 8; else if (e.clientY > b.bottom - 36 && e.clientY < b.bottom + 40) $('#cwBoard').scrollTop += 8;
}

function onUp(e) {
  if (!drag || (e && e.pointerId !== drag.pid)) return;
  const d = drag;
  endDrag(false);
  const B = UI.board;
  if (!B) return;
  if (!d.on) { if (e && e.type === 'pointerup') tapTile(d.id); return; }
  const tl = B.tiles[d.id], dropped = e && e.type === 'pointerup', to = dropped ? cellAt(d.gx, d.gy) : -1;
  let target;
  if (to >= 0) target = $(`#cwGrid [data-slot="${to}"]`).getBoundingClientRect();
  else target = (tl.at >= 0 ? $('#cwTray') : d.el).getBoundingClientRect();
  flyGhost(d.g, target.left + target.width / 2, target.top + target.height / 2, UI.cell * 1.1);
  if (to >= 0) movePlace(d.id, to);
  else if (tl.at >= 0 && dropped) { movePlace(d.id, -1); Sound.play('click'); }
  else renderBoard();
}

function flyGhost(g, x, y, s) {
  if (!g) return;
  g.classList.add('fly');
  g.style.transform = `translate(${x - s / 2}px,${y - s / 2}px)`;
  g.firstChild.style.rotate = '0deg';
  setTimeout(() => g.remove(), 210);
}

function endDrag(removeGhost) {
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerup', onUp);
  window.removeEventListener('pointercancel', onUp);
  $$('#cwGrid .hot').forEach(n => n.classList.remove('hot'));
  if (removeGhost && drag && drag.g) drag.g.remove();
  const d = drag;
  drag = null;
  if (d && d.el) d.el.classList.remove('dragging');
  if (removeGhost) $$('.ghost').forEach(n => n.remove());
}

/** Tap a tile: select it; tap it again to drop the selection; tap another tile in a slot to swap with the selected one. */
function tapTile(tid) {
  const B = UI.board;
  if (!B || B.won) return;
  const tl = B.tiles[tid];
  if (B.sel < 0 || B.sel === tid) B.sel = B.sel === tid ? -1 : tid;
  else if (tl.at >= 0) { movePlace(B.sel, tl.at); return; }
  else B.sel = tid;
  Sound.play('click');
  say(B.sel >= 0 ? t('sel') : t('tip'), 'tip');
  renderBoard();
}

function activate(node) {
  const B = UI.board;
  if (node.dataset.slot != null) {
    const cid = +node.dataset.slot, tid = B.ct.get(cid);
    if (B.sel >= 0 && B.sel !== tid) movePlace(B.sel, cid); else if (tid != null) tapTile(tid);
  } else if (node.dataset.tile != null) tapTile(+node.dataset.tile);
}

function navigate(node, dx, dy) {
  const from = node.getBoundingClientRect(), fx = from.left + from.width / 2, fy = from.top + from.height / 2;
  let best = null, bd = 1e9;
  $$('#cwGrid [data-slot]').forEach(n => {
    if (n === node) return;
    const r = n.getBoundingClientRect(), ax = r.left + r.width / 2 - fx, ay = r.top + r.height / 2 - fy;
    if ((dx && ax * dx <= 2) || (dy && ay * dy <= 2)) return;
    const d = dx ? Math.abs(ax) + Math.abs(ay) * 3 : Math.abs(ay) + Math.abs(ax) * 3;
    if (d < bd) { bd = d; best = n; }
  });
  if (best) best.focus({ preventScroll: false });
  else if (dy > 0 && node.dataset.slot != null) { const tl = $('#cwTray .tile'); if (tl) tl.focus(); }
  else if (dy < 0 && node.classList.contains('tile')) { const g = $('#cwGrid [data-slot]'); if (g) g.focus(); }
}

function onKey(e) {
  const k = e.key;
  if (k === 'm' || k === 'M') { toggleMute(); return; }
  if ($('#confirm').classList.contains('show')) { if (k === 'Escape') closeConfirm(); return; }
  if (UI.state !== 'play') return;
  const B = UI.board;
  if (k === 'Escape') { e.preventDefault(); if (B && B.sel >= 0) { B.sel = -1; renderBoard(); } else leavePuzzle(); return; }
  const node = document.activeElement;
  if (!B || B.won || !node || (node.dataset.slot == null && !node.classList.contains('tile'))) return;
  if (k === 'Enter' || k === ' ') { e.preventDefault(); activate(node); return; }
  const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
  if (!dir) return;
  e.preventDefault();
  if (node.classList.contains('tile')) {
    const sib = $$('#cwTray .tile'), i = sib.indexOf(node);
    if (dir[0]) (sib[i + dir[0]] || node).focus(); else navigate(node, 0, dir[1]);
  } else navigate(node, dir[0], dir[1]);
}

function wireInput() {
  $('#cwGrid').addEventListener('pointerdown', onDown);
  $('#cwTray').addEventListener('pointerdown', onDown);
  $('#cwGrid').addEventListener('click', e => { const c = e.target.closest('.slot.blank'); const B = UI.board; if (c && B && B.sel >= 0) movePlace(B.sel, +c.dataset.slot); });
  $('#cwTray').addEventListener('click', e => { const B = UI.board; if (!e.target.closest('.tile') && B && B.sel >= 0 && B.tiles[B.sel].at >= 0) movePlace(B.sel, -1); });
  document.addEventListener('keydown', onKey);
}
