/* Word games, shared UI furniture: the mode registry and navigation, sounds, the host and sparrow, bars, modals (help, win card), the leave / pay confirmations.
   The word games use the same save (UI.save), shop looks, sounds, confirm dialog and language as the number puzzles; nothing here duplicates them. */

const WSCREENS = { wheel: 'wWheel', riddle: 'wRiddle', wordle: 'wWordle', proverb: 'wProverb' };
const WMODS = {};
const isWordScreen = id => Object.values(WSCREENS).includes(id);
const wReg = m => { WMODS[m.id] = m; m.el = document.getElementById(WSCREENS[m.id]); UI.render[WSCREENS[m.id]] = () => { if (m.ready) m.build(); }; };

const WSND = { tap: 'click', pick: 'pick', flip: 'shuffle', good: 'ok', bonus: 'coin', bad: 'bad', hint: 'hint', win: 'win', stars: 'stars' };
const wSnd = name => Sound.play(WSND[name] || name);

const elh = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wToday = () => todayKey();
const wDone = id => wDailyDone(UI.save, id, wToday());
const wIsEn = () => LANG.cur === 'en';
const wRestart = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

/* ---------- navigation ---------- */
function openWordMode(id) {
  const m = WMODS[id];
  UI.wmode = id;
  showScreen(WSCREENS[id]);
  m.ready = true;
  m.open();
}

function wStopAll() { Object.values(WMODS).forEach(m => { if (m.stop) m.stop(); }); wCloseModals(); }

function wHome() { UI.menuTab = 'words'; goMenu(); }

/** The back button of every word screen: asks first when a puzzle is half done. */
function wBack() {
  const m = WMODS[UI.wmode];
  if (m && m.dirty && m.dirty()) wConfirmLeave(m); else wHome();
}

function wConfirmLeave(m) {
  const name = m.leaveName();
  confirmAction({ title: t('leaveTitle', name), body: t('leaveBody'), yes: t('leaveYes', name), no: t('leaveNo'), onYes: wHome });
}

/** Promise form of the shared confirm: resolves true on the yes button, false when dismissed. title and yes name the exact thing. */
const wAsk = (title, body, yes) => new Promise(res => confirmAction({ title, body, yes, no: t('cancel'), onYes: () => res(true), onNo: () => res(false) }));

/** Pays a hint or reveal: asks (naming the price), then takes the coins. Resolves true when paid. */
async function wPay(cost, titleKey, bodyKey, yesKey) {
  if (UI.save.coins < cost) { toast(t('noCoins')); wSnd('bad'); return false; }
  if (!(await wAsk(t(titleKey), t(bodyKey), t(yesKey)))) return false;
  setSave(addCoins(UI.save, -cost));
  return true;
}

/** Stores a finished puzzle's result and returns the trophy notes for the win card. */
function wApply(res) {
  setSave(res.save);
  return res.earned.map(id => `<p class="wnote">${esc(t('trophyToast', achName(id)))}</p>`).join('');
}

/* ---------- host and sparrow ---------- */
const wHostHTML = () => `<div class="whostbox"><div class="host-art beat">${hostSvg('idle')}</div><div class="wbub" role="status" aria-live="polite"></div></div>`;

function wHost(root) {
  const art = $('.host-art', root), bub = $('.wbub', root);
  let poseTimer = 0, bubTimer = 0;
  return {
    say(text, pose = 'idle', ms = 2200) {
      art.innerHTML = hostSvg(pose);
      if (text) { bub.textContent = text; bub.classList.add('show'); }
      clearTimeout(poseTimer); poseTimer = setTimeout(() => { art.innerHTML = hostSvg('idle'); }, ms > 0 ? Math.min(ms, 1400) : 1200);
      clearTimeout(bubTimer); if (ms > 0) bubTimer = setTimeout(() => bub.classList.remove('show'), ms + 800);
    }
  };
}

const wBird = pose => `<span class="wsp">${birdSvg(pose)}</span>`;

