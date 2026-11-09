/* Service worker. tools/build-web.mjs stamps BUILD and FILES (every file as name?v=BUILD); serving game/ directly runs in dev mode (no precache, network only).
   index.html, navigations and version.json are network-first; ?v= URLs are cache-first; the cache is named after the build and old ones are deleted on activate. */
/*build:start*/
const BUILD = '60a96eaf6e9b';
const FILES = ["./","art/core.js?v=60a96eaf6e9b","art/hats.js?v=60a96eaf6e9b","art/items.js?v=60a96eaf6e9b","art/sparrow.js?v=60a96eaf6e9b","art/sprites.js?v=60a96eaf6e9b","art/tiles.js?v=60a96eaf6e9b","art/tortoise.js?v=60a96eaf6e9b","art/world.js?v=60a96eaf6e9b","fonts/cairo-arabic-400-normal.woff2?v=60a96eaf6e9b","fonts/cairo-arabic-700-normal.woff2?v=60a96eaf6e9b","fonts/cairo-latin-400-normal.woff2?v=60a96eaf6e9b","fonts/cairo-latin-700-normal.woff2?v=60a96eaf6e9b","fonts/lalezar-arabic-400-normal.woff2?v=60a96eaf6e9b","fonts/lalezar-latin-400-normal.woff2?v=60a96eaf6e9b","icons/apple-touch-icon.png?v=60a96eaf6e9b","icons/favicon-48.png?v=60a96eaf6e9b","icons/icon-192.png?v=60a96eaf6e9b","icons/icon-512.png?v=60a96eaf6e9b","icons/icon-maskable-512.png?v=60a96eaf6e9b","manifest.webmanifest?v=60a96eaf6e9b","og.png?v=60a96eaf6e9b","src/audio.js?v=60a96eaf6e9b","src/board.js?v=60a96eaf6e9b","src/data.js?v=60a96eaf6e9b","src/gen.js?v=60a96eaf6e9b","src/i18n.js?v=60a96eaf6e9b","src/input.js?v=60a96eaf6e9b","src/main.js?v=60a96eaf6e9b","src/meta.js?v=60a96eaf6e9b","src/play.js?v=60a96eaf6e9b","src/render.js?v=60a96eaf6e9b","src/save.js?v=60a96eaf6e9b","src/screens.js?v=60a96eaf6e9b","src/settingsui.js?v=60a96eaf6e9b","src/shop.js?v=60a96eaf6e9b","src/shopui.js?v=60a96eaf6e9b","src/solver.js?v=60a96eaf6e9b","src/ui.js?v=60a96eaf6e9b","src/update.js?v=60a96eaf6e9b","style.css?v=60a96eaf6e9b"];
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
