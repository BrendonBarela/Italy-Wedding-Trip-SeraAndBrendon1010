(() => {
  "use strict";
  const panels = [...document.querySelectorAll(".city-tab-panel")];
  const buttons = [...document.querySelectorAll("[data-city-tab]")];
  if (!panels.length || !buttons.length) return;

  const legacyAliases = {
    "options": ["things-to-do", "beaulieu"],
    "our-plan": ["things-to-do", "beaulieu"],
    "restaurants": ["eat"],
    "day-trips": ["daytrips", "riviera"],
    "getting-around": ["transport"],
    "transportation": ["transport"],
    "cheat-sheet": ["overview"],
    "eze": ["riviera"],
    "nice-day": ["riviera"],
    "home-base": ["beaulieu"]
  };

  const panelFor = raw => {
    if (!raw) return "overview";
    if (panels.some(p => p.id === raw)) return raw;
    const target = document.getElementById(raw);
    if (target) {
      const panel = target.closest(".city-tab-panel");
      if (panel) return panel.id;
    }
    for (const candidate of (legacyAliases[raw] || [])) {
      if (panels.some(p => p.id === candidate)) return candidate;
    }
    return "overview";
  };

  const show = (panelId, scrollTarget = null) => {
    const id = panelFor(panelId);
    panels.forEach(p => { p.hidden = p.id !== id; });
    buttons.forEach(b => {
      const active = b.dataset.cityTab === id;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (id === "map") setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    if (scrollTarget) {
      setTimeout(() => {
        const target = document.getElementById(scrollTarget) || document.getElementById(id);
        if (target) target.scrollIntoView({behavior:"smooth", block:"start"});
      }, 20);
    }
  };

  buttons.forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.cityTab;
    history.replaceState(null, "", "#" + id);
    show(id, id);
  }));

  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const raw = a.getAttribute("href").slice(1);
    if (!raw) return;
    const target = document.getElementById(raw);
    const panelId = panelFor(raw);
    if (target || panels.some(p => p.id === panelId)) {
      e.preventDefault();
      history.replaceState(null, "", "#" + raw);
      show(panelId, raw);
    }
  });

  const raw = location.hash.slice(1);
  show(panelFor(raw), raw || null);
})();