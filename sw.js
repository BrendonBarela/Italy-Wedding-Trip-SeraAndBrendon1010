const CACHE_NAME = "sera-brendon-wedding-v4";
const CORE_ASSETS = [
  "./","./index.html","./recommendations.html","./essentials.html","./enhancements.js",
  "./styles.css","./script.js","./today.html","./verona.html","./parma.html","./ispra.html",
  "./santa-margherita.html","./nice.html","./wedding.html","./transportation.html","./credits.html",
  "./verona.svg","./parma.svg","./ispra.svg","./santa-margherita.svg","./beaulieu.svg",
  "./app-icon-192.png","./app-icon-512.png","./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
  }));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
  ));
  self.clients.claim();
});

const enhanceHtml = async response => {
  if (!response) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.clone().text();
  if (!html.includes('rel="manifest"')) {
    html = html.replace(/<\/head>/i,
      '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="app-icon-192.png" sizes="192x192" type="image/png"></head>');
  }
  if (!html.includes("enhancements.js")) {
    html = html.replace(/<\/body>/i, '<script src="enhancements.js?v=4"></script></body>');
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("content-type","text/html; charset=utf-8");
  return new Response(html, {status:response.status,statusText:response.statusText,headers});
};

const networkFirst = async request => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return (await cache.match(request)) || (await caches.match(request));
  }
};

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      let response = await networkFirst(event.request);
      if (!response) response = await caches.match("./index.html");
      return enhanceHtml(response);
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  const freshFirst = /(?:enhancements\.js|script\.js|styles\.css|manifest\.webmanifest)$/i.test(url.pathname);
  if (freshFirst) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    });
  }));
});