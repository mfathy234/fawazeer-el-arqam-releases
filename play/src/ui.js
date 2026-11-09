/* The shell of the game: global state UI, screen switching, the save in memory, text hydration (data-t, data-icon), toast, the shared confirm dialog,
   reduced motion (Calm) and vibration (Haptic). Screens live in screens.js, play.js, shopui.js and settingsui.js. */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

const SCREENS = ['splash', 'menu', 'books', 'issue', 'free', 'dailyScr', 'trophies', 'shop', 'settings', 'cw'];
const UI = { state: 'splash', save: null, board: null, ctx: null, book: null, shopTab: 'theme', tryOn: {}, render: {} };

/** Reduced motion: the player's choice or the phone's own setting. */
const Calm = {
  mq: null,
  on() {
    if (UI.save && UI.save.prefs.calm) return true;
    if (this.mq === null) this.mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : false;
    return Boolean(this.mq && this.mq.matches);
  }
};

/** Vibration (Android and a few browsers; iOS Safari has none). */
const Haptic = {
  can() { return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'; },
  buzz(p) { if (!this.can() || !UI.save || !UI.save.prefs.vibrate) return; try { navigator.vibrate(p); } catch (e) { /* needs a tap first */ } },
  sfx(name) { if (name === 'bad') this.buzz(35); else if (name === 'win') this.buzz([40, 30, 90]); else if (name === 'drop') this.buzz(10); }
};

const nowMs = () => passClock.now();
const passOn = () => passActive(UI.save, nowMs());

/* ---------- the save ---------- */
function setSave(next) {
  if (!next || next === UI.save) return;
  UI.save = next;
  persistSave(localStorage, next);
  refreshCoins();
}

function refreshCoins() {
  const n = nf(UI.save.coins);
  $$('.coinsVal').forEach(e => { e.textContent = n; });
  ['#menuCoins', '#cwCoins'].forEach(s => { const e = $(s); if (e) e.textContent = n; });
}

/* ---------- text and icons ---------- */
function hydrate(root = document) {
  root.querySelectorAll('[data-icon]').forEach(e => { if (!e.firstChild || e.dataset.iconDone !== e.dataset.icon) { e.innerHTML = icon(e.dataset.icon); e.dataset.iconDone = e.dataset.icon; } });
  root.querySelectorAll('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
  root.querySelectorAll('[data-tc]').forEach(e => { e.textContent = t(e.dataset.tc); });
  root.querySelectorAll('[data-t-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.tAria)); });
}

function applyLang() {
  LANG.cur = UI.save.lang;
  LANG.digits = UI.save.prefs.digits;
  document.documentElement.lang = LANG.cur;
  $('#game').dir = LANG.cur === 'ar' ? 'rtl' : 'ltr';
  $('#cw').dir = 'ltr';
  $('#cwTools').dir = LANG.cur === 'ar' ? 'rtl' : 'ltr';
  $('.caption').dir = LANG.cur === 'ar' ? 'rtl' : 'ltr';
  document.title = LANG.cur === 'ar' ? 'فوازير الأرقام · Fawazeer El Arqam' : 'Fawazeer El Arqam · فوازير الأرقام';
  hydrate();
  $('#cwGrid').setAttribute('aria-label', t('grid'));
  $('#cwHome').setAttribute('aria-label', t('home'));
  $('#cwMute').setAttribute('aria-label', t('mute'));
  $('#menuMute').setAttribute('aria-label', t('mute'));
  refreshMute();
  refreshCoins();
  refreshScreen();
}

function applyPrefs() {
  Sound.setPrefs(UI.save.prefs);
  Sound.setMuted(UI.save.muted);
  $('#game').classList.toggle('calm', Calm.on());
}

function refreshMute() {
  const html = icon(UI.save.muted ? 'soundOff' : 'soundOn');
  $('#menuMute').innerHTML = html;
  $('#cwMute').innerHTML = html;
}

function toggleMute() {
  setSave(setMuted(UI.save, !UI.save.muted));
  Sound.setMuted(UI.save.muted);
  refreshMute();
}

/* ---------- screens ---------- */
function showScreen(name) {
  SCREENS.forEach(id => $('#' + id).classList.toggle('show', id === name));
  UI.state = name === 'cw' ? 'play' : name;
  Sound.sync(UI);
  if (name === 'menu') Updater.onMenu();
}

function refreshScreen() {
  const id = SCREENS.find(s => $('#' + s).classList.contains('show'));
  const fn = UI.render[id];
  if (fn) fn();
}

function goMenu() { stopPuzzle(); showScreen('menu'); renderMenu(); }

/* ---------- toast and confirm ---------- */
let toastTimer = 0;
function toast(msg, ms = 2600) {
  const e = $('#toast');
  e.textContent = msg;
  e.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => e.classList.remove('show'), ms);
}

let confirmYes = null;
/** The one confirmation dialog. title / body / yes name the exact thing; nothing happens unless the player taps the yes button. */
function confirmAction({ title, body, yes, no, onYes }) {
  $('#confirmTitle').textContent = title;
  $('#confirmBody').textContent = body;
  $('#confirmYes').textContent = yes;
  $('#confirmNo').textContent = no || t('cancel');
  confirmYes = onYes;
  $('#confirm').classList.add('show');
  $('#confirmNo').focus({ preventScroll: true });
}

function closeConfirm() { $('#confirm').classList.remove('show'); confirmYes = null; }

function wireConfirm() {
  $('#confirmYes').addEventListener('click', () => { const fn = confirmYes; closeConfirm(); if (fn) fn(); });
  $('#confirmNo').addEventListener('click', closeConfirm);
  $('#confirm').addEventListener('click', e => { if (e.target.id === 'confirm') closeConfirm(); });
}

/* ---------- art helpers ---------- */
const wrapSvg = (vb, body) => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
const hostSvg = (pose = 'idle') => wrapSvg(TORTOISE_VB, tortoiseArt(pose, wornNow(UI.save, 'hat', nowMs()), wornNow(UI.save, 'cup', nowMs())));
const birdSvg = (pose = 'idle') => wrapSvg(SPARROW_VB, sparrowArt(pose));
const starsRow = (n, size = '') => [0, 1, 2].map(i => icon(i < n ? 'star' : 'starOff', size)).join('');
const currentTheme = () => themeNow(UI.save, nowMs());

function fmtPassLeft() {
  const s = passSplit(passRemaining(UI.save, nowMs()));
  return s.days ? t('passLeft', nf(s.days), nf(s.hours)) : t('passHours', nf(s.hours));
}