/** The sparrow flies from `from` (an element) to `to` (an element), then calls done. */
function wFlyBird(from, to, done) {
  if (!from || !to || Calm.on()) { done(); return; }
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), host = $('#game').getBoundingClientRect();
  const f = elh('div', 'wflyer', birdSvg('fly0'));
  f.style.cssText = `left:${a.left - host.left}px;top:${a.top - host.top}px;width:${a.width}px;height:${a.height}px`;
  $('#game').appendChild(f);
  let wing = 0;
  const flap = setInterval(() => { wing ^= 1; f.innerHTML = birdSvg(wing ? 'fly1' : 'fly0'); }, 120);
  requestAnimationFrame(() => { f.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.6)`; });
  setTimeout(() => { clearInterval(flap); f.remove(); done(); }, 620);
}

/* ---------- bar, tabs ---------- */
function wBar(titleKey) {
  return `<div class="wbar"><button class="round" type="button" data-wback aria-label="${t('menu')}">${icon('home')}</button><h2 class="wbt">${esc(t(titleKey))}</h2>
    <div class="bar-right"><span class="chip" aria-label="${t('coins')}">${icon('coin')}<b class="coinsVal">${nf(UI.save.coins)}</b></span>
    <button class="round" type="button" data-whelp aria-label="${t('help')}">${icon('help')}</button></div></div>`;
}

const wTabs = (tabs, cur) => `<div class="wtabs" role="tablist">${tabs.map(([id, label]) => `<button class="wtab${id === cur ? ' on' : ''}" type="button" role="tab" aria-selected="${id === cur}" data-wtab="${id}">${label}</button>`).join('')}</div>`;

/** Wires the tabs: picking another one asks first when the current puzzle is half done. */
function wWireTabs(m, cur, change) {
  $$('[data-wtab]', m.el).forEach(b => {
    b.onclick = async () => {
      if (b.dataset.wtab === cur) return;
      if (m.dirty() && !(await wAsk(t('leaveTitle', m.leaveName()), t('leaveBody'), t('leaveYes', m.leaveName())))) return;
      change(b.dataset.wtab);
    };
  });
}

/* ---------- modals ---------- */
function wModal(inner, cls = '') {
  const ov = elh('div', 'ov show wm', `<div class="card ${cls}">${inner}</div>`);
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  $('#game').appendChild(ov);
  const f = $('[data-focus]', ov) || $('button', ov);
  if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
  return { el: ov, close() { ov.remove(); } };
}

const wModalOpen = () => Boolean($('#game .ov.wm'));
function wCloseModals() { $$('#game .ov.wm').forEach(e => e.remove()); }

function wHelp(titleKey, keys) {
  const m = wModal(`<h3>${t(titleKey)}</h3><ul class="whow">${keys.map(k => `<li>${t(k)}</li>`).join('')}</ul><button class="btn mustard" type="button" data-focus data-x>${t('ok')}</button>`);
  $('[data-x]', m.el).onclick = () => m.close();
  return m;
}

const wStarsRow = n => [0, 1, 2].map(i => icon(i < n ? 'star' : 'starOff').replace('<svg', `<svg style="animation-delay:${0.25 + i * 0.2}s"`)).join('');

/** Win card: o = { title, stars, coins, body (html), notes (html), next (label), onNext, menuLabel } */
function wWinCard(o) {
  wSnd(o.stars === 3 ? 'stars' : 'win'); confetti('#wFx');
  const m = wModal(`<div class="host-art small">${hostSvg('cheer')}</div><h3 class="win">${esc(o.title)}</h3>${o.stars != null ? `<div class="wstars">${wStarsRow(o.stars)}</div>` : ''}
    ${o.coins ? `<p class="wreward">+${nf(o.coins)} ${icon('coin')}</p>` : ''}${o.body || ''}<div class="notes">${o.notes || ''}</div>
    <div class="row">${o.onNext ? `<button class="btn mustard" type="button" data-focus data-next>${esc(o.next || t('next'))}</button>` : ''}<button class="btn" type="button" data-menu>${o.menuLabel || t('toMenu')}</button></div>`, 'wwin');
  $('[data-menu]', m.el).onclick = () => { m.close(); wHome(); };
  const nx = $('[data-next]', m.el);
  if (nx) nx.onclick = () => { m.close(); o.onNext(); };
  return m;
}

/* ---------- wiring ---------- */
function wireWords() {
  $('#game').addEventListener('click', e => {
    if (e.target.closest('[data-wback]')) { wSnd('tap'); wBack(); }
    else if (e.target.closest('[data-whelp]')) { const m = WMODS[UI.wmode]; if (m && m.help) m.help(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && wModalOpen() && !$('#confirm').classList.contains('show')) { wCloseModals(); e.preventDefault(); }
  });
  Object.values(WMODS).forEach(m => { if (m.wire) m.wire(); });
}

/** The Android back button on a word screen: closes a dialog first, then steps out. */
function wAndroidBack() {
  if (wModalOpen()) { wCloseModals(); return; }
  wBack();
}
