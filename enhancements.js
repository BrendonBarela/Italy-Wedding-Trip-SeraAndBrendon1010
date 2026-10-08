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
      .sb-install-promo{position:relative;z-index:90;display:flex;align-items:center;justify-content:center;gap:16px;padding:13px 18px;background:linear-gradient(135deg,#6f4e3d,#4d352b);color:#fff;box-shadow:0 5px 18px rgba(50,35,25,.18);font-family:Inter,system-ui,sans-serif}
      .sb-install-promo-inner{width:min(1120px,100%);display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:13px}
      .sb-install-promo-icon{width:48px;height:48px;border-radius:12px;box-shadow:0 3px 12px rgba(0,0,0,.22);background:#fff}
      .sb-install-promo-copy strong{display:block;font-size:1rem;line-height:1.2;letter-spacing:.01em}
      .sb-install-promo-copy span{display:block;margin-top:3px;font-size:.78rem;line-height:1.35;color:rgba(255,255,255,.82)}
      .sb-install-promo button{border:1px solid rgba(255,255,255,.8);border-radius:999px;padding:11px 16px;background:#fff;color:#5b4034;font:800 .82rem Inter,system-ui,sans-serif;white-space:nowrap;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.14)}
      .sb-install-promo button:active{transform:translateY(1px)}
      .sb-install-promo-help{grid-column:2 / -1;font-size:.72rem;color:rgba(255,255,255,.74);line-height:1.35;min-height:0}
      @media(max-width:640px){.sb-install-promo{padding:11px 12px}.sb-install-promo-inner{grid-template-columns:auto 1fr;gap:9px 10px}.sb-install-promo-icon{width:42px;height:42px}.sb-install-promo-copy strong{font-size:.92rem}.sb-install-promo-copy span{font-size:.72rem}.sb-install-promo button{grid-column:1 / -1;width:100%;padding:11px 14px}.sb-install-promo-help{grid-column:1 / -1;text-align:center}}
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
    let prompt=null;
    const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
    const ua=navigator.userAgent||"";
    const isIOS=/iPad|iPhone|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
    const isIOSSafari=isIOS&&/Safari/i.test(ua)&&!/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

    let b=document.getElementById("install-app-button");
    let h=document.getElementById("install-app-help");

    if(standalone){
      b?.remove();
      h?.remove();
      document.getElementById("sb-install-promo")?.remove();
      return;
    }

    let promo=document.getElementById("sb-install-promo");
    if(!promo){
      promo=document.createElement("section");
      promo.id="sb-install-promo";
      promo.className="sb-install-promo";
      promo.setAttribute("aria-label","Install wedding app");
      promo.innerHTML=`<div class="sb-install-promo-inner">
        <img class="sb-install-promo-icon" src="app-icon-192.png" alt="" width="48" height="48">
        <div class="sb-install-promo-copy"><strong>Put the Wedding App on your phone</strong><span>Open the itinerary, wedding schedule and transport in one tap.</span></div>
        <button id="sb-global-install-button" type="button">${isIOS?"Add to iPhone":"Install App"}</button>
        <div id="sb-global-install-help" class="sb-install-promo-help" aria-live="polite"></div>
      </div>`;
      const header=document.querySelector(".site-header");
      if(header)header.insertAdjacentElement("afterend",promo);else document.body.prepend(promo);
    }

    const globalButton=promo.querySelector("#sb-global-install-button");
    const globalHelp=promo.querySelector("#sb-global-install-help");

    if(b){
      b.style.display="none";
      if(h)h.style.display="none";
    }

    const showIOSInstallHelp=()=>{
      document.getElementById("sb-ios-install-help")?.remove();
      const overlay=document.createElement("div");
      overlay.id="sb-ios-install-help";
      overlay.setAttribute("role","dialog");
      overlay.setAttribute("aria-modal","true");
      overlay.setAttribute("aria-labelledby","sb-ios-install-title");
      overlay.style.cssText="position:fixed;inset:0;z-index:10001;background:rgba(35,27,23,.62);display:flex;align-items:flex-end;justify-content:center;padding:18px;";
      const safariNote=isIOSSafari
        ?"Apple requires one final system step on iPhone:"
        :"Open this page in Safari first. Apple requires one final system step:";
      overlay.innerHTML=`
        <div style="width:min(100%,520px);background:#fffaf6;border-radius:22px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.28);color:#3e302a;font-family:Inter,system-ui,sans-serif;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
            <div><div style="font-size:.74rem;text-transform:uppercase;letter-spacing:.12em;color:#8b6d5e;font-weight:700;">Install on iPhone</div><h2 id="sb-ios-install-title" style="margin:5px 0 8px;font-family:'Cormorant Garamond',Georgia,serif;font-size:2rem;line-height:1;">Almost there</h2></div>
            <button type="button" data-close-ios-install aria-label="Close" style="border:0;background:#efe2d8;border-radius:999px;width:38px;height:38px;font-size:1.35rem;color:#5b4438;">×</button>
          </div>
          <p style="margin:0 0 12px;color:#6b554a;line-height:1.5;">${safariNote}</p>
          <div style="padding:14px;border-radius:14px;background:#f3e8df;font-weight:700;line-height:1.55;">Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> → <strong>Add</strong>.</div>
          <p style="margin:12px 0 0;color:#80685b;font-size:.82rem;line-height:1.45;">iOS does not allow a website button to trigger this installer directly. Once added, it opens full-screen like an app and uses the wedding-app icon.</p>
          <button type="button" data-close-ios-install style="margin-top:16px;width:100%;border:0;border-radius:12px;background:#6f4e3d;color:white;padding:13px 16px;font-weight:700;font-size:1rem;">Close</button>
        </div>`;
      overlay.addEventListener("click",e=>{if(e.target===overlay||e.target.closest("[data-close-ios-install]"))overlay.remove();});
      document.body.appendChild(overlay);
      overlay.querySelector("[data-close-ios-install]")?.focus();
    };

    addEventListener("beforeinstallprompt",e=>{
      e.preventDefault();
      prompt=e;
      if(globalHelp)globalHelp.textContent="Ready — tap Install App.";
    });

    const install=async()=>{
      if(isIOS){
        showIOSInstallHelp();
        return;
      }
      if(prompt){
        prompt.prompt();
        const choice=await prompt.userChoice;
        if(choice?.outcome==="accepted")promo.remove();
        prompt=null;
        return;
      }
      if(globalHelp)globalHelp.textContent="Use your browser menu and choose Install app / Add to Home screen.";
    };

    globalButton?.addEventListener("click",install);
    b?.addEventListener("click",install);
    addEventListener("appinstalled",()=>promo?.remove());
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
