const CACHE_NAME = "sera-brendon-wedding-v2";
const CORE_ASSETS = [
  "./","./index.html","./recommendations.html","./styles.css","./script.js","./today.html",
  "./verona.html","./parma.html","./ispra.html","./santa-margherita.html","./nice.html",
  "./wedding.html","./transportation.html","./credits.html","./verona.svg","./parma.svg",
  "./ispra.svg","./santa-margherita.svg","./beaulieu.svg","./app-icon-192.png","./app-icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match("./index.html"))));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    })));
  }
});