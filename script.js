document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const trip = window.SB_TRIP || null;
  const currentPage = (window.location.pathname.split("/").pop() || "index.html").split("?")[0];
  const dateKey = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

  // Mobile navigation.
  const header = document.querySelector(".site-header");
  const mobileToggle = document.querySelector(".mobile-nav-toggle");
  const mobileNav = document.getElementById("site-nav");
  if (header && mobileToggle && mobileNav) {
    const setMenuState = open => {
      header.classList.toggle("nav-open", open);
      mobileToggle.setAttribute("aria-expanded", String(open));
      const label = mobileToggle.querySelector(".mobile-nav-label");
      const icon = mobileToggle.querySelector(".mobile-nav-icon");
      if (label) label.textContent = open ? "Close" : "Menu";
      if (icon) icon.textContent = open ? "✕" : "☰";
    };
    setMenuState(false);
    mobileToggle.addEventListener("click", event => {
      event.preventDefault(); event.stopPropagation();
      setMenuState(!header.classList.contains("nav-open"));
    });
    mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenuState(false)));
    document.addEventListener("click", event => { if (!header.contains(event.target)) setMenuState(false); });
  }

  // Current page + trip-only Today shortcut.
  document.querySelectorAll("#site-nav a").forEach(link => {
    const href = (link.getAttribute("href") || "").split("#")[0];
    const active = href === currentPage;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const tripTodayLink = document.querySelector(".trip-today-link");
  if (tripTodayLink && trip) {
    const key = dateKey();
    const duringTrip = key >= trip.start && key <= trip.end;
    tripTodayLink.hidden = !(duringTrip || currentPage === "today.html");
    tripTodayLink.classList.toggle("trip-live", duringTrip);
  }

  // Countdown.
  document.querySelectorAll("#trip-countdown").forEach(card => {
    const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = parse(card.dataset.start || trip?.start || "2026-10-01");
    const wedding = parse(card.dataset.wedding || trip?.wedding || "2026-10-10");
    const end = parse(card.dataset.end || trip?.end || "2026-10-18");
    const days = (a,b) => Math.round((b-a)/86400000);
    const strong = card.querySelector("strong");
    const small = card.querySelector("small");
    if (!strong || !small) return;
    if (today < start) {
      const n = days(today,start);
      strong.textContent = `${n} day${n===1?"":"s"} until Italy 🇮🇹`;
      small.textContent = "Verona is our first stop.";
    } else if (+today === +wedding) {
      strong.textContent = "Wedding Day 💍";
      small.textContent = "Lake Maggiore • October 10";
      card.classList.add("wedding-now");
    } else if (today <= end) {
      const n = days(today,wedding);
      strong.textContent = n > 0 ? `${n} day${n===1?"":"s"} until the wedding` : "We're on the honeymoon 🤍";
      small.textContent = "Open Today for the current plan.";
    } else {
      strong.textContent = "What a trip 🤍";
      small.textContent = "Italy & France • October 2026";
    }
  });

  // Canonical Today dashboard from trip-data.js.
  const dashboard = document.getElementById("trip-dashboard");
  if (dashboard && trip) {
    const keys = Object.keys(trip.days).sort();
    const todayKey = dateKey();
    const selectedKey = trip.days[todayKey] ? todayKey : (todayKey < keys[0] ? keys[0] : keys[keys.length-1]);
    const cfg = trip.days[selectedKey];
    const stay = trip.stays[cfg.stayKey];
    const live = Boolean(trip.days[todayKey]);
    const fmt = new Intl.DateTimeFormat("en-US",{weekday:"long",month:"short",day:"numeric"});
    const [yy,mm,dd] = selectedKey.split("-").map(Number);
    const niceDate = fmt.format(new Date(yy,mm-1,dd));
    const set = (id,value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
    const href = (id,value) => { const el=document.getElementById(id); if(el) el.href=value; };

    set("dashboard-title", live ? cfg.city : "Next up: Verona");
    set("dashboard-subtitle", live ? "Everything useful for today in one place." : "This dashboard follows the itinerary automatically once the trip begins.");
    set("dashboard-date", live ? niceDate : "Trip starts Oct 1");
    set("dashboard-location", cfg.city);
    set("dashboard-stay", stay?.name || "Our stay");
    set("dashboard-address", "Exact address is private in the installed app.");
    href("dashboard-city-link", stay?.page || "index.html");
    href("dashboard-directions-link", "#private-location");
    set("dashboard-idea", cfg.idea);
    set("dashboard-idea-detail", cfg.ideaDetail);
    href("dashboard-idea-link", cfg.ideaLink);
    set("dashboard-transport", cfg.transport);
    set("dashboard-transport-detail", cfg.transportDetail);
    href("dashboard-transport-link", cfg.transportLink);

    const events = cfg.events || [];
    set("dashboard-events", events.length ? events.join(" • ") : "No researched event today");
    set("dashboard-events-detail", events.length ? "Optional event ideas for today." : "Use the destination guide for food, sights and nearby places.");

    // Next action on travel days.
    const nextAction = document.getElementById("dashboard-next-action");
    if (nextAction && cfg.nextAction) nextAction.textContent = cfg.nextAction;
  }

  // Canonical travel-day list used by Essentials.
  const travelDays = document.getElementById("canonical-travel-days");
  if (travelDays && trip) {
    travelDays.innerHTML = trip.travelDays.map(item => `
      <div class="travel-line">
        <b>${item.date}</b>
        <span><strong>${item.title}</strong> <em style="font-style:normal;font-size:.75rem;font-weight:800;color:#6f4e3d">• ${item.status}</em><br>${item.detail} <a href="${item.link}">Plan →</a></span>
      </div>`).join("");
  }

  // Build compact daily itinerary if requested.
  const generatedDays = document.getElementById("generated-day-list");
  if (generatedDays && trip) {
    generatedDays.innerHTML = Object.entries(trip.days).map(([key,cfg]) => {
      const [y,m,d] = key.split("-").map(Number);
      const date = new Date(y,m-1,d);
      const label = date.toLocaleDateString("en-US",{month:"short",day:"numeric"});
      const events = (cfg.events || []).map(e => `<span class="day-event-chip">🎉 ${e}</span>`).join("");
      return `<a class="day-card${key===trip.wedding?" wedding-day-card":""}" data-date="${key}" href="${cfg.transportLink || cfg.ideaLink || "index.html"}">
        <b>${label}</b><div><strong>${cfg.city}</strong><span>${cfg.idea}</span>${events ? `<span class="day-event-stack">${events}</span>` : ""}</div><em>→</em>
      </a>`;
    }).join("");
  }

  // Highlight current itinerary day without forcing the viewport before layout settles.
  const todayKey = dateKey();
  document.querySelectorAll(".day-card[data-date]").forEach(card => {
    if (card.dataset.date === todayKey) card.classList.add("is-today");
  });

  // Weather.
  const weatherCodeLabel = code => {
    if (code === 0) return "Clear";
    if ([1,2].includes(code)) return "Mostly clear";
    if (code === 3) return "Cloudy";
    if ([45,48].includes(code)) return "Fog";
    if ([51,53,55,56,57].includes(code)) return "Drizzle";
    if ([61,63,65,66,67,80,81,82].includes(code)) return "Rain";
    if ([71,73,75,77,85,86].includes(code)) return "Snow";
    if ([95,96,99].includes(code)) return "Thunderstorms";
    return "Forecast";
  };
  const fToC = f => Math.round((f-32)*5/9);

  async function loadWeather(card) {
    let cfg;
    try {
      if (card.dataset.weather) cfg = JSON.parse(card.dataset.weather);
      else if (card.dataset.weatherRoute) {
        const route = JSON.parse(card.dataset.weatherRoute);
        const key = dateKey();
        cfg = route.find(x => key >= x.start && key <= x.end) || route[0];
      }
    } catch {}
    if (!cfg) return;
    const body = card.querySelector(".weather-body");
    if (!body) return;

    const start = cfg.start, end = cfg.end;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(cfg.lat)}&longitude=${encodeURIComponent(cfg.lng)}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&start_date=${start}&end_date=${end}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("weather");
      const data = await res.json();
      const daily = data.daily || {};
      const dates = daily.time || [];
      if (!dates.length) throw new Error("range");
      body.innerHTML = `<div class="weather-forecast-strip">${dates.map((date,i) => {
        const d = new Date(`${date}T12:00:00`);
        const high = Math.round(daily.temperature_2m_max?.[i]);
        const low = Math.round(daily.temperature_2m_min?.[i]);
        const rain = daily.precipitation_probability_max?.[i] ?? 0;
        const code = daily.weather_code?.[i];
        return `<article class="weather-day"><strong>${d.toLocaleDateString("en-US",{weekday:"short"})}</strong><span>${d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span><b>${weatherCodeLabel(code)}</b><span>${high}° / ${low}°F</span><small>${fToC(high)}° / ${fToC(low)}°C • ${rain}% precip.</small></article>`;
      }).join("")}</div>`;
      const dashboardWeather = document.getElementById("dashboard-weather");
      const dashboardWeatherDetail = document.getElementById("dashboard-weather-detail");
      if (dashboardWeather && dashboardWeatherDetail) {
        const key = dateKey();
        const i = dates.indexOf(key);
        if (i >= 0) {
          const hi = Math.round(daily.temperature_2m_max[i]), lo = Math.round(daily.temperature_2m_min[i]);
          dashboardWeather.textContent = `${weatherCodeLabel(daily.weather_code[i])} • ${hi}°/${lo}°F`;
          dashboardWeatherDetail.textContent = `${daily.precipitation_probability_max[i] ?? 0}% chance of precipitation`;
        }
      }
    } catch {
      body.innerHTML = `<div class="weather-not-ready"><strong>Forecast not available yet</strong><span>Trip-day forecasts appear as the dates enter the forecast window. The rest of the page works offline.</span></div>`;
    }
  }
  document.querySelectorAll(".trip-weather-card").forEach(loadWeather);

  // Leaflet maps.
  const maps = [...document.querySelectorAll(".city-map[data-map]")];
  if (!maps.length) return;
  const fail = (el,msg) => { el.innerHTML = `<div class="map-error"><strong>Map unavailable</strong><span>${msg}</span></div>`; };
  if (!window.L) { maps.forEach(el => fail(el,"Refresh the page or use the Directions links.")); return; }

  const styles = {
    stay:{color:"#fff",weight:3,fillColor:"#6f4e3d",fillOpacity:1,radius:10},
    food:{color:"#fff",weight:2,fillColor:"#b24e3a",fillOpacity:1,radius:8},
    coffee:{color:"#fff",weight:2,fillColor:"#8a684f",fillOpacity:1,radius:8},
    grocery:{color:"#fff",weight:2,fillColor:"#6d7b45",fillOpacity:1,radius:8},
    pharmacy:{color:"#fff",weight:2,fillColor:"#3f7f70",fillOpacity:1,radius:8},
    station:{color:"#fff",weight:2,fillColor:"#315f74",fillOpacity:1,radius:8},
    parking:{color:"#fff",weight:2,fillColor:"#596779",fillOpacity:1,radius:8},
    sight:{color:"#fff",weight:2,fillColor:"#7d6d3f",fillOpacity:1,radius:8},
    event:{color:"#fff",weight:2,fillColor:"#9a4f78",fillOpacity:1,radius:9}
  };
  const labels = {stay:"Stay area",food:"Restaurant",coffee:"Coffee",grocery:"Grocery",pharmacy:"Pharmacy",station:"Transit",parking:"Parking",sight:"Sight",event:"Event"};
  const directions = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  const kmBetween = (a,b) => {
    const R=6371,toRad=x=>x*Math.PI/180;
    const dLat=toRad(Number(b.lat)-Number(a.lat)),dLng=toRad(Number(b.lng)-Number(a.lng));
    const la1=toRad(Number(a.lat)),la2=toRad(Number(b.lat));
    const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
    return 2*R*Math.asin(Math.sqrt(h));
  };
  const distanceFromStay = (item,stay) => {
    if (!stay || item.kind === "stay") return "";
    const routeKm = kmBetween(stay,item)*1.18, miles = routeKm*0.621371;
    if (routeKm <= 4.5) {
      const mins = Math.max(2,Math.round((routeKm/4.7)*60/2)*2);
      return `<span class="walk-estimate">≈ ${mins} min walk • ${miles.toFixed(1)} mi from stay area</span>`;
    }
    return `<span class="walk-estimate">≈ ${miles.toFixed(1)} mi from stay area</span>`;
  };
  const popup = (item,stay) => {
    const address = item.address || "", q = address || item.name || `${item.lat},${item.lng}`;
    const date = item.date ? `<span class="event-date">${item.date}</span>` : "";
    const distance = distanceFromStay(item,stay);
    const info = item.url ? `<a target="_blank" rel="noopener" href="${item.url}">Event info ↗</a>` : "";
    const directionLink = item.kind === "stay" && item.privateApprox
      ? `<span style="display:block;margin-top:.35rem;font-size:.78rem">Exact lodging directions are in Private Trip Mode.</span>`
      : `<a target="_blank" rel="noopener" href="${directions(q)}">Directions ↗</a>`;
    return `<div class="map-popup"><small>${labels[item.kind]||""}</small><strong>${item.name}</strong>${date}${distance}${address?`<span>${address}</span>`:""}${directionLink}${info}</div>`;
  };

  maps.forEach(el => {
    let d; try { d = JSON.parse(el.dataset.map); } catch { fail(el,"Map data could not be read."); return; }
    const map = L.map(el,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
    const layers = {};
    Object.keys(styles).forEach(k => layers[k] = L.layerGroup().addTo(map));
    const records = [
      {kind:"stay",...d.stay},
      ...(d.restaurants||[]).map(x=>({kind:"food",...x})),
      ...(d.station?[{kind:"station",...d.station}]:[]),
      ...(d.sights||[]).map(x=>({kind:x.kind||"sight",...x})),
      ...(d.events||[]).map(x=>({kind:"event",...x})),
      ...(d.coffee||[]).map(x=>({kind:"coffee",...x})),
      ...(d.grocery||[]).map(x=>({kind:"grocery",...x})),
      ...(d.pharmacy||[]).map(x=>({kind:"pharmacy",...x})),
      ...(d.parking||[]).map(x=>({kind:"parking",...x}))
    ].filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng)));

    records.forEach(item => {
      L.circleMarker([Number(item.lat),Number(item.lng)],styles[item.kind]||styles.sight)
        .bindPopup(popup(item,d.stay)).addTo(layers[item.kind]||layers.sight);
    });

    const fitVisible = filter => {
      const pts = records.filter(x=>filter==="all"||x.kind===filter).map(x=>[Number(x.lat),Number(x.lng)]);
      if (pts.length>1) map.fitBounds(pts,{padding:[34,34],maxZoom:15});
      else if (pts.length===1) map.setView(pts[0],15);
    };
    fitVisible("all");
    const wrap = el.closest(".map-wrap");
    const buttons = wrap ? [...wrap.querySelectorAll(".map-filter")] : [];
    const applyFilter = (filter,clicked) => {
      buttons.forEach(b=>b.classList.toggle("active",b===clicked||(filter==="all"&&b.dataset.filter==="all")));
      Object.entries(layers).forEach(([kind,layer]) => {
        const show = filter==="all" || filter===kind;
        if (show && !map.hasLayer(layer)) layer.addTo(map);
        if (!show && map.hasLayer(layer)) map.removeLayer(layer);
      });
      fitVisible(filter);
    };
    buttons.forEach(btn=>btn.addEventListener("click",()=>applyFilter(btn.dataset.filter,btn)));
    setTimeout(()=>map.invalidateSize(),250);
  });
});