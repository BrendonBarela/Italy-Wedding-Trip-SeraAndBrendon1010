(() => {
  "use strict";
  const injectStyle=()=>{
    if(document.getElementById("sb-enhancement-styles"))return;
    const s=document.createElement("style");s.id="sb-enhancement-styles";s.textContent=`
      @media (max-width:760px){html body .site-header nav#site-nav.single-trip-nav{max-height:calc(100dvh - 86px)!important;overflow-y:auto!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}}
      .sb-update-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;width:min(620px,calc(100% - 28px));display:flex;gap:12px;align-items:center;justify-content:space-between;padding:13px 14px;background:#3f3028;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:14px;box-shadow:0 18px 45px rgba(30,20,16,.28);font:600 .82rem Inter,system-ui,sans-serif}
      .sb-update-toast button{border:0;border-radius:999px;padding:9px 12px;background:#fff;color:#5b4034;font:800 .78rem Inter,system-ui,sans-serif;cursor:pointer}`;
    document.head.appendChild(s);
  };
  const ensurePwaMetadata=()=>{
    if(!document.querySelector('link[rel="manifest"]')){const l=document.createElement("link");l.rel="manifest";l.href="manifest.webmanifest";document.head.appendChild(l);}
    if(!document.querySelector('meta[name="mobile-web-app-capable"]')){const m=document.createElement("meta");m.name="mobile-web-app-capable";m.content="yes";document.head.appendChild(m);}
  };
  const ensurePackingNavigation=()=>{
    const nav=document.getElementById("site-nav");if(!nav||nav.querySelector('a[href="packing.html"]'))return;
    const a=document.createElement("a");a.href="packing.html";a.textContent="Packing";
    const today=nav.querySelector('a[href="today.html"]');
    if(today&&today.nextSibling)nav.insertBefore(a,today.nextSibling);else if(today)nav.appendChild(a);else nav.prepend(a);
  };
  const showUpdate=()=>{
    if(document.getElementById("sb-update-toast"))return;
    const t=document.createElement("div");t.id="sb-update-toast";t.className="sb-update-toast";t.innerHTML='<span><strong>Trip update available.</strong> Refresh for the newest plans.</span><button type="button">Refresh</button>';
    t.querySelector("button").onclick=()=>location.reload();document.body.appendChild(t);
  };
  const registerSW=()=>{
    if(!("serviceWorker" in navigator))return;
    const had=Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register("./sw.js").then(reg=>{
      reg.update().catch(()=>{});
      if(reg.waiting&&had)showUpdate();
      reg.addEventListener("updatefound",()=>{const w=reg.installing;if(!w)return;w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)showUpdate();});});
    }).catch(()=>{});
  };
  const setupInstall=()=>{
    const b=document.getElementById("install-app-button"),h=document.getElementById("install-app-help");if(!b)return;
    let prompt=null;const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
    if(standalone){b.textContent="Wedding app installed ✓";b.disabled=true;if(h)h.textContent="Open Sera & Brendon from your home screen or app drawer.";return;}
    addEventListener("beforeinstallprompt",e=>{e.preventDefault();prompt=e;if(h)h.textContent="Ready to install. Tap Install wedding app.";});
    b.addEventListener("click",async()=>{if(prompt){prompt.prompt();await prompt.userChoice;prompt=null;return;}if(h)h.innerHTML='On Android Chrome: <strong>⋮ → Install and create shortcut → Install</strong>. On iPhone Safari: <strong>Share → Add to Home Screen</strong>.';});
  };
  injectStyle();ensurePwaMetadata();ensurePackingNavigation();setupInstall();registerSW();
})();

