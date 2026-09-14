(() => {
  "use strict";

  const SESSION_KEY = "sb-private-trip-session-v1";
  const SESSION_CRYPTO_KEY = "sb-private-trip-key-v1";
  const DATA_URL = "./private-trip.enc";
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  let privateData = null;
  let privateKey = null;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));

  const directions = address =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);

  const injectStyles = () => {
    if (document.getElementById("sb-private-style")) return;
    const style = document.createElement("style");
    style.id = "sb-private-style";
    style.textContent = `
      .sb-private-bar{position:sticky;top:72px;z-index:80;margin:0 auto;width:min(1180px,calc(100% - 28px));display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border:1px solid #decabb;border-radius:0 0 14px 14px;background:#fff8f1;box-shadow:0 8px 22px rgba(63,48,40,.08);font:600 .82rem Inter,system-ui,sans-serif;color:#4f3c32}
      .sb-private-bar button,.sb-private-bar a,.sb-private-card button,.sb-private-modal button{border:0;border-radius:999px;padding:9px 12px;background:#6f4e3d;color:#fff;font:800 .78rem Inter,system-ui,sans-serif;cursor:pointer;text-decoration:none}
      .sb-private-bar.is-unlocked{background:#eef3ea;border-color:#c7d7bd}
      .sb-private-card{margin-top:.8rem;padding:.9rem 1rem;border:1px dashed #cdb8aa;border-radius:14px;background:#faf5f0;color:#65564e}
      .sb-private-card.is-unlocked{border-style:solid;border-color:#c7d7bd;background:#f3f7f0}
      .sb-private-card strong{color:#3f3028}
      .sb-private-actions{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.65rem}
      .sb-private-actions a,.sb-private-actions button{display:inline-flex;align-items:center;text-decoration:none;border:0;border-radius:999px;padding:.55rem .78rem;background:#6f4e3d;color:#fff!important;font:800 .76rem Inter,system-ui,sans-serif;cursor:pointer}
      .sb-private-actions button{background:#8a6a59}
      .sb-private-modal-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(30,20,16,.62);display:grid;place-items:center;padding:20px}
      .sb-private-modal{width:min(460px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.3);font-family:Inter,system-ui,sans-serif}
      .sb-private-modal h2{margin:.1rem 0 .5rem;font-family:'Cormorant Garamond',serif;font-size:2rem}
      .sb-private-modal p{color:#65564e;line-height:1.5}
      .sb-private-modal input{width:100%;box-sizing:border-box;margin:.7rem 0;padding:12px 13px;border:1px solid #cdb8aa;border-radius:12px;font:600 1rem Inter,system-ui,sans-serif}
      .sb-private-modal-actions{display:flex;justify-content:flex-end;gap:.6rem;margin-top:.4rem}
      .sb-private-modal .secondary{background:#eee3da;color:#5b4034}
      .sb-private-error{min-height:1.2em;color:#a13d32;font-size:.78rem;font-weight:700}
      [data-private-only][hidden]{display:none!important}
      @media(max-width:760px){.sb-private-bar{top:62px;width:calc(100% - 20px);font-size:.76rem}.sb-private-bar button{padding:8px 10px}}
    `;
    document.head.appendChild(style);
  };

  const decodeB64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

  const decryptPayload = async password => {
    const response = await fetch(DATA_URL, {cache:"no-store"});
    if (!response.ok) throw new Error("Private data file unavailable.");
    const envelope = await response.json();

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {name:"PBKDF2", salt:decodeB64(envelope.salt), iterations:envelope.iterations, hash:"SHA-256"},
      keyMaterial,
      {name:"AES-GCM", length:256},
      true,
      ["encrypt","decrypt"]
    );
    privateKey = key;
    try {
      const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
      sessionStorage.setItem(SESSION_CRYPTO_KEY, btoa(String.fromCharCode(...raw)));
    } catch {}

    const plaintext = await crypto.subtle.decrypt(
      {name:"AES-GCM", iv:decodeB64(envelope.iv)},
      key,
      decodeB64(envelope.data)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  };

  const restoreSessionKey = async () => {
    if (privateKey) return privateKey;
    try {
      const saved = sessionStorage.getItem(SESSION_CRYPTO_KEY);
      if (!saved) return null;
      privateKey = await crypto.subtle.importKey(
        "raw",
        decodeB64(saved),
        {name:"AES-GCM"},
        false,
        ["encrypt","decrypt"]
      );
      return privateKey;
    } catch { return null; }
  };

  const encodeB64 = bytes => btoa(String.fromCharCode(...bytes));

  const encryptLocal = async (storageKey, value) => {
    const key = privateKey || await restoreSessionKey();
    if (!key) throw new Error("Private Trip Mode must be unlocked.");
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(value));
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plaintext));
    localStorage.setItem(storageKey, JSON.stringify({v:1,iv:encodeB64(iv),data:encodeB64(encrypted)}));
  };

  const decryptLocal = async storageKey => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    const key = privateKey || await restoreSessionKey();
    if (!key) throw new Error("Private Trip Mode must be unlocked.");
    const envelope = JSON.parse(stored);
    const plaintext = await crypto.subtle.decrypt(
      {name:"AES-GCM",iv:decodeB64(envelope.iv)},
      key,
      decodeB64(envelope.data)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  };

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
    const extra = [stay.checkin, stay.checkout, stay.note].filter(Boolean)
      .map(x => `<div>${escapeHtml(x)}</div>`).join("");
    slot.innerHTML = `
      <div><strong>🔓 Exact private location</strong></div>
      <div style="margin-top:.35rem">${escapeHtml(stay.address)}</div>
      ${extra ? `<div style="margin-top:.35rem;font-size:.82rem">${extra}</div>` : ""}
      <div class="sb-private-actions">
        <a target="_blank" rel="noopener" href="${directions(stay.address)}">Directions home ↗</a>
        <button type="button" data-copy-address>Copy address</button>
      </div>`;
    slot.querySelector("[data-copy-address]")?.addEventListener("click", async event => {
      await copyText(stay.address);
      const button = event.currentTarget;
      const old = button.textContent;
      button.textContent = "Copied ✓";
      setTimeout(() => button.textContent = old, 1600);
    });
  };

  const renderLockedSlot = slot => {
    slot.classList.add("sb-private-card");
    slot.classList.remove("is-unlocked");
    slot.innerHTML = standalone
      ? `<strong>🔒 Exact location hidden</strong><div style="margin-top:.3rem">Unlock Private Trip Mode to see the address and Directions Home.</div>`
      : `<strong>🔒 Private app detail</strong><div style="margin-top:.3rem">Exact lodging location is available only in the installed app after unlocking.</div>`;
  };

  const currentDateKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  };

  const hydrate = data => {
    privateData = data;
    document.body.classList.add("sb-private-unlocked");

    document.querySelectorAll("[data-private-stay]").forEach(slot => {
      renderStaySlot(slot, data.stays?.[slot.dataset.privateStay]);
    });

    document.querySelectorAll("[data-private-today]").forEach(slot => {
      const date = currentDateKey();
      let key = data.dayStay?.[date];
      if (!key) key = date < "2026-10-01" ? "verona" : "beaulieu";
      renderStaySlot(slot, data.stays?.[key]);
    });

    document.querySelectorAll("[data-private-only]").forEach(el => { el.hidden = false; });

    document.dispatchEvent(new CustomEvent("sb:private-unlocked", {detail:data}));
  };

  const lock = () => {
    try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_CRYPTO_KEY); } catch {}
    location.reload();
  };

  const showUnlockDialog = () => {
    if (!standalone || document.getElementById("sb-private-modal")) return;
    const backdrop = document.createElement("div");
    backdrop.className = "sb-private-modal-backdrop";
    backdrop.id = "sb-private-modal";
    backdrop.innerHTML = `
      <form class="sb-private-modal">
        <p style="margin:0;font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6f4e3d">Installed app</p>
        <h2>Unlock Private Trip Mode</h2>
        <p>Private lodging locations are encrypted and stay hidden on the public website.</p>
        <input type="password" autocomplete="current-password" required autofocus aria-label="Private trip password" placeholder="Password">
        <div class="sb-private-error" aria-live="polite"></div>
        <div class="sb-private-modal-actions">
          <button class="secondary" type="button" data-cancel>Cancel</button>
          <button type="submit">Unlock</button>
        </div>
      </form>`;
    const form = backdrop.querySelector("form");
    const input = backdrop.querySelector("input");
    const error = backdrop.querySelector(".sb-private-error");
    const cancel = () => backdrop.remove();
    backdrop.querySelector("[data-cancel]").addEventListener("click", cancel);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) cancel(); });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      error.textContent = "";
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true; submit.textContent = "Unlocking…";
      try {
        const data = await decryptPayload(input.value);
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
        hydrate(data);
        backdrop.remove();
        updateBar();
      } catch {
        error.textContent = "That password did not unlock the private trip details.";
        submit.disabled = false; submit.textContent = "Unlock";
        input.select();
      }
    });

    document.body.appendChild(backdrop);
    setTimeout(() => input.focus(), 20);
  };

  const ensureBar = () => {
    if (!standalone || document.getElementById("sb-private-bar")) return;
    const bar = document.createElement("div");
    bar.className = "sb-private-bar";
    bar.id = "sb-private-bar";
    const header = document.querySelector(".site-header");
    if (header?.nextSibling) header.parentNode.insertBefore(bar, header.nextSibling);
    else document.body.prepend(bar);
    updateBar();
  };

  function updateBar() {
    const bar = document.getElementById("sb-private-bar");
    if (!bar) return;
    if (privateData) {
      bar.classList.add("is-unlocked");
      bar.innerHTML = `<span>🔓 <strong>Private Trip Mode</strong> — lodging + budget available</span><span style="display:flex;gap:.45rem;align-items:center"><a href="budget.html">Budget</a><button type="button">Lock</button></span>`;
      bar.querySelector("button").addEventListener("click", lock);
    } else {
      bar.classList.remove("is-unlocked");
      bar.innerHTML = `<span>🔐 <strong>Private Trip Mode</strong> — exact lodging locations hidden</span><button type="button">Unlock</button>`;
      bar.querySelector("button").addEventListener("click", showUnlockDialog);
    }
  }

  const init = async () => {
    injectStyles();

    document.querySelectorAll("[data-private-stay],[data-private-today]").forEach(renderLockedSlot);
    document.querySelectorAll("[data-private-only]").forEach(el => { el.hidden = true; });

    if (!standalone) return;

    await restoreSessionKey();
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) hydrate(JSON.parse(saved));
    } catch {}

    ensureBar();
  };

  document.addEventListener("DOMContentLoaded", () => { init().catch(()=>{}); });
  window.SBPrivateTrip = {
    unlock:showUnlockDialog,
    lock,
    isStandalone:standalone,
    isUnlocked:()=>Boolean(privateData),
    getData:()=>privateData,
    encryptLocal,
    decryptLocal
  };
})();