/* Boot: load the save, apply language and settings, wire every screen, show the splash, then the menu. */

function boot() {
  UI.save = settlePass(loadSave(localStorage, nowMs()), nowMs());
  applyLang();
  applyPrefs();
  wireConfirm(); wireMenu(); wireScreens(); wireShop(); wireSettings(); wirePlay(); wireInput();
  $('#splashHost').innerHTML = hostSvg('idle');
  hydrate();
  Updater.init();
  const ready = (document.fonts && document.fonts.ready) || Promise.resolve();
  const wait = new Promise(r => setTimeout(r, 650));
  Promise.all([ready, wait]).catch(() => null).then(() => { showScreen('menu'); renderMenu(); });
  setInterval(() => { const s = UI.save; if (s.passUntil && !passActive(s, nowMs())) { setSave(settlePass(s, nowMs())); if (UI.state === 'menu') renderMenu(); } }, 30000);
}

boot();
