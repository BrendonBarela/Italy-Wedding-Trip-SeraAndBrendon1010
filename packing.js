(() => {
  "use strict";

  const trip = window.SB_TRIP;
  if (!trip) return;

  const FORECAST_CACHE = "sb-packing-forecast-v1";
  const FORECAST_MAX_AGE = 6 * 60 * 60 * 1000;

  const places = {
    verona:   {name:"Verona", lat:45.4384, lng:10.9916, avgHigh:66, avgLow:49, avgRain:30},
    parma:    {name:"Parma", lat:44.8015, lng:10.3279, avgHigh:64, avgLow:50, avgRain:35},
    ispra:    {name:"Ispra / Lake Maggiore", lat:45.8149, lng:8.6129, avgHigh:62, avgLow:49, avgRain:45},
    santa:    {name:"Santa Margherita Ligure", lat:44.3345, lng:9.2120, avgHigh:69, avgLow:59, avgRain:40},
    beaulieu: {name:"Beaulieu-sur-Mer / Nice", lat:43.7065, lng:7.3315, avgHigh:70, avgLow:57, avgRain:40}
  };

  const laundry = {
    "2026-10-03": {title:"Laundry reset — Verona", detail:"Washer + dryer at our Verona apartment. Do a small load so we only carry a few days of basics."},
    "2026-10-06": {title:"Laundry reset — Parma", detail:"Washing machine at our Parma apartment. Run a small load and air-dry overnight before the Ispra travel day."},
    "2026-10-09": {title:"Optional wedding-weekend wash", detail:"Villa Eden has a washing machine. Use only if wedding clothes or basics need a quick reset."},
    "2026-10-13": {title:"Final laundry reset — Santa", detail:"Washer + dryer at our Santa Margherita apartment. Wash everything needed for France + the flight home; no laundry is planned in Beaulieu."}
  };

  const cityKey = cfg => {
    if (["ispraWedding","ispraGuest","gemmas"].includes(cfg.stayKey)) return "ispra";
    if (cfg.stayKey === "santa") return "santa";
    if (cfg.stayKey === "beaulieu") return "beaulieu";
    return cfg.stayKey;
  };

  const getCache = () => {
    try { return JSON.parse(localStorage.getItem(FORECAST_CACHE) || "null"); }
    catch { return null; }
  };
  const setCache = value => { try { localStorage.setItem(FORECAST_CACHE, JSON.stringify(value)); } catch {} };

  const fetchPlace = async (key, place) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=16`;
    const res = await fetch(url, {cache:"no-store"});
    if (!res.ok) throw new Error(`forecast ${key}`);
    const data = await res.json();
    const out = {};
    (data.daily?.time || []).forEach((date, i) => {
      out[date] = {
        high: Math.round(data.daily.temperature_2m_max?.[i]),
        low: Math.round(data.daily.temperature_2m_min?.[i]),
        rain: Math.round(data.daily.precipitation_probability_max?.[i] ?? 0)
      };
    });
    return out;
  };

  const loadForecasts = async force => {
    const cached = getCache();
    const fresh = cached && (Date.now() - cached.savedAt < FORECAST_MAX_AGE);
    if (!force && fresh) return {data:cached.data, source:"saved"};

    if (!navigator.onLine && cached) return {data:cached.data, source:"saved"};
    if (!navigator.onLine) return {data:{}, source:"average"};

    try {
      const entries = await Promise.all(Object.entries(places).map(async ([key, place]) => [key, await fetchPlace(key, place)]));
      const data = Object.fromEntries(entries);
      setCache({savedAt:Date.now(), data});
      return {data, source:"live"};
    } catch {
      return cached ? {data:cached.data, source:"saved"} : {data:{}, source:"average"};
    }
  };

  const weatherFor = (date, cfg, forecasts) => {
    const key = cityKey(cfg);
    const place = places[key];
    const live = forecasts?.[key]?.[date];
    return live
      ? {...live, live:true, place:key}
      : {high:place.avgHigh, low:place.avgLow, rain:place.avgRain, live:false, place:key};
  };

  const weatherWords = w => {
    const words = [];
    if (w.low <= 50) words.push("cool morning/evening");
    else if (w.low <= 57) words.push("light-layer weather");
    else words.push("mild");
    if (w.rain >= 40) words.push("rain-ready");
    if (w.high >= 69) words.push("mild afternoon");
    return words.join(" • ");
  };

  const isTravel = cfg => cfg.city.startsWith("Travel") || cfg.city.includes("Fly home");

  const personalOutfit = (person, date, cfg, w) => {
    if (date === "2026-10-10") {
      return person === "Sera"
        ? ["Wedding attire + shoes", "Warm wrap/cardigan for evening", "Touch-up kit", "Comfortable backup shoes"]
        : ["Wedding suit/outfit + dress shoes", "Light warm layer for evening", "Belt/accessories", "Comfortable backup shoes"];
    }

    const items = [];
    if (person === "Sera") {
      items.push(w.high >= 68 ? "Light top + comfortable bottom" : "Long-sleeve/light top + comfortable bottom");
      if (w.low <= 57) items.push("Cardigan or light sweater");
    } else {
      items.push(w.high >= 68 ? "Light shirt + comfortable pants" : "Long-sleeve/light shirt + comfortable pants");
      if (w.low <= 57) items.push("Light sweater/overshirt");
    }

    if (w.rain >= 40) items.push("Packable rain shell");
    if (isTravel(cfg)) items.push("Easy-on travel shoes");
    else if (date === "2026-10-16") items.push("Good-grip walking shoes for Èze");
    else items.push("Comfortable walking shoes");

    if (date === "2026-10-03" || date === "2026-10-05" || date === "2026-10-13" || date === "2026-10-17") {
      items.push(person === "Sera" ? "One nicer dinner option" : "One smart-casual dinner option");
    }
    return items;
  };

  const sharedItems = (date, cfg, w) => {
    if (date === "2026-10-10") return ["Rings", "Ceremony notes/vows", "Phone + power bank", "Small emergency kit"];
    const items = [];
    if (isTravel(cfg)) {
      items.push("Passports / tickets", "Phone + power bank", "Water + snacks");
      if (date === "2026-10-07") items.push("Driver license + IDP + rental documents");
    } else {
      items.push("Small day bag", "Phone", "Water");
    }
    if (w.rain >= 40) items.push("Compact umbrella");
    if (w.high >= 68) items.push("Sunglasses");
    return items;
  };

  const formatDate = key => {
    const [y,m,d] = key.split("-").map(Number);
    return new Date(y,m-1,d).toLocaleDateString("en-US", {weekday:"short", month:"short", day:"numeric"});
  };

  const chipList = items => items.map(x => `<span>${x}</span>`).join("");

  const renderToday = (forecasts) => {
    const title = document.getElementById("dashboard-pack-title");
    const list = document.getElementById("dashboard-pack");
    if (!title || !list) return;
    const keys = Object.keys(trip.days).sort();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    const key = trip.days[today] ? today : (today < keys[0] ? keys[0] : keys[keys.length-1]);
    const cfg = trip.days[key];
    const w = weatherFor(key, cfg, forecasts);
    title.textContent = trip.days[today] ? "Bring today" : "Pack for Oct 1";
    const sera = personalOutfit("Sera",key,cfg,w);
    const brendon = personalOutfit("Brendon",key,cfg,w);
    const shared = sharedItems(key,cfg,w);
    const quick = [
      `Sera: ${sera[0]}`,
      `Brendon: ${brendon[0]}`,
      ...shared.slice(0,3)
    ];
    list.innerHTML = chipList(quick) + `<a href="packing.html" style="display:inline-flex;align-items:center;padding:.38rem .55rem;font-size:.76rem;font-weight:800">Full packing plan →</a>`;
  };

  const renderPage = (forecasts) => {
    const list = document.getElementById("packing-days");
    if (!list) return;
    list.innerHTML = Object.entries(trip.days).map(([date,cfg]) => {
      const w = weatherFor(date,cfg,forecasts);
      const source = w.live ? "Live forecast" : "October average";
      const laundryBox = laundry[date] ? `<div class="pack-laundry"><strong>🧺 ${laundry[date].title}</strong><span>${laundry[date].detail}</span></div>` : "";
      return `<article class="pack-day" id="pack-${date}">
        <div class="pack-day-head"><div><span class="pack-date">${formatDate(date)}</span><h2>${cfg.city}</h2><small>${source} • ${weatherWords(w)}</small></div><a href="${cfg.ideaLink}">Day plan →</a></div>
        <div class="pack-people">
          <section><h3>Sera</h3><div class="pack-chips">${chipList(personalOutfit("Sera",date,cfg,w))}</div></section>
          <section><h3>Brendon</h3><div class="pack-chips">${chipList(personalOutfit("Brendon",date,cfg,w))}</div></section>
          <section><h3>Shared / day bag</h3><div class="pack-chips">${chipList(sharedItems(date,cfg,w))}</div></section>
        </div>${laundryBox}
      </article>`;
    }).join("");
  };

  const updateStatus = (result) => {
    const status = document.getElementById("packing-source-status");
    if (!status) return;
    const liveDates = Object.values(result.data || {}).reduce((n, p) => n + Object.keys(p || {}).filter(d => trip.days[d]).length, 0);
    if (liveDates) status.textContent = `${liveDates} trip day${liveDates===1?"":"s"} currently use live forecast data; later days use October averages.`;
    else status.textContent = "Trip dates are not yet inside the live forecast window, so recommendations currently use October averages.";
  };

  const refresh = async force => {
    const button = document.getElementById("refresh-packing");
    if (button) { button.disabled = true; button.textContent = "Updating…"; }
    const result = await loadForecasts(force);
    renderToday(result.data);
    renderPage(result.data);
    updateStatus(result);
    if (button) { button.disabled = false; button.textContent = "Refresh recommendations"; }
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("refresh-packing")?.addEventListener("click", () => refresh(true));
    refresh(false).catch(()=>{});
  });
})();

