const CACHE_NAME = "sera-brendon-wedding-v47-offline-trip";
const CORE_ASSETS = [
  "./","./index.html","./today.html","./essentials.html","./italian.html",
  "./verona.html","./parma.html","./ispra.html","./santa-margherita.html","./nice.html","./history.html",
  "./wedding.html","./transportation.html","./properties.html","./recommendations.html","./credits.html",
  "./styles.css","./ux.css","./city-guide.css","./script.js","./city-guide.js","./enhancements.js","./ux.js","./trip-data.js","./private.js",
  "./contacts.html","./contacts.js","./manifest.webmanifest",
  "./verona.svg","./parma.svg","./ispra.svg","./santa-margherita.svg","./beaulieu.svg",
  "./app-icon-192.png","./app-icon-512.png"
];

const OPTIONAL_REMOTE_ASSETS = [
  "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css",
  "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"
];

const cacheableResponse = response =>
  response && (response.ok || response.type === "opaque");

const cacheCore = async () => {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
  await Promise.allSettled(OPTIONAL_REMOTE_ASSETS.map(url => cache.add(url)));
};

self.addEventListener("install", event => {
  event.waitUntil(cacheCore());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_TRIP") return;
  event.waitUntil((async () => {
    await cacheCore();
    event.source?.postMessage?.({type:"OFFLINE_READY", cache:CACHE_NAME});
  })());
});

const cacheMatch = async request => {
  const direct = await caches.match(request,{ignoreSearch:true});
  if (direct) return direct;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return null;
  const local = url.pathname.replace(/^.*\/Italy-Wedding-Trip-SeraAndBrendon1010\//,"./");
  return caches.match(local,{ignoreSearch:true});
};

const networkFirst = async request => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (cacheableResponse(fresh) && new URL(request.url).origin === self.location.origin) {
      cache.put(request,fresh.clone()).catch(()=>{});
    }
    return fresh;
  } catch {
    return await cacheMatch(request);
  }
};

const cacheFirstRuntime = async request => {
  const cached = await cacheMatch(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (cacheableResponse(response)) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request,response.clone()).catch(()=>{});
  }
  return response;
};

const runtimeRemoteHost = host =>
  host === "cdn.jsdelivr.net" ||
  host === "fonts.googleapis.com" ||
  host === "fonts.gstatic.com" ||
  host === "commons.wikimedia.org" ||
  host === "upload.wikimedia.org";

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    if (url.origin !== self.location.origin) return;
    event.respondWith((async () => {
      let response = await networkFirst(event.request);
      if (!response) {
        response = await caches.match("./today.html") || await caches.match("./index.html");
      }
      return response;
    })());
    return;
  }

  if (url.origin !== self.location.origin) {
    if (runtimeRemoteHost(url.hostname) &&
        ["style","script","font","image"].includes(event.request.destination)) {
      event.respondWith(cacheFirstRuntime(event.request).catch(() => new Response("",{status:504,statusText:"Offline"})));
    }
    return;
  }

  if (/\.(?:js|css|webmanifest)$/i.test(url.pathname) || url.pathname.endsWith("/private-trip.enc")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirstRuntime(event.request).catch(() => cacheMatch(event.request)));
});
