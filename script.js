
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

  const maps=[...document.querySelectorAll(".city-map[data-map]")];
  if(!maps.length) return;

  const fail=(el,msg)=>{
    el.innerHTML=`<div class="map-error"><strong>Map unavailable</strong><span>${msg}</span></div>`;
  };

  if(!window.L){
    maps.forEach(el=>fail(el,"The map library did not load. Refresh the page or use the Directions links."));
    return;
  }

  const styles={
    stay:{color:"#fff",weight:3,fillColor:"#6f4e3d",fillOpacity:1,radius:10},
    food:{color:"#fff",weight:2,fillColor:"#b24e3a",fillOpacity:1,radius:8},
    station:{color:"#fff",weight:2,fillColor:"#315f74",fillOpacity:1,radius:8},
    sight:{color:"#fff",weight:2,fillColor:"#6d7b45",fillOpacity:1,radius:7}
  };

  function directions(q){
    return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
  }
  function popup(item,kind){
    const address=item.address||"";
    const q=address && !address.startsWith("Exact street") ? address : `${item.lat},${item.lng}`;
    return `<div class="map-popup"><strong>${item.name}</strong>${address?`<span>${address}</span>`:""}<a target="_blank" rel="noopener" href="${directions(q)}">Directions ↗</a></div>`;
  }

  maps.forEach(el=>{
    let d;
    try{ d=JSON.parse(el.dataset.map); }catch(e){ fail(el,"Map data could not be read."); return; }

    const map=L.map(el,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true});
    const tiles=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
      maxZoom:19,attribution:'&copy; OpenStreetMap contributors'
    }).addTo(map);

    let tileErrors=0;
    tiles.on("tileerror",()=>{
      tileErrors++;
      if(tileErrors===4){
        // The dots still render even if map tiles are temporarily unavailable.
        el.classList.add("tile-warning");
      }
    });

    const items=[
      {kind:"stay",...d.stay},
      ...(d.restaurants||[]).map(x=>({kind:"food",...x})),
      ...(d.station?[{kind:"station",...d.station}]:[]),
      ...(d.sights||[]).map(x=>({kind:"sight",...x}))
    ].filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng)));

    const bounds=[];
    items.forEach(item=>{
      const ll=[Number(item.lat),Number(item.lng)];
      bounds.push(ll);
      L.circleMarker(ll,styles[item.kind]).addTo(map).bindPopup(popup(item,item.kind));
    });

    if(bounds.length>1) map.fitBounds(bounds,{padding:[34,34],maxZoom:15});
    else if(bounds.length===1) map.setView(bounds[0],14);
    else fail(el,"No map coordinates were available.");

    setTimeout(()=>map.invalidateSize(),250);
  });
});
