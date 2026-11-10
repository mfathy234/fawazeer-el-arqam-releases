/* Main menu pieces of the word games: the two tabs (الأرقام / الكلمات), the four mode cards, and the strip of today's four puzzles (the number daily and the three word dailies). */

const W_CARDS = [
  { id: 'wheel', cls: 'c1', icon: 'wheel', name: 'wheelName', sub: () => t('level', nf(UI.save.words.wheel.level)) + ' · ' + t('wheelSub') },
  { id: 'riddle', cls: 'c2', icon: 'riddle', name: 'riddleName', sub: () => t('riddleNo', nf((UI.save.words.riddle.next % RIDDLES.length) + 1), nf(RIDDLES.length)) },
  { id: 'wordle', cls: 'c3', icon: 'tiles', name: 'wordleName', sub: () => (wDone('wordle') ? '✓ ' : '') + t('wordleSub') },
  { id: 'proverb', cls: 'c4', icon: 'column', name: 'proverbName', sub: () => t('pLevel', nf((UI.save.words.proverb.level % PROVERB_LIST.length) + 1), nf(PROVERB_LIST.length)) }
];

function renderWordsMenu() {
  $('#wCards').innerHTML = W_CARDS.map(c => `<button class="wcard ${c.cls}" type="button" data-wgo="${c.id}"><span class="wmi">${icon(c.icon)}</span><span class="wmt"><b>${t(c.name)}</b><small>${esc(c.sub())}</small></span></button>`).join('');
}

function renderDailyStrip() {
  const s = UI.save, today = todayKey();
  const pills = [['num', 'calendar', 'dNumbers', dailyDone(s, today)], ['wheel', 'wheel', 'dWheel', wDone('wheel')], ['riddle', 'riddle', 'dRiddle', wDone('riddle')], ['wordle', 'tiles', 'dWordle', wDone('wordle')]];
  $('#dailyStrip').innerHTML = pills.map(([id, ic, key, done]) => `<button class="wdd${done ? ' done' : ''}" type="button" data-strip="${id}" aria-label="${t(key)}${done ? ' ✓' : ''}">${icon(ic)}<span>${t(key)}</span>${done ? icon('tick') : ''}</button>`).join('');
}

function setMenuTab(tab) {
  UI.menuTab = tab === 'words' ? 'words' : 'num';
  const words = UI.menuTab === 'words';
  $('#panelNum').classList.toggle('hidden', words);
  $('#panelWords').classList.toggle('hidden', !words);
  [['tabNum', !words], ['tabWords', words]].forEach(([id, on]) => { const b = $('#' + id); b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
}

function renderMenuTabs() {
  renderWordsMenu(); renderDailyStrip(); setMenuTab(UI.menuTab);
  $('#wordStars').textContent = t('wordStars', nf(UI.save.words.stars));
}

function wireWordsMenu() {
  $('#tabNum').addEventListener('click', () => { Sound.play('click'); setMenuTab('num'); });
  $('#tabWords').addEventListener('click', () => { Sound.play('click'); setMenuTab('words'); });
  $('#wCards').addEventListener('click', e => { const b = e.target.closest('[data-wgo]'); if (b) { Sound.play('click'); openWordMode(b.dataset.wgo); } });
  $('#dailyStrip').addEventListener('click', e => {
    const b = e.target.closest('[data-strip]');
    if (!b) return;
    Sound.play('click');
    if (b.dataset.strip === 'num') openDaily(); else { UI.menuTab = 'words'; openWordMode(b.dataset.strip); }
  });
}
