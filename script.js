
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
    station:{color:"#fff",weight:2,fillColor:"#315f74",fillOpacity:1,radius:8},
    sight:{color:"#fff",weight:2,fillColor:"#6d7b45",fillOpacity:1,radius:7}
  };
  const directions=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
  const popup=item=>{
    const address=item.address||"";
    const q=address||`${item.lat},${item.lng}`;
    return `<div class="map-popup"><strong>${item.name}</strong>${address?`<span>${address}</span>`:""}<a target="_blank" rel="noopener" href="${directions(q)}">Directions ↗</a></div>`;
  };

  maps.forEach(el=>{
    let d; try{d=JSON.parse(el.dataset.map);}catch(e){fail(el,"Map data could not be read.");return;}
    const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);

    const records=[
      {kind:"stay",...d.stay},
      ...(d.restaurants||[]).map(x=>({kind:"food",...x})),
      ...(d.station?[{kind:"station",...d.station}]:[]),
      ...(d.sights||[]).map(x=>({kind:"sight",...x}))
    ].filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng)));

    const layers={stay:L.layerGroup().addTo(map),food:L.layerGroup().addTo(map),station:L.layerGroup().addTo(map),sight:L.layerGroup().addTo(map)};
    const allBounds=[];
    records.forEach(item=>{
      const ll=[Number(item.lat),Number(item.lng)];
      allBounds.push(ll);
      L.circleMarker(ll,styles[item.kind]).bindPopup(popup(item)).addTo(layers[item.kind]);
    });
    if(allBounds.length>1)map.fitBounds(allBounds,{padding:[34,34],maxZoom:15}); else if(allBounds.length)map.setView(allBounds[0],14);

    const wrap=el.closest(".map-wrap");
    const buttons=wrap?wrap.querySelectorAll(".map-filter"):[];
    buttons.forEach(btn=>btn.addEventListener("click",()=>{
      const filter=btn.dataset.filter;
      buttons.forEach(b=>b.classList.toggle("active",b===btn));
      Object.entries(layers).forEach(([kind,layer])=>{
        const show=filter==="all"||filter===kind;
        if(show&&!map.hasLayer(layer))layer.addTo(map);
        if(!show&&map.hasLayer(layer))map.removeLayer(layer);
      });
      const visible=records.filter(x=>filter==="all"||x.kind===filter).map(x=>[Number(x.lat),Number(x.lng)]);
      if(visible.length>1)map.fitBounds(visible,{padding:[34,34],maxZoom:15});
      else if(visible.length===1)map.setView(visible[0],15);
    }));
    setTimeout(()=>map.invalidateSize(),250);
  });
});
