
document.addEventListener("DOMContentLoaded",()=>{
  const toggle=document.querySelector(".menu-toggle");
  const nav=document.querySelector(".site-nav");
  if(toggle&&nav){
    toggle.addEventListener("click",()=>{
      const open=toggle.getAttribute("aria-expanded")==="true";
      toggle.setAttribute("aria-expanded",String(!open));
      nav.classList.toggle("open",!open);
    });
  }

  // Countdown / trip-state card
  document.querySelectorAll("#trip-countdown").forEach(card=>{
    const now=new Date();
    const localToday=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
    const start=parse(card.dataset.start), wedding=parse(card.dataset.wedding), end=parse(card.dataset.end);
    const days=(a,b)=>Math.round((b-a)/86400000);
    const strong=card.querySelector("strong"), small=card.querySelector("small");
    if(localToday<start){ const n=days(localToday,start); strong.textContent=`${n} day${n===1?"":"s"} until Italy 🇮🇹`; small.textContent="Verona is our first stop."; }
    else if(+localToday===+wedding){ strong.textContent="Wedding Day 💍"; small.textContent="Lake Maggiore • October 10"; card.classList.add("wedding-now"); }
    else if(localToday<=end){ const n=days(localToday,wedding); strong.textContent=n>0?`${n} day${n===1?"":"s"} until the wedding`:"We're on the honeymoon 🤍"; small.textContent="Tap Today for the current plan."; }
    else { strong.textContent="What a trip 🤍"; small.textContent="Italy & France • October 2026"; }
  });

  // Highlight current itinerary day.
  const t=new Date(), yyyy=t.getFullYear(), mm=String(t.getMonth()+1).padStart(2,"0"), dd=String(t.getDate()).padStart(2,"0");
  const key=`${yyyy}-${mm}-${dd}`;
  document.querySelectorAll(".day-card[data-date]").forEach(card=>{
    if(card.dataset.date===key){card.classList.add("is-today");card.scrollIntoView({block:"center"});}
  });

  const maps=[...document.querySelectorAll(".city-map[data-map]")];
  if(!maps.length) return;

  const fail=(el,msg)=>{el.innerHTML=`<div class="map-error"><strong>Map unavailable</strong><span>${msg}</span></div>`;};
  if(!window.L){ maps.forEach(el=>fail(el,"Refresh the page or use the Directions links.")); return; }

  const styles={
    stay:{color:"#fff",weight:3,fillColor:"#6f4e3d",fillOpacity:1,radius:10},
    food:{color:"#fff",weight:2,fillColor:"#b24e3a",fillOpacity:1,radius:8},
    coffee:{color:"#fff",weight:2,fillColor:"#8a684f",fillOpacity:1,radius:8},
    grocery:{color:"#fff",weight:2,fillColor:"#6d7b45",fillOpacity:1,radius:8},
    pharmacy:{color:"#fff",weight:2,fillColor:"#3f7f70",fillOpacity:1,radius:8},
    station:{color:"#fff",weight:2,fillColor:"#315f74",fillOpacity:1,radius:8},
    parking:{color:"#fff",weight:2,fillColor:"#596779",fillOpacity:1,radius:8},
    sight:{color:"#fff",weight:2,fillColor:"#7d6d3f",fillOpacity:1,radius:8}
  };

  const labels={stay:"Our stay",food:"Restaurant",coffee:"Coffee",grocery:"Grocery",pharmacy:"Pharmacy",station:"Transit",parking:"Parking",sight:"Sight"};
  const directions=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
  const popup=item=>{
    const address=item.address||"";
    const q=address||item.name||`${item.lat},${item.lng}`;
    return `<div class="map-popup"><small>${labels[item.kind]||""}</small><strong>${item.name}</strong>${address?`<span>${address}</span>`:""}<a target="_blank" rel="noopener" href="${directions(q)}">Directions ↗</a></div>`;
  };

  const overpassEndpoint="https://overpass-api.de/api/interpreter";
  const practicalKinds=["coffee","grocery","pharmacy","parking"];

  function overpassQuery(lat,lng){
    return `[out:json][timeout:12];
    (
      nwr(around:1600,${lat},${lng})["amenity"="cafe"];
      nwr(around:1600,${lat},${lng})["shop"="coffee"];
      nwr(around:1600,${lat},${lng})["shop"~"supermarket|convenience|grocery"];
      nwr(around:1600,${lat},${lng})["amenity"="pharmacy"];
      nwr(around:1600,${lat},${lng})["amenity"="parking"];
    );
    out center tags;`;
  }

  function practicalKind(tags={}){
    if(tags.amenity==="cafe"||tags.shop==="coffee") return "coffee";
    if(["supermarket","convenience","grocery"].includes(tags.shop)) return "grocery";
    if(tags.amenity==="pharmacy") return "pharmacy";
    if(tags.amenity==="parking") return "parking";
    return null;
  }

  async function loadPracticalPlaces(stay){
    const cacheKey=`sb-practical-v1:${Number(stay.lat).toFixed(4)},${Number(stay.lng).toFixed(4)}`;
    try{
      const cached=JSON.parse(localStorage.getItem(cacheKey)||"null");
      if(cached&&Date.now()-cached.saved<7*86400000) return cached.items;
    }catch(e){}
    try{
      const res=await fetch(overpassEndpoint,{
        method:"POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
        body:"data="+encodeURIComponent(overpassQuery(stay.lat,stay.lng))
      });
      if(!res.ok) throw new Error("Overpass unavailable");
      const data=await res.json();
      const items=(data.elements||[]).map(x=>{
        const kind=practicalKind(x.tags||{});
        const lat=x.lat??x.center?.lat, lng=x.lon??x.center?.lon;
        if(!kind||!Number.isFinite(Number(lat))||!Number.isFinite(Number(lng))) return null;
        const t=x.tags||{};
        return {kind,name:t.name||labels[kind],address:[t["addr:housenumber"],t["addr:street"]].filter(Boolean).join(" "),lat:Number(lat),lng:Number(lng)};
      }).filter(Boolean);

      // Keep the closest useful results so the map does not get cluttered.
      const distance2=x=>(x.lat-stay.lat)**2+(x.lng-stay.lng)**2;
      const trimmed=practicalKinds.flatMap(kind=>
        items.filter(x=>x.kind===kind).sort((a,b)=>distance2(a)-distance2(b)).slice(0,4)
      );
      try{localStorage.setItem(cacheKey,JSON.stringify({saved:Date.now(),items:trimmed}));}catch(e){}
      return trimmed;
    }catch(e){
      return [];
    }
  }

  maps.forEach(async el=>{
    let d; try{d=JSON.parse(el.dataset.map);}catch(e){fail(el,"Map data could not be read.");return;}

    const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);

    const layers={};
    Object.keys(styles).forEach(k=>layers[k]=L.layerGroup().addTo(map));

    const records=[
      {kind:"stay",...d.stay},
      ...(d.restaurants||[]).map(x=>({kind:"food",...x})),
      ...(d.station?[{kind:"station",...d.station}]:[]),
      ...(d.sights||[]).map(x=>({kind:"sight",...x})),
      ...(d.coffee||[]).map(x=>({kind:"coffee",...x})),
      ...(d.grocery||[]).map(x=>({kind:"grocery",...x})),
      ...(d.pharmacy||[]).map(x=>({kind:"pharmacy",...x})),
      ...(d.parking||[]).map(x=>({kind:"parking",...x}))
    ].filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng)));

    const seen=new Set();
    const addRecord=item=>{
      const key=`${item.kind}:${item.name}:${Number(item.lat).toFixed(5)},${Number(item.lng).toFixed(5)}`;
      if(seen.has(key)) return;
      seen.add(key);
      records.push(item);
      L.circleMarker([Number(item.lat),Number(item.lng)],styles[item.kind])
        .bindPopup(popup(item)).addTo(layers[item.kind]);
    };

    // Render built-in trip pins first.
    const initial=[...records];
    records.length=0;
    initial.forEach(addRecord);

    const fitVisible=filter=>{
      const pts=records.filter(x=>filter==="all"||x.kind===filter).map(x=>[Number(x.lat),Number(x.lng)]);
      if(pts.length>1) map.fitBounds(pts,{padding:[34,34],maxZoom:15});
      else if(pts.length===1) map.setView(pts[0],15);
    };
    fitVisible("all");

    const wrap=el.closest(".map-wrap");
    const buttons=wrap?[...wrap.querySelectorAll(".map-filter")]:[];
    let activeFilter="all";

    function applyFilter(filter,clicked){
      activeFilter=filter;
      buttons.forEach(b=>b.classList.toggle("active",b===clicked||(filter==="all"&&b.dataset.filter==="all")));
      Object.entries(layers).forEach(([kind,layer])=>{
        const show=filter==="all"||filter===kind;
        if(show&&!map.hasLayer(layer)) layer.addTo(map);
        if(!show&&map.hasLayer(layer)) map.removeLayer(layer);
      });
      fitVisible(filter);
    }

    buttons.forEach(btn=>btn.addEventListener("click",()=>applyFilter(btn.dataset.filter,btn)));

    // Load nearby coffee, groceries, pharmacies and parking without geocoding.
    // These are real OpenStreetMap places within roughly 1.4 km of the stay.
    const practical=await loadPracticalPlaces(d.stay);
    practical.forEach(addRecord);

    // If a practical category has no OSM results, make its button open a Google Maps nearby search.
    practicalKinds.forEach(kind=>{
      const btn=buttons.find(b=>b.dataset.filter===kind);
      if(!btn) return;
      const has=records.some(x=>x.kind===kind);
      if(!has){
        btn.classList.add("empty-filter");
        btn.title=`No mapped ${labels[kind].toLowerCase()} found nearby`;
        btn.addEventListener("click",e=>{
          e.stopImmediatePropagation();
          applyFilter(kind,btn);
          const center=[Number(d.stay.lat),Number(d.stay.lng)];
          L.popup()
            .setLatLng(center)
            .setContent(`<div class="map-popup"><small>${labels[kind]}</small><strong>No mapped places found nearby</strong><span>Try a wider Google Maps search.</span><a target="_blank" rel="noopener" href="${directions(`${labels[kind]} near ${d.stay.address||d.stay.name}`)}">Search nearby ↗</a></div>`)
            .openOn(map);
        },true);
      }
    });

    // Keep the current category visible after the async practical pins appear.
    const currentButton=buttons.find(b=>b.dataset.filter===activeFilter) || buttons[0];
    applyFilter(activeFilter,currentButton);
    setTimeout(()=>map.invalidateSize(),250);
  });
});
