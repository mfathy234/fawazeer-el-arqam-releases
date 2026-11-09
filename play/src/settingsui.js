/* The settings screen (الإعدادات): volumes, vibration, reduced motion, digit style, language and the reset (which names exactly what it deletes).
   Rules and the save fields are in save.js; this file draws the rows and wires them. Rows rebuild after every change. */

const buildId = () => (typeof FAWAZEER_BUILD === 'string' ? FAWAZEER_BUILD : 'dev');
const versionLine = () => 'v' + APP_VERSION + ' · ' + buildId();

function openSettings() { showScreen('settings'); renderSettings(); $('#settingsBody').scrollTop = 0; }

function changePref(key, value) { setSave(setPref(UI.save, key, value)); applyPrefs(); if (key === 'digits') applyLang(); }

function setRow(label, control, sub, cls = '') {
  const row = el('div', 'set-row ' + cls), box = el('div');
  box.append(el('b', '', label));
  if (sub) box.append(el('small', '', sub));
  row.append(box, control);
  return row;
}

function slider(key) {
  const input = el('input');
  input.type = 'range'; input.min = '0'; input.max = '100'; input.step = '5'; input.value = String(UI.save.prefs[key]);
  input.setAttribute('aria-label', t('set_' + key));
  input.addEventListener('input', () => { changePref(key, Number(input.value)); });
  input.addEventListener('change', () => { Sound.play('click'); });
  return input;
}

function toggle(key) {
  const b = el('button', 'switch' + (UI.save.prefs[key] ? ' on' : ''));
  b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(UI.save.prefs[key])); b.setAttribute('aria-label', t('set_' + key));
  b.addEventListener('click', () => { changePref(key, !UI.save.prefs[key]); Sound.play('click'); if (key === 'vibrate' && UI.save.prefs.vibrate) Haptic.buzz(30); renderSettings(); });
  return b;
}

function digitsSeg() {
  const box = el('div', 'seg');
  ['auto', 'indic', 'latin'].forEach(m => {
    const b = el('button', UI.save.prefs.digits === m ? 'on' : '', t('digits_' + m));
    b.type = 'button';
    b.addEventListener('click', () => { Sound.play('click'); changePref('digits', m); renderSettings(); });
    box.append(b);
  });
  return box;
}

function confirmReset() {
  const s = UI.save, solved = totalSolved(s) + s.free.solved, coins = s.coins, bought = boughtCount(s);
  confirmAction({
    title: t('resetTitle'), body: t('resetBody', nf(solved), nf(coins), nf(bought)), yes: t('resetYes', nf(solved), nf(coins)), no: t('cancel'),
    onYes: () => { setSave(resetProgress(UI.save, nowMs())); applyLang(); applyPrefs(); toast(t('resetDone')); renderSettings(); }
  });
}

function renderSettings() {
  const body = $('#settingsBody');
  body.innerHTML = '';
  body.append(
    setRow(t('set_music'), slider('music')), setRow(t('set_sfx'), slider('sfx')),
    setRow(t('set_vibrate'), toggle('vibrate')), setRow(t('set_calm'), toggle('calm'), t('set_calm_sub')),
    setRow(t('set_digits'), digitsSeg())
  );
  const lang = el('button', 'btn small', t('langBtn'));
  lang.type = 'button';
  lang.addEventListener('click', () => { setSave(setLang(UI.save, UI.save.lang === 'ar' ? 'en' : 'ar')); Sound.play('click'); applyLang(); });
  body.append(setRow(t('set_lang'), lang));
  const reset = el('button', 'btn small brick', t('set_reset'));
  reset.type = 'button';
  reset.addEventListener('click', confirmReset);
  body.append(setRow(t('set_reset'), reset, t('set_reset_sub'), 'danger'));
  body.append(el('p', 'ver', t('keys')), el('p', 'ver', t('credits')), el('p', 'ver', versionLine()));
  hydrate($('#settings'));
}

function wireSettings() {
  $('#settingsBack').addEventListener('click', () => { Sound.play('click'); goMenu(); });
  UI.render.settings = renderSettings;
}
