(() => {
  "use strict";

  const injectStyle=()=>{
    if(document.getElementById("sb-enhancement-styles"))return;
    const s=document.createElement("style");
    s.id="sb-enhancement-styles";
    s.textContent=`
      @media (max-width:760px){html body .site-header nav#site-nav.single-trip-nav{max-height:calc(100dvh - 86px)!important;overflow-y:auto!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}}
      .sb-update-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;width:min(620px,calc(100% - 28px));display:flex;gap:12px;align-items:center;justify-content:space-between;padding:13px 14px;background:#3f3028;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:14px;box-shadow:0 18px 45px rgba(30,20,16,.28);font:600 .82rem Inter,system-ui,sans-serif}
      .sb-update-toast button{border:0;border-radius:999px;padding:9px 12px;background:#fff;color:#5b4034;font:800 .78rem Inter,system-ui,sans-serif;cursor:pointer}
      .sb-offline-banner{position:sticky;top:0;z-index:10000;padding:8px 14px;text-align:center;background:#5b4034;color:#fff;font:750 .76rem Inter,system-ui,sans-serif;box-shadow:0 4px 16px rgba(50,35,25,.12)}
      .sb-offline-status{flex-basis:100%;display:flex;align-items:center;gap:8px;max-width:760px;padding:9px 12px;border-radius:12px;background:#edf2e8;color:#49613f;font:750 .76rem Inter,system-ui,sans-serif}
      .sb-offline-status[data-state="saving"]{background:#f4e9df;color:#6b554a}
      .sb-offline-status[data-state="needs-save"]{background:#f5eee7;color:#6b554a}
      body.sb-is-offline .visit-card img{display:none}
    `;
    document.head.appendChild(s);
  };

  const ensurePwaMetadata=()=>{
    if(!document.querySelector('link[rel="manifest"]')){
      const l=document.createElement("link");l.rel="manifest";l.href="manifest.webmanifest";document.head.appendChild(l);
    }
    if(!document.querySelector('meta[name="mobile-web-app-capable"]')){
      const m=document.createElement("meta");m.name="mobile-web-app-capable";m.content="yes";document.head.appendChild(m);
    }
  };

  const showUpdate=()=>{
    if(document.getElementById("sb-update-toast"))return;
    const t=document.createElement("div");
    t.id="sb-update-toast";
    t.className="sb-update-toast";
    t.innerHTML='<span><strong>Trip update available.</strong> Refresh for the newest plans.</span><button type="button">Refresh</button>';
    t.querySelector("button").onclick=()=>location.reload();
    document.body.appendChild(t);
  };

  const registerSW=()=>{
    if(!("serviceWorker" in navigator))return;
    const had=Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register("./sw.js").then(reg=>{
      reg.update().catch(()=>{});
      if(reg.waiting&&had)showUpdate();
      reg.addEventListener("updatefound",()=>{
        const w=reg.installing;if(!w)return;
        w.addEventListener("statechange",()=>{
          if(w.state==="installed"&&navigator.serviceWorker.controller)showUpdate();
        });
      });
    }).catch(()=>{});
  };

  const setupInstall=()=>{
    const b=document.getElementById("install-app-button");
    const h=document.getElementById("install-app-help");
    if(!b)return;
    let prompt=null;
    const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
    if(standalone){
      b.textContent="Wedding app installed ✓";
      b.disabled=true;
      if(h)h.textContent="Open Sera & Brendon from your home screen or app drawer.";
      return;
    }
    addEventListener("beforeinstallprompt",e=>{
      e.preventDefault();prompt=e;
      if(h)h.textContent="Ready to install. Tap Install wedding app.";
    });
    b.addEventListener("click",async()=>{
      if(prompt){prompt.prompt();await prompt.userChoice;prompt=null;return;}
      if(h)h.innerHTML='On Android Chrome: <strong>⋮ → Install app</strong>. On iPhone Safari: <strong>Share → Add to Home Screen</strong>.';
    });
  };

  const setupConnectivity=()=>{
    const apply=()=>{
      const offline=!navigator.onLine;
      document.body.classList.toggle("sb-is-offline",offline);
      let banner=document.getElementById("sb-offline-banner");
      if(offline&&!banner){
        banner=document.createElement("div");
        banner.id="sb-offline-banner";
        banner.className="sb-offline-banner";
        banner.textContent="Offline mode — saved trip pages still work. Live maps, weather links and outside websites need a connection.";
        document.body.prepend(banner);
      }else if(!offline&&banner){
        banner.remove();
      }
    };
    addEventListener("online",apply);
    addEventListener("offline",apply);
    apply();
  };

  const setupOfflineSave=()=>{
    const host=document.querySelector(".home-today-cta");
    if(!host||!("serviceWorker" in navigator))return;

    let button=document.getElementById("offline-save-button");
    if(!button){
      button=document.createElement("button");
      button.id="offline-save-button";
      button.className="button";
      button.type="button";
      button.textContent="Save trip offline";
      const install=document.getElementById("install-app-button");
      install?.insertAdjacentElement("afterend",button);
      if(!install)host.appendChild(button);
    }

    let status=document.getElementById("offline-save-status");
    if(!status){
      status=document.createElement("div");
      status.id="offline-save-status";
      status.className="sb-offline-status";
      status.dataset.state="needs-save";
      status.setAttribute("aria-live","polite");
      status.textContent="Checking offline copy…";
      host.appendChild(status);
    }

    const required=[
      "today.html","essentials.html","history.html","wedding.html","transportation.html",
      "verona.html","parma.html","ispra.html","santa-margherita.html","nice.html"
    ];

    const isReady=async()=>{
      if(!("caches" in window))return false;
      const results=await Promise.all(required.map(name=>caches.match(new URL(name,location.href).href,{ignoreSearch:true})));
      return results.every(Boolean);
    };

    const renderReady=()=>{
      button.textContent="Offline copy ready ✓";
      status.dataset.state="ready";
      status.textContent="Core itinerary, wedding, transport, history, phrases and destination guides are saved on this device.";
    };

    navigator.serviceWorker.ready.then(async()=>{
      if(await isReady())renderReady();
      else{
        status.dataset.state="needs-save";
        status.textContent="Tap “Save trip offline” while you have Wi-Fi or cellular service.";
      }
    }).catch(()=>{});

    button.addEventListener("click",async()=>{
      if(!navigator.onLine){
        status.dataset.state="needs-save";
        status.textContent="You're offline now. Reconnect once, then tap this button to refresh the saved copy.";
        return;
      }
      button.disabled=true;
      button.textContent="Saving…";
      status.dataset.state="saving";
      status.textContent="Saving the latest trip pages for offline use…";
      try{
        const reg=await navigator.serviceWorker.ready;
        const worker=reg.active||navigator.serviceWorker.controller;
        if(!worker)throw new Error("No active service worker");

        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(new Error("Offline save timed out")),15000);
          const handler=e=>{
            if(e.data?.type!=="OFFLINE_READY")return;
            clearTimeout(timer);
            navigator.serviceWorker.removeEventListener("message",handler);
            resolve();
          };
          navigator.serviceWorker.addEventListener("message",handler);
          worker.postMessage({type:"CACHE_TRIP"});
        });

        if(navigator.storage?.persist){
          try{await navigator.storage.persist();}catch{}
        }
        if(await isReady())renderReady();
        else throw new Error("Not all core pages are cached");
      }catch{
        button.textContent="Try offline save again";
        status.dataset.state="needs-save";
        status.textContent="The offline copy did not finish. Stay online and try again.";
      }finally{
        button.disabled=false;
      }
    });
  };

  injectStyle();
  ensurePwaMetadata();
  setupInstall();
  registerSW();
  setupConnectivity();
  setupOfflineSave();
})();
