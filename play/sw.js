/* Service worker. tools/build-web.mjs stamps BUILD and FILES (every file as name?v=BUILD); serving game/ directly runs in dev mode (no precache, network only).
   index.html, navigations and version.json are network-first; ?v= URLs are cache-first; the cache is named after the build and old ones are deleted on activate. */
/*build:start*/
const BUILD = '1edd8f0ce0a6';
const FILES = ["./","art/core.js?v=1edd8f0ce0a6","art/hats.js?v=1edd8f0ce0a6","art/items.js?v=1edd8f0ce0a6","art/sparrow.js?v=1edd8f0ce0a6","art/sprites.js?v=1edd8f0ce0a6","art/tiles.js?v=1edd8f0ce0a6","art/tortoise.js?v=1edd8f0ce0a6","art/world.js?v=1edd8f0ce0a6","fonts/cairo-arabic-400-normal.woff2?v=1edd8f0ce0a6","fonts/cairo-arabic-700-normal.woff2?v=1edd8f0ce0a6","fonts/cairo-latin-400-normal.woff2?v=1edd8f0ce0a6","fonts/cairo-latin-700-normal.woff2?v=1edd8f0ce0a6","fonts/lalezar-arabic-400-normal.woff2?v=1edd8f0ce0a6","fonts/lalezar-latin-400-normal.woff2?v=1edd8f0ce0a6","icons/apple-touch-icon.png?v=1edd8f0ce0a6","icons/favicon-48.png?v=1edd8f0ce0a6","icons/icon-192.png?v=1edd8f0ce0a6","icons/icon-512.png?v=1edd8f0ce0a6","icons/icon-maskable-512.png?v=1edd8f0ce0a6","manifest.webmanifest?v=1edd8f0ce0a6","og.png?v=1edd8f0ce0a6","src/audio.js?v=1edd8f0ce0a6","src/board.js?v=1edd8f0ce0a6","src/data.js?v=1edd8f0ce0a6","src/gen.js?v=1edd8f0ce0a6","src/i18n.js?v=1edd8f0ce0a6","src/input.js?v=1edd8f0ce0a6","src/main.js?v=1edd8f0ce0a6","src/meta.js?v=1edd8f0ce0a6","src/play.js?v=1edd8f0ce0a6","src/render.js?v=1edd8f0ce0a6","src/save.js?v=1edd8f0ce0a6","src/screens.js?v=1edd8f0ce0a6","src/settingsui.js?v=1edd8f0ce0a6","src/shop.js?v=1edd8f0ce0a6","src/shopui.js?v=1edd8f0ce0a6","src/solver.js?v=1edd8f0ce0a6","src/ui.js?v=1edd8f0ce0a6","src/update.js?v=1edd8f0ce0a6","style.css?v=1edd8f0ce0a6"];
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
