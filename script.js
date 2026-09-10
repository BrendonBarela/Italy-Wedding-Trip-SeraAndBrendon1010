
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

  if(typeof L==="undefined") return;
  const cacheKey="sb-map-geocache-v2";
  let cache={};
  try{cache=JSON.parse(localStorage.getItem(cacheKey)||"{}")}catch(e){}

  const geocode=async(query)=>{
    if(cache[query]) return cache[query];
    const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&q="+encodeURIComponent(query);
    const r=await fetch(url,{headers:{"Accept":"application/json"}});
    if(!r.ok) throw new Error("Geocoding failed");
    const j=await r.json();
    if(!j.length) return null;
    const result=[Number(j[0].lat),Number(j[0].lon)];
    cache[query]=result;
    try{localStorage.setItem(cacheKey,JSON.stringify(cache))}catch(e){}
    await new Promise(res=>setTimeout(res,1050));
    return result;
  };

  const colors={home:"#6f4e3d",food:"#a74632",station:"#315f74",sight:"#6d7b45"};
  const icon=(kind,label)=>L.divIcon({
    className:"map-pin-wrap",
    html:`<div class="map-pin ${kind}" title="${label.replace(/"/g,"&quot;")}">${kind==="food"?"🍴":kind==="station"?"🚆":kind==="sight"?"★":"♥"}</div>`,
    iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-30]
  });

  document.querySelectorAll(".city-map[data-map]").forEach(async(el)=>{
    let d; try{d=JSON.parse(el.dataset.map)}catch(e){return}
    const map=L.map(el,{scrollWheelZoom:false}).setView([45.5,9],12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
      maxZoom:19,attribution:'&copy; OpenStreetMap contributors'
    }).addTo(map);

    const items=[
      {kind:"home",...d.landmark,note:"Approximate stay area — exact lodging address kept private"},
      ...(d.restaurants||[]).map(x=>({kind:"food",...x,note:"Recommended restaurant"})),
      ...(d.station?[{kind:"station",...d.station,note:"Main transit point"}]:[]),
      ...(d.sights||[]).map(x=>({kind:"sight",...x}))
    ];
    const points=[];
    for(const item of items){
      try{
        const ll=await geocode(item.query);
        if(!ll) continue;
        points.push(ll);
        const mapsUrl="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(item.query);
        const popup=`<div class="map-popup"><strong>${item.name}</strong><span>${item.note||""}</span><a target="_blank" rel="noopener" href="${mapsUrl}">Directions ↗</a></div>`;
        L.marker(ll,{icon:icon(item.kind,item.name)}).addTo(map).bindPopup(popup);
      }catch(e){}
    }
    if(points.length) map.fitBounds(points,{padding:[30,30],maxZoom:15});
    setTimeout(()=>map.invalidateSize(),250);
  });
});
