const CACHE_NAME = "sera-brendon-wedding-v7";
const CORE_ASSETS = [
  "./","./index.html","./today.html","./recommendations.html","./essentials.html",
  "./verona.html","./parma.html","./ispra.html","./santa-margherita.html","./nice.html",
  "./wedding.html","./transportation.html","./credits.html",
  "./styles.css","./ux.css","./script.js","./enhancements.js","./ux.js","./trip-data.js","./private.js",
  "./private-trip.enc","./manifest.webmanifest",
  "./verona.svg","./parma.svg","./ispra.svg","./santa-margherita.svg","./beaulieu.svg",
  "./app-icon-192.png","./app-icon-512.png"
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

const cacheMatch = async request =>
  (await caches.match(request, {ignoreSearch:true})) || (await caches.match(new URL(request.url).pathname.replace(/^.*\/Italy-Wedding-Trip-SeraAndBrendon1010\//,"./"), {ignoreSearch:true}));

const networkFirst = async request => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && new URL(request.url).origin === self.location.origin) {
      cache.put(request, fresh.clone()).catch(()=>{});
    }
    return fresh;
  } catch {
    return await cacheMatch(request);
  }
};

const enhanceHtml = async response => {
  if (!response) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  let html = await response.clone().text();

  if (!html.includes('rel="manifest"')) {
    html = html.replace(/<\/head>/i,'<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="app-icon-192.png" sizes="192x192" type="image/png"></head>');
  }
  if (!html.includes("trip-data.js")) html = html.replace(/<\/body>/i,'<script src="trip-data.js?v=1"></script></body>');
  if (!html.includes("private.js")) html = html.replace(/<\/body>/i,'<script src="private.js?v=1"></script></body>');

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("content-type","text/html; charset=utf-8");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
};

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith((async()=>{
      let response = await networkFirst(event.request);
      if (!response) response = await caches.match("./today.html") || await caches.match("./index.html");
      return enhanceHtml(response);
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  const freshFirst = /\.(?:js|css|webmanifest)$/i.test(url.pathname) || url.pathname.endsWith("/private-trip.enc");
  if (freshFirst) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith((async()=>{
    const cached = await cacheMatch(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request,response.clone()).catch(()=>{});
      }
      return response;
    } catch {
      return cached;
    }
  })());
});