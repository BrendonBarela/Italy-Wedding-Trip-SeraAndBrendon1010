(() => {
  "use strict";

  const currentPage = (location.pathname.split("/").pop() || "index.html").split("?")[0];

  const injectStyle = () => {
    if (document.getElementById("sb-enhancement-styles")) return;
    const style = document.createElement("style");
    style.id = "sb-enhancement-styles";
    style.textContent = `
      @media (max-width:760px){
        html body .site-header nav#site-nav.single-trip-nav{
          max-height:calc(100dvh - 86px)!important;
          overflow-y:auto!important;
          overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch;
        }
      }
      .sb-update-toast{
        position:fixed;left:50%;bottom:18px;transform:translateX(-50%);
        z-index:9999;width:min(620px,calc(100% - 28px));display:flex;gap:12px;
        align-items:center;justify-content:space-between;padding:13px 14px;
        background:#3f3028;color:#fff;border:1px solid rgba(255,255,255,.18);
        border-radius:14px;box-shadow:0 18px 45px rgba(30,20,16,.28);
        font:600 .82rem Inter,system-ui,sans-serif;
      }
      .sb-update-toast button{
        flex:0 0 auto;border:0;border-radius:999px;padding:9px 12px;
        background:#fff;color:#5b4034;font:800 .78rem Inter,system-ui,sans-serif;cursor:pointer;
      }
      .reservation-plan{
        margin-top:.85rem;padding:.72rem .8rem;border-radius:12px;
        background:#f8f1ea;border:1px solid #e7d7c9;
      }
      .reservation-plan strong{display:block;color:#6f4e3d;font-size:.78rem;margin-bottom:.18rem}
      .reservation-plan span{display:block;color:#65564e;font-size:.78rem;line-height:1.45}
      .reservation-plan a{
        display:inline-flex;margin-top:.55rem;padding:.48rem .7rem;border-radius:999px;
        background:#6f4e3d;color:#fff!important;text-decoration:none;font-size:.74rem!important;font-weight:800!important;
      }
      .reservation-plan.urgent{background:#f5e8e4;border-color:#dfbeb5}
      .reservation-plan.easy{background:#eef3ea;border-color:#cedbc5}
      .sb-offline-nav{white-space:nowrap}
    `;
    document.head.appendChild(style);
  };

  const ensurePwaMetadata = () => {
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest"; link.href = "manifest.webmanifest";
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement("link");
      link.rel = "icon"; link.href = "app-icon-192.png"; link.type = "image/png"; link.sizes = "192x192";
      document.head.appendChild(link);
    }
    if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {
      const meta = document.createElement("meta");
      meta.name = "mobile-web-app-capable"; meta.content = "yes";
      document.head.appendChild(meta);
    }
  };

  const ensureNavigation = () => {
    const nav = document.getElementById("site-nav");
    if (!nav) return;

    const addLink = (href, label, cls="") => {
      let link = nav.querySelector(`a[href="${href}"]`);
      if (!link) {
        link = document.createElement("a");
        link.href = href; link.textContent = label;
        if (cls) link.className = cls;
        const verona = nav.querySelector('a[href="verona.html"]');
        if (verona) nav.insertBefore(link, verona);
        else nav.appendChild(link);
      }
      if (href === currentPage) {
        nav.querySelectorAll("a").forEach(a => {
          if ((a.getAttribute("href") || "").split("#")[0] !== href) {
            a.classList.remove("active");
            a.removeAttribute("aria-current");
          }
        });
        link.classList.add("active");
        link.setAttribute("aria-current","page");
      }
      return link;
    };

    addLink("recommendations.html","Food & Events");
    addLink("essentials.html","Essentials","sb-offline-nav");
  };

  const showUpdateToast = () => {
    if (document.getElementById("sb-update-toast")) return;
    const toast = document.createElement("div");
    toast.id = "sb-update-toast";
    toast.className = "sb-update-toast";
    toast.innerHTML = `<span><strong>Trip update available.</strong> Refresh to load the newest plans.</span><button type="button">Refresh</button>`;
    toast.querySelector("button").addEventListener("click", () => location.reload());
    document.body.appendChild(toast);
  };

  const registerServiceWorker = () => {
    if (!("serviceWorker" in navigator)) return;
    const hadController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker.register("./sw.js").then(reg => {
      reg.update().catch(() => {});
      if (reg.waiting && hadController) showUpdateToast();

      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      });
    }).catch(err => console.warn("Service worker registration failed:", err));

    let controllerChanged = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController && !controllerChanged) {
        controllerChanged = true;
        showUpdateToast();
      }
    });
  };

  const setupInstallButton = () => {
    const button = document.getElementById("install-app-button");
    const help = document.getElementById("install-app-help");
    if (!button) return;

    let deferredPrompt = null;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    const ua = navigator.userAgent || "";
    const android = /Android/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);

    const installed = () => {
      button.textContent = "Wedding app installed ✓";
      button.disabled = true;
      button.setAttribute("aria-disabled","true");
      if (help) help.textContent = "This trip is already installed. Open Sera & Brendon from your home screen or app drawer.";
    };
    if (standalone) installed();

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredPrompt = event;
      if (!standalone) button.textContent = "Install wedding app";
      if (help && !standalone) help.textContent = "Ready to install. Tap Install wedding app to add Sera & Brendon to your home screen.";
    });

    button.addEventListener("click", async () => {
      if (standalone) return;
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (help && choice.outcome === "accepted") help.textContent = "Installing… look for Sera & Brendon on your home screen or app drawer.";
        deferredPrompt = null;
        return;
      }
      if (!help) return;
      if (android) help.innerHTML = 'Chrome has not offered the native prompt yet. Open this page directly in <strong>Chrome</strong>, tap <strong>⋮</strong>, then choose <strong>Install and create shortcut</strong> → <strong>Install</strong>. If you just opened the site, browse for a moment and refresh once.';
      else if (ios) help.innerHTML = 'On iPhone/iPad, open this page in <strong>Safari</strong>, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.';
      else help.innerHTML = 'Use your browser’s install control in the address bar or menu. On Android Chrome: <strong>⋮ → Install and create shortcut → Install</strong>.';
      help.scrollIntoView({behavior:"smooth",block:"nearest"});
    });

    window.addEventListener("appinstalled", installed);
  };

  const reservationPlans = {
    "Trattoria al Pompiere": {level:"urgent", title:"Book ahead", note:"A classic Verona dinner; reserve rather than counting on a walk-in.", url:"https://www.google.com/maps/search/?api=1&query=Trattoria%20al%20Pompiere%20Verona"},
    "Il Vicoletto Trattoria": {level:"", title:"Reservation recommended", note:"Good date-night option; reserve for your preferred dinner time.", url:"https://www.google.com/maps/search/?api=1&query=Il%20Vicoletto%20Trattoria%20Verona"},
    "Casa Perbellini 12 Apostoli": {level:"urgent", title:"Book well ahead", note:"Honeymoon splurge and destination dining—this is the one to reserve early.", url:"https://www.casaperbellini.com/"},
    "Ristorante Cocchi": {level:"urgent", title:"Book ahead", note:"Our top traditional Parma meal; reserve a dinner slot before the trip.", url:"https://www.google.com/maps/search/?api=1&query=Ristorante%20Cocchi%20Parma"},
    "Osteria dei Servi": {level:"", title:"Reservation recommended", note:"Traditional central option; dinner reservations are worth making.", url:"https://www.google.com/maps/search/?api=1&query=Osteria%20dei%20Servi%20Parma"},
    "Trattoria Corrieri": {level:"easy", title:"Flexible", note:"More casual. A reservation is useful at dinner, but this is one of the easier options to keep flexible.", url:"https://www.google.com/maps/search/?api=1&query=Trattoria%20Corrieri%20Parma"},
    "La Taverna del Pittore — Arona": {level:"urgent", title:"Book ahead", note:"If we commit to an Arona date night, reserve this one before driving over.", url:"https://www.tavernadelpittore.com/"},
    "Vecchia Arona": {level:"", title:"Reservation recommended", note:"Reserve if pairing Arona with a planned lakefront dinner.", url:"https://www.google.com/maps/search/?api=1&query=Ristorante%20Vecchia%20Arona"},
    "Piroscafo Lombardia 1908": {level:"urgent", title:"Book ahead", note:"The historic paddle-steamer setting is the attraction, so don't leave it to chance.", url:"https://www.google.com/maps/search/?api=1&query=Piroscafo%20Lombardia%201908%20Arona"},
    "Madachí": {level:"urgent", title:"Book ahead", note:"Our favorite Santa Margherita dinner; reserve this before the honeymoon.", url:"https://www.google.com/maps/search/?api=1&query=Madachi%20Santa%20Margherita%20Ligure"},
    "Ristorante Antonio": {level:"urgent", title:"Book ahead", note:"The restaurant itself recommends reservations.", url:"https://ristoranteantonio.it/"},
    "Langosteria Paraggi": {level:"urgent", title:"Book well ahead", note:"High-demand splurge in a tiny bay; reserve early if we decide it's worth the setting.", url:"https://www.langosteria.com/"},
    "Le Restaurant des Rois": {level:"urgent", title:"Book well ahead", note:"This is the Riviera honeymoon splurge. Reserve once we choose the night.", url:"https://www.reservebeaulieu.com/luxury-hotel/french-gastronomic-restaurant/the-restaurant-des-rois/"},
    "Le Trois Quarts": {level:"", title:"Reservation recommended", note:"Easy Beaulieu favorite with an official table-booking flow.", url:"https://www.restaurant-letroisquarts.com/"},
    "Le Café des Saveurs": {level:"easy", title:"Good flexible option", note:"Useful for a lower-pressure local dinner; reserve if you want a specific time.", url:"https://le-cafe-des-saveurs-beaulieu-sur-mer.eatbu.com/?lang=fr"}
  };

  const eventPlans = {
    "Notre Dame de Paris — Arena di Verona": {level:"urgent", title:"Tickets: book ahead", note:"This is one of our strongest trip events. Pick Oct 2 or 3 and buy tickets once we're committed."},
    "Mercanteinfiera Fall 2026": {level:"", title:"Tickets: plan ahead", note:"Good daytime option. Buy ahead once we decide which Parma day fits best."},
    "Festival Verdi": {level:"urgent", title:"Performance tickets: book early", note:"Choose a specific performance rather than leaving this as a same-day decision."},
    "Forró de Nice — Viva Esse Forró": {level:"urgent", title:"Registration / tickets recommended", note:"Best match for our interests. Decide which nights or workshops we want and register ahead."},
    "Flodor — Le 109": {level:"", title:"Check ticket release", note:"Optional performance—book only if it fits the Nice-day plan."},
    "Jazz / live music in Nice": {level:"", title:"Optional booking", note:"Use this as an alternative evening, not something we need to lock in now."}
  };

  const addPlan = (article, cfg, linkLabel) => {
    if (!article || article.querySelector(".reservation-plan")) return;
    const box = document.createElement("div");
    box.className = `reservation-plan ${cfg.level || ""}`.trim();
    box.innerHTML = `<strong>${cfg.title}</strong><span>${cfg.note}</span>${cfg.url ? `<a target="_blank" rel="noopener" href="${cfg.url}">${linkLabel} ↗</a>` : ""}`;
    const actions = article.querySelector(".pick-actions");
    if (actions) article.insertBefore(box, actions);
    else article.appendChild(box);
  };

  const setupReservationPlanning = () => {
    if (currentPage !== "recommendations.html") return;
    document.querySelectorAll(".pick").forEach(article => {
      const title = article.querySelector("h4")?.textContent.trim();
      if (!title) return;
      if (reservationPlans[title]) addPlan(article, reservationPlans[title], "Reserve / official info");
      else if (eventPlans[title]) addPlan(article, eventPlans[title], "Event info");
    });
  };

  injectStyle();
  ensurePwaMetadata();
  ensureNavigation();
  setupInstallButton();
  setupReservationPlanning();
  registerServiceWorker();
})();