(() => {
  "use strict";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));

  const directions = address =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);

  const copyText = async text => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const area = document.createElement("textarea");
      area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
      document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
  };

  const renderStaySlot = (slot, stay) => {
    if (!stay) return;
    slot.classList.add("sb-private-card","is-unlocked");
    const extra = [].filter(Boolean)
      .map(x => `<div>${escapeHtml(x)}</div>`).join("");
    slot.innerHTML = `
      <div><strong>Lodging address</strong></div>
      <div style="margin-top:.35rem">${escapeHtml(stay.address)}</div>
      ${extra ? `<div style="margin-top:.35rem;font-size:.82rem">${extra}</div>` : ""}
      <div class="sb-private-actions">
        <a href="properties.html">All property listings</a>
        <a target="_blank" rel="noopener" href="${directions(stay.address)}">Directions home ↗</a>
        <button type="button" data-copy-address>Copy address</button>
      </div>`;
    slot.querySelector("[data-copy-address]")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      await copyText(stay.address);
      const old = button.textContent;
      button.textContent = "Copied ✓";
      setTimeout(() => button.textContent = old, 1600);
    });
  };


  document.addEventListener("DOMContentLoaded", () => {
    const trip = window.SB_TRIP;
    if (!trip) return;
    document.querySelectorAll("[data-private-stay]").forEach(slot => renderStaySlot(slot, trip.stays[slot.dataset.privateStay]));
    const date = new Intl.DateTimeFormat("en-CA", {timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    const day = trip.days[date] || trip.days[date < trip.start ? trip.start : trip.end];
    const stay = trip.stays[day.stayKey];
    document.querySelectorAll("[data-private-today]").forEach(slot => renderStaySlot(slot, stay));
    const address = document.getElementById("dashboard-address");
    if (address) address.textContent = stay.address;
    const link = document.getElementById("dashboard-directions-link");
    if (link) { link.href = directions(stay.address); link.target = "_blank"; link.rel = "noopener"; }
    try {sessionStorage.removeItem("sb-private-trip-session-v1");sessionStorage.removeItem("sb-private-trip-key-v1");} catch {}
  });
})();
