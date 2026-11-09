/* Pure shop rules: tile themes, hats for Haj Salhafa and cafe cups. Kinds are the keys of SHOP_KINDS (theme, hat, cup).
   "held" = bought for good; "owns" = held or free to use while the quick pass runs. */

const shopItem = (kind, id) => (SHOP_KINDS[kind] || []).find(x => x.id === id) || null;
const heldItem = (save, kind, id) => Boolean(save.owned[kind]) && save.owned[kind].includes(id);
const ownsItem = (save, kind, id, now = passClock.now()) => Boolean(shopItem(kind, id)) && (heldItem(save, kind, id) || passActive(save, now));

/** The id worn right now for a kind: the saved one if it can still be used, else the free default. */
function wornNow(save, kind, now = passClock.now()) {
  const id = save.worn[kind];
  return ownsItem(save, kind, id, now) ? id : SHOP_DEFAULTS[kind];
}

/** { ok, reason } where reason is 'unknown' | 'held' | 'coins'. */
function canBuy(save, kind, id) {
  const it = shopItem(kind, id);
  if (!it) return { ok: false, reason: 'unknown' };
  if (heldItem(save, kind, id)) return { ok: false, reason: 'held' };
  if (save.coins < it.price) return { ok: false, reason: 'coins' };
  return { ok: true, reason: '' };
}

/** Buys and wears an item. Returns the same save when it cannot be bought. */
function buyItem(save, kind, id, now = 0) {
  if (!canBuy(save, kind, id).ok) return save;
  const it = shopItem(kind, id);
  return {
    ...save, coins: save.coins - it.price, updatedAt: now || save.updatedAt,
    owned: { ...save.owned, [kind]: [...save.owned[kind], id] }, worn: { ...save.worn, [kind]: id }
  };
}

/** Wears an item you own (or any item while the pass runs). */
function wearItem(save, kind, id, now = passClock.now()) {
  if (!ownsItem(save, kind, id, now) || save.worn[kind] === id) return save;
  return { ...save, worn: { ...save.worn, [kind]: id } };
}

/** How many things were bought beyond the free defaults. */
const boughtCount = save => Object.keys(SHOP_KINDS).reduce((n, k) => n + save.owned[k].filter(id => id !== SHOP_DEFAULTS[k]).length, 0);

/** The theme object in use. */
const themeNow = (save, now) => shopItem('theme', wornNow(save, 'theme', now));
