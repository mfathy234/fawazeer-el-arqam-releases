/* Word games, the slot board: letter or word tiles dragged (mouse, touch) or tapped into ordered slots. Used by the riddle (letters) and the proverb column (words).
   The board only moves tiles; the mode decides what a full row means (onChange). Hint-locked slots cannot be moved. */

function SlotBoard(root, opt) {
  const slotsEl = $('.wslots', root), trayEl = $('.wtray', root);
  let items = opt.items, order = items.map(i => i.id), place = Array(opt.n).fill(-1), locked = new Set(), drag = null;
  const where = id => place.indexOf(id);
  function tileHTML(it, inSlot, lk) { return `<button type="button" class="wtile${lk ? ' lock' : ''}" data-tile="${it.id}" ${lk ? 'aria-disabled="true"' : ''}>${esc(it.label)}</button>`; }
  function render() {
    slotsEl.innerHTML = place.map((id, s) => `<div class="wslot${id >= 0 ? ' full' : ''}" data-slot="${s}">${id >= 0 ? tileHTML(items[id], true, locked.has(s)) : `<span class="wno">${opt.numbers ? nf(s + 1) : ''}</span>`}</div>`).join('');
    trayEl.innerHTML = order.filter(id => where(id) < 0).map(id => tileHTML(items[id], false, false)).join('');
    if (opt.after) opt.after();
  }
  const firstEmpty = () => place.findIndex((p, s) => p < 0 && !locked.has(s));
  function moveTo(id, slot) {
    const from = where(id);
    if (slot === 'tray') { if (from >= 0 && !locked.has(from)) place[from] = -1; return; }
    if (locked.has(slot) || (from >= 0 && locked.has(from))) return;
    if (from === slot) return;
    const occ = place[slot]; place[slot] = id; if (from >= 0) place[from] = occ;
  }
  function commit(sound) { render(); if (sound) wSnd(sound); if (opt.onChange) opt.onChange(place.slice()); }
  function tap(id) {
    const from = where(id);
    if (from >= 0) { if (locked.has(from)) return; place[from] = -1; commit('tap'); }
    else { const s = firstEmpty(); if (s < 0) return; place[s] = id; commit('pick'); }
  }
  function slotAt(x, y) { const g = drag && drag.ghost; if (g) g.style.display = 'none'; const e = document.elementFromPoint(x, y); if (g) g.style.display = ''; if (!e) return null; const s = e.closest('[data-slot]'); if (s && root.contains(s)) return +s.dataset.slot; return e.closest('.wtray') && root.contains(e.closest('.wtray')) ? 'tray' : null; }
  root.addEventListener('pointerdown', e => {
    const tl = e.target.closest('.wtile'); if (!tl || e.button > 0) return;
    const id = +tl.dataset.tile; if (locked.has(where(id))) return;
    drag = { id, x: e.clientX, y: e.clientY, moved: false, pid: e.pointerId, el: tl, touch: e.pointerType === 'touch' };
    try { tl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  root.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pid) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 7) {
      drag.moved = true; const r = drag.el.getBoundingClientRect(); drag.w = r.width; drag.h = r.height;
      const g = drag.el.cloneNode(true); g.classList.add('wghost'); const gcs = getComputedStyle(drag.el); g.style.fontFamily = gcs.fontFamily; g.style.fontSize = gcs.fontSize; g.style.width = r.width + 'px'; g.style.height = r.height + 'px'; document.body.appendChild(g); drag.ghost = g; drag.el.classList.add('dragging');
    }
    if (drag.moved) {
      const lift = drag.touch ? drag.h * 0.8 : 0;
      drag.ghost.style.left = (e.clientX - drag.w / 2) + 'px'; drag.ghost.style.top = (e.clientY - drag.h / 2 - lift) + 'px';
      $$('.wslot.over', root).forEach(s => s.classList.remove('over'));
      const s = slotAt(e.clientX, e.clientY - lift); if (typeof s === 'number') { const se = $(`[data-slot="${s}"]`, root); if (se) se.classList.add('over'); }
      e.preventDefault();
    }
  });
  const finish = (e, cancel) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag; drag = null; if (d.ghost) d.ghost.remove(); $$('.wslot.over', root).forEach(s => s.classList.remove('over'));
    if (cancel) { render(); return; }
    if (!d.moved) { tap(d.id); return; }
    const lift = d.touch ? d.h * 0.8 : 0;
    drag = { ghost: null }; const target = slotAt(e.clientX, e.clientY - lift); drag = null;
    if (target == null) { render(); return; }
    moveTo(d.id, target); commit('pick');
  };
  root.addEventListener('pointerup', e => finish(e, false));
  root.addEventListener('pointercancel', e => finish(e, true));
  root.addEventListener('click', e => { const tl = e.target.closest('.wtile'); if (tl && e.detail === 0) tap(+tl.dataset.tile); });
  root.addEventListener('contextmenu', e => { if (drag) e.preventDefault(); });
  render();
  return {
    place: () => place.slice(), order: () => order.slice(), items: () => items, render,
    setLocked(slot, id) { const from = where(id); if (from >= 0) place[from] = -1; const occ = place[slot]; place[slot] = id; locked.add(slot); void occ; commit('hint'); },
    lockedCount: () => locked.size, isLocked: s => locked.has(s),
    shuffleTray(rnd) { order = shuffled(order, rnd); render(); },
    clearUnlocked() { place = place.map((p, s) => (locked.has(s) ? p : -1)); render(); }
  };
}
