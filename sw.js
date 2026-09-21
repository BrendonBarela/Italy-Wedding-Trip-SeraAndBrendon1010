const CACHE_NAME = "sera-brendon-wedding-v28-open-access-dinner";
const CORE_ASSETS = [
  "./","./index.html","./today.html","./packing.html","./essentials.html",
  "./verona.html","./parma.html","./ispra.html","./santa-margherita.html","./nice.html",
  "./wedding.html","./transportation.html","./properties.html","./credits.html",
  "./styles.css","./ux.css","./city-guide.css","./script.js","./city-guide.js","./enhancements.js","./ux.js","./trip-data.js","./private.js","./packing.js",
  "./contacts.html","./contacts.js","./manifest.webmanifest",
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
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
const cacheMatch = async request =>
  (await caches.match(request,{ignoreSearch:true})) ||
  (await caches.match(new URL(request.url).pathname.replace(/^.*\/Italy-Wedding-Trip-SeraAndBrendon1010\//,"./"),{ignoreSearch:true}));
const networkFirst = async request => {
  const cache=await caches.open(CACHE_NAME);
  try{
    const fresh=await fetch(request);
    if(fresh&&fresh.ok&&new URL(request.url).origin===self.location.origin) cache.put(request,fresh.clone()).catch(()=>{});
    return fresh;
  }catch{return await cacheMatch(request);}
};
self.addEventListener("fetch", event => {
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{let r=await networkFirst(event.request);if(!r)r=await caches.match("./today.html")||await caches.match("./index.html");return r;})());
    return;
  }
  if(url.origin!==self.location.origin)return;
  if(/\.(?:js|css|webmanifest)$/i.test(url.pathname)||url.pathname.endsWith("/private-trip.enc")){event.respondWith(networkFirst(event.request));return;}
  event.respondWith((async()=>{const cached=await cacheMatch(event.request);if(cached)return cached;try{const r=await fetch(event.request);if(r&&r.ok)(await caches.open(CACHE_NAME)).put(event.request,r.clone()).catch(()=>{});return r;}catch{return cached;}})());
});



