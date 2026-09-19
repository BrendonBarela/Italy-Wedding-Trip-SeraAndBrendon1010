(() => {
  "use strict";
  const currentPage = () => (window.location.pathname.split("/").pop() || "index.html").split("?")[0];

  const closeMobileMenu = () => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".mobile-nav-toggle");
    if (!header || !toggle) return;
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded","false");
    const label = toggle.querySelector(".mobile-nav-label");
    const icon = toggle.querySelector(".mobile-nav-icon");
    if (label) label.textContent = "Menu";
    if (icon) icon.textContent = "☰";
  };

  const compactNavigation = () => {
    const nav = document.getElementById("site-nav");
    if (!nav || nav.dataset.uxReady === "true") return;
    nav.dataset.uxReady = "true";
    nav.classList.add("ux-nav");
    nav.innerHTML = `
      <a class="ux-nav-link" href="index.html" data-page="index.html">Home</a>
      <a class="ux-nav-link ux-today-link" href="today.html" data-page="today.html">Today</a>
      <div class="ux-nav-group" data-pages="verona.html,parma.html,ispra.html,santa-margherita.html,nice.html">
        <button class="ux-nav-group-toggle" type="button" aria-expanded="false">Trip <span aria-hidden="true">⌄</span></button>
        <div class="ux-nav-menu">
          <a href="verona.html">Verona <small>Oct 1–4</small></a>
          <a href="parma.html">Parma <small>Oct 4–7</small></a>
          <a href="ispra.html">Ispra <small>Oct 7–11</small></a>
          <a href="santa-margherita.html">Santa Margherita <small>Oct 11–14</small></a>
          <a href="nice.html">French Riviera <small>Oct 14–18</small></a>
        </div>
      </div>
      <a class="ux-nav-link" href="wedding.html" data-page="wedding.html">Wedding</a>
      <a class="ux-nav-link" href="transportation.html" data-page="transportation.html">Transport</a>
      <a class="ux-nav-link" href="essentials.html" data-page="essentials.html">Essentials</a>
      <a class="ux-nav-link" href="contacts.html" data-page="contacts.html">Contacts</a>`;

    const page = currentPage();
    nav.querySelectorAll("[data-page]").forEach(link => {
      const active = link.dataset.page === page;
      link.classList.toggle("active",active);
      if (active) link.setAttribute("aria-current","page");
    });
    nav.querySelectorAll(".ux-nav-group").forEach(group => {
      if ((group.dataset.pages || "").split(",").includes(page)) group.classList.add("active");
    });

    const closeGroups = except => {
      nav.querySelectorAll(".ux-nav-group").forEach(group => {
        if (group === except) return;
        group.classList.remove("open");
        group.querySelector(".ux-nav-group-toggle")?.setAttribute("aria-expanded","false");
      });
    };
    nav.querySelectorAll(".ux-nav-group-toggle").forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault(); event.stopPropagation();
        const group = button.closest(".ux-nav-group");
        const open = !group.classList.contains("open");
        closeGroups(group);
        group.classList.toggle("open",open);
        button.setAttribute("aria-expanded",String(open));
      });
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click",()=>{closeGroups();closeMobileMenu();}));
    document.addEventListener("click",event=>{if(!nav.contains(event.target))closeGroups();});
  };

  const tripMode = () => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    document.body.classList.toggle("ux-trip-live",key >= "2026-10-01" && key <= "2026-10-18");
  };

  const destinationProgressiveDisclosure = () => {
    const layout = document.querySelector(".city-map-layout");
    if (!layout || layout.dataset.uxReady === "true") return;
    layout.dataset.uxReady = "true";
    layout.classList.add("ux-explore-section");
    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "ux-explore-toggle";
    reveal.setAttribute("aria-expanded","false");
    reveal.innerHTML = '<span>Explore nearby</span><small>Map, restaurants, groceries, sights & more</small><b aria-hidden="true">＋</b>';
    layout.parentNode.insertBefore(reveal,layout);
    const setOpen = open => {
      layout.classList.toggle("is-open",open);
      reveal.classList.toggle("is-open",open);
      reveal.setAttribute("aria-expanded",String(open));
      const icon = reveal.querySelector("b");
      if (icon) icon.textContent = open ? "−" : "＋";
      if (open) setTimeout(()=>window.dispatchEvent(new Event("resize")),80);
    };
    reveal.addEventListener("click",()=>setOpen(!layout.classList.contains("is-open")));
    document.querySelectorAll('a[href="#map"],a[href="#restaurants"]').forEach(link=>link.addEventListener("click",()=>setOpen(true)));
    if (["#map","#restaurants"].includes(window.location.hash)) setOpen(true);
  };




  document.addEventListener("DOMContentLoaded",()=>{
    compactNavigation();
    tripMode();
    destinationProgressiveDisclosure();
  });
})();
