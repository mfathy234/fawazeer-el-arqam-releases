/* The shop (المحل): tile themes, hats for Haj Salhafa and cafe cups, bought with coins. Tap an item to try it on the pinned preview;
   buying asks first and names the item. Rules are in shop.js; with the quick pass everything can be worn for free. */

const SHOP_KIND_IDS = ['theme', 'hat', 'cup'];

function openShop() { UI.tryOn = {}; showScreen('shop'); renderShop(); }

const shownId = kind => UI.tryOn[kind] || wornNow(UI.save, kind, nowMs());

function itemPic(kind, it) {
  if (kind === 'theme') return tileSvg(it, 12);
  if (kind === 'hat') return wrapSvg('-44 -56 88 70', hatArt(it.id));
  return wrapSvg('-30 -66 60 76', cupArt(it.id));
}

function renderStage() {
  const th = themeById(shownId('theme'));
  $('#shopStage').innerHTML = `<div class="host-art">${wrapSvg(TORTOISE_VB, tortoiseArt('idle', shownId('hat'), shownId('cup')))}</div>` +
    `<div class="tile-pair"><div class="row3">${tileSvg(th, 7)}${stampSvg('+')}</div><div class="row3">${tileSvg(th, 5)}${stampSvg('=')}</div></div>`;
}

function itemState(kind, it) {
  const s = UI.save, owns = ownsItem(s, kind, it.id, nowMs()), inUse = wornNow(s, kind, nowMs()) === it.id;
  if (inUse) return { label: t('inUse'), disabled: true, sub: it.price ? t('owned') : t('free0') };
  if (owns) return { label: t('wearBtn', itemName(it)), disabled: false, sub: heldItem(s, kind, it.id) ? t('owned') : t('free0') };
  const need = it.price - s.coins;
  return { label: t('buyBtn', itemName(it)), disabled: need > 0, sub: need > 0 ? t('priceTag', nf(it.price)) + ' · ' + t('needCoins', nf(need)) : t('priceTag', nf(it.price)) };
}

function renderShop() {
  const s = UI.save, kind = UI.shopTab;
  $('#shopTabs').innerHTML = SHOP_KIND_IDS.map(k => `<button type="button" role="tab" data-kind="${k}" class="${k === kind ? 'on' : ''}" aria-selected="${k === kind}">${t('tab_' + k)}</button>`).join('');
  renderStage();
  const list = $('#shopList');
  list.innerHTML = '';
  SHOP_KINDS[kind].forEach(it => {
    const st = itemState(kind, it), row = el('div', 'item' + (UI.tryOn[kind] === it.id ? ' try' : ''));
    row.innerHTML = `<div class="pic">${itemPic(kind, it)}</div><div class="meta"><b>${itemName(it)}</b><small>${st.sub}</small></div>`;
    const btn = el('button', 'btn' + (st.disabled ? '' : ' mustard'), st.label);
    btn.type = 'button'; btn.disabled = st.disabled;
    btn.addEventListener('click', e => { e.stopPropagation(); onItemButton(kind, it); });
    row.append(btn);
    row.addEventListener('click', () => { UI.tryOn = { ...UI.tryOn, [kind]: it.id }; Sound.play('click'); renderStage(); $$('#shopList .item').forEach(n => n.classList.remove('try')); row.classList.add('try'); });
    list.append(row);
  });
  hydrate($('#shop'));
}

function onItemButton(kind, it) {
  const s = UI.save;
  if (ownsItem(s, kind, it.id, nowMs())) {
    setSave(wearItem(s, kind, it.id, nowMs()));
    UI.tryOn = { ...UI.tryOn, [kind]: undefined };
    Sound.play('click');
    renderShop();
    return;
  }
  if (!canBuy(s, kind, it.id).ok) { Sound.play('bad'); return; }
  const name = itemName(it);
  confirmAction({
    title: t('buyTitle', name), body: t('buyBody', nf(it.price), nf(s.coins)), yes: t('buyBtn', name), no: t('cancel'),
    onYes: () => {
      const bought = buyItem(UI.save, kind, it.id, nowMs());
      const g = afterShop(bought);
      setSave(g.save);
      UI.tryOn = {};
      Sound.play('buy');
      toast(t('bought', name));
      g.earned.forEach(id => setTimeout(() => toast(t('trophyToast', achName(id))), 1400));
      renderShop();
    }
  });
}

function wireShop() {
  $('#shopBack').addEventListener('click', () => { Sound.play('click'); goMenu(); });
  $('#shopTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-kind]');
    if (!b) return;
    UI.shopTab = b.dataset.kind; Sound.play('click'); renderShop();
  });
  UI.render.shop = renderShop;
}
