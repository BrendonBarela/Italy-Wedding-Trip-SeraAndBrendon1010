
const menuButton=document.querySelector(".menu-toggle"),nav=document.querySelector("#site-nav");
if(menuButton&&nav){menuButton.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open))});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}));}

const tabs=[...document.querySelectorAll(".dest-tab")];
tabs.forEach(tab=>tab.addEventListener("click",()=>{tabs.forEach(t=>t.classList.toggle("active",t===tab));document.querySelectorAll(".dest-panel").forEach(p=>p.classList.toggle("active",p.id===tab.dataset.target));setTimeout(()=>{const m=window.tripMaps?.[tab.dataset.target];if(m)m.invalidateSize();},50)}));

window.tripMaps={};
async function geocode(q){
  const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&q="+encodeURIComponent(q);
  const r=await fetch(url,{headers:{"Accept":"application/json"}});
  if(!r.ok) throw new Error("geocode");
  const data=await r.json();
  if(!data.length) throw new Error("not found");
  return [Number(data[0].lat),Number(data[0].lon)];
}
async function initMap(el){
  if(typeof L==="undefined") return;
  const data=JSON.parse(el.dataset.map);
  const id=el.closest(".dest-panel").id;
  const map=L.map(el,{scrollWheelZoom:false});
  window.tripMaps[id]=map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
  const points=[];
  try{
    const home=await geocode(data.landmark.query);
    points.push(home);
    L.circleMarker(home,{radius:10,color:"#6f4e3d",fillColor:"#6f4e3d",fillOpacity:1,weight:2}).addTo(map).bindPopup("<strong>📍 "+data.landmark.name+"</strong><small>Privacy-safe landmark — not the lodging address.</small>");
    for(const r of data.restaurants){
      try{
        await new Promise(res=>setTimeout(res,350));
        const p=await geocode(r.query); points.push(p);
        L.circleMarker(p,{radius:8,color:"#b55d4c",fillColor:"#b55d4c",fillOpacity:1,weight:2}).addTo(map).bindPopup("<strong>🍽 "+r.name+"</strong>");
      }catch(e){}
    }
    if(points.length>1) map.fitBounds(points,{padding:[35,35],maxZoom:15}); else map.setView(home,14);
  }catch(e){
    map.setView([44.5,9.5],6);
    L.popup().setLatLng(map.getCenter()).setContent("Map pins could not load. Refresh when online.").openOn(map);
  }
}
document.querySelectorAll(".map").forEach(initMap);
