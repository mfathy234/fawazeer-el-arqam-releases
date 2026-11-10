/* Service worker. tools/build-web.mjs stamps BUILD and FILES (every file as name?v=BUILD); serving game/ directly runs in dev mode (no precache, network only).
   index.html, navigations and version.json are network-first; ?v= URLs are cache-first; the cache is named after the build and old ones are deleted on activate. */
/*build:start*/
const BUILD = 'e9d13765ec0b';
const FILES = ["./","art/core.js?v=e9d13765ec0b","art/hats.js?v=e9d13765ec0b","art/items.js?v=e9d13765ec0b","art/sparrow.js?v=e9d13765ec0b","art/sprites.js?v=e9d13765ec0b","art/tiles.js?v=e9d13765ec0b","art/tortoise.js?v=e9d13765ec0b","art/world.js?v=e9d13765ec0b","fonts/cairo-arabic-400-normal.woff2?v=e9d13765ec0b","fonts/cairo-arabic-700-normal.woff2?v=e9d13765ec0b","fonts/cairo-latin-400-normal.woff2?v=e9d13765ec0b","fonts/cairo-latin-700-normal.woff2?v=e9d13765ec0b","fonts/lalezar-arabic-400-normal.woff2?v=e9d13765ec0b","fonts/lalezar-latin-400-normal.woff2?v=e9d13765ec0b","icons/apple-touch-icon.png?v=e9d13765ec0b","icons/favicon-48.png?v=e9d13765ec0b","icons/icon-192.png?v=e9d13765ec0b","icons/icon-512.png?v=e9d13765ec0b","icons/icon-maskable-512.png?v=e9d13765ec0b","manifest.webmanifest?v=e9d13765ec0b","og.png?v=e9d13765ec0b","src/audio.js?v=e9d13765ec0b","src/board.js?v=e9d13765ec0b","src/data.js?v=e9d13765ec0b","src/gen.js?v=e9d13765ec0b","src/i18n.js?v=e9d13765ec0b","src/input.js?v=e9d13765ec0b","src/main.js?v=e9d13765ec0b","src/meta.js?v=e9d13765ec0b","src/play.js?v=e9d13765ec0b","src/render.js?v=e9d13765ec0b","src/save.js?v=e9d13765ec0b","src/screens.js?v=e9d13765ec0b","src/settingsui.js?v=e9d13765ec0b","src/shop.js?v=e9d13765ec0b","src/shopui.js?v=e9d13765ec0b","src/solver.js?v=e9d13765ec0b","src/ui.js?v=e9d13765ec0b","src/update.js?v=e9d13765ec0b","src/words/proverb.js?v=e9d13765ec0b","src/words/riddle.js?v=e9d13765ec0b","src/words/wcore.js?v=e9d13765ec0b","src/words/wdata-dict.js?v=e9d13765ec0b","src/words/wdata-proverbs.js?v=e9d13765ec0b","src/words/wdata-riddles.js?v=e9d13765ec0b","src/words/wheel.js?v=e9d13765ec0b","src/words/wheelgen.js?v=e9d13765ec0b","src/words/wi18n.js?v=e9d13765ec0b","src/words/wmenu.js?v=e9d13765ec0b","src/words/wmeta.js?v=e9d13765ec0b","src/words/wordle-rules.js?v=e9d13765ec0b","src/words/wordle.js?v=e9d13765ec0b","src/words/wsave.js?v=e9d13765ec0b","src/words/wslots.js?v=e9d13765ec0b","src/words/wutil.js?v=e9d13765ec0b","style.css?v=e9d13765ec0b","words.css?v=e9d13765ec0b"];
/*build:end*/
const CACHE = 'fawazeer-' + BUILD;
const DEV = BUILD === 'dev';

self.addEventListener('install', e => {
  if (DEV) { self.skipWaiting(); return; }
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const put = (req, res) => { if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => null); } };

const networkFirst = (req, key) => fetch(req, { cache: 'no-store' }).then(res => { put(key || req, res); return res; })
  .catch(() => caches.match(key || req, { ignoreSearch: !key }).then(hit => hit || Response.error()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || DEV) return;
  const file = url.pathname.split('/').pop();
  if (req.mode === 'navigate' || file === '' || file === 'index.html') {
    e.respondWith(networkFirst(new Request(req.url, { cache: 'no-store' }), new Request(new URL('./', location.href).href)));
    return;
  }
  if (file === 'version.json' || file === 'sw.js') return;
  if (url.searchParams.get('v') === BUILD) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { put(req, res); return res; })));
    return;
  }
  e.respondWith(networkFirst(req));
});
