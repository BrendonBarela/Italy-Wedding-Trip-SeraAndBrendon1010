(() => {
  "use strict";

  const STORAGE_KEY = "sb-private-budget-v1";
  let state = null;
  let saveTimer = null;

  const $ = sel => document.querySelector(sel);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));

  const money = (value,currency) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:2}).format(n);
  };

  const numberValue = value => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0,n) : null;
  };

  const clone = value => JSON.parse(JSON.stringify(value));

  const defaultsFromPrivateData = data => {
    const budget = data?.budget;
    if (!budget) return {version:1, fx:{eurToUsd:null}, items:[]};
    return clone(budget);
  };

  const calculate = () => {
    const items = state?.items || [];
    const sum = (field,currency) => items.reduce((total,item) => {
      const n = numberValue(item[field]);
      return item.currency === currency && n !== null ? total+n : total;
    },0);
    const knownShareUSD = sum("ourShare","USD");
    const knownShareEUR = sum("ourShare","EUR");
    const plannedUSD = sum("planned","USD");
    const plannedEUR = sum("planned","EUR");
    const needsSplit = items.filter(item => numberValue(item.bookingTotal)!==null && numberValue(item.ourShare)===null).length;
    return {knownShareUSD,knownShareEUR,plannedUSD,plannedEUR,needsSplit};
  };

  const summaryCard = (label,usd,eur) => `
    <article class="budget-summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${money(usd,"USD")}</strong>
      <small>${money(eur,"EUR")}</small>
    </article>`;

  const renderSummary = () => {
    const el=$("#budget-summary");
    if (!el || !state) return;
    const t=calculate();
    el.innerHTML = [
      summaryCard("Our known share",t.knownShareUSD,t.knownShareEUR),
      summaryCard("Planned budget",t.plannedUSD,t.plannedEUR),
      `<article class="budget-summary-card"><span>Needs a split</span><strong>${t.needsSplit}</strong><small>group/shared bookings</small></article>`
    ].join("");

    const rate = numberValue(state.fx?.eurToUsd);
    const combined = $("#combined-total");
    if (combined) {
      if (rate) {
        const actual = t.knownShareUSD + t.knownShareEUR*rate;
        const planned = t.plannedUSD + t.plannedEUR*rate;
        combined.innerHTML = `<strong>${money(actual,"USD")}</strong> known share • ${money(planned,"USD")} planned using €1 = $${rate.toFixed(4)}`;
      } else {
        combined.textContent = "Enter a planning exchange rate if you want a combined USD estimate.";
      }
    }
  };

  const rowHtml = item => `
    <article class="budget-row" data-id="${escapeHtml(item.id)}">
      <div class="budget-row-head">
        <div>
          <span class="budget-category">${escapeHtml(item.category || "Other")}</span>
          <input class="budget-item-name" data-field="item" value="${escapeHtml(item.item || "")}" aria-label="Budget item">
        </div>
        <button class="budget-delete" type="button" title="Remove item" aria-label="Remove ${escapeHtml(item.item || "item")}">×</button>
      </div>
      <div class="budget-grid">
        <label>Currency
          <select data-field="currency">
            <option value="USD"${item.currency==="USD"?" selected":""}>USD</option>
            <option value="EUR"${item.currency==="EUR"?" selected":""}>EUR</option>
          </select>
        </label>
        <label>Booking total
          <input inputmode="decimal" type="number" min="0" step="0.01" data-field="bookingTotal" value="${item.bookingTotal ?? ""}" placeholder="—">
        </label>
        <label>Our share
          <input inputmode="decimal" type="number" min="0" step="0.01" data-field="ourShare" value="${item.ourShare ?? ""}" placeholder="Needs split">
        </label>
        <label>Planned
          <input inputmode="decimal" type="number" min="0" step="0.01" data-field="planned" value="${item.planned ?? ""}" placeholder="Optional">
        </label>
      </div>
      <div class="budget-row-foot">
        <select data-field="category" aria-label="Category">
          ${["Flights","Lodging","Rail & transit","Rental car","Food & drinks","Activities","Wedding","Shopping","Other"].map(c=>`<option${item.category===c?" selected":""}>${c}</option>`).join("")}
        </select>
        <input data-field="note" value="${escapeHtml(item.note || "")}" placeholder="Private note">
        <span class="budget-status">${escapeHtml(item.status || "")}</span>
      </div>
    </article>`;

  const renderRows = () => {
    const list=$("#budget-items");
    if (!list || !state) return;
    list.innerHTML = (state.items || []).map(rowHtml).join("");
  };

  const showLocked = () => {
    $("#budget-locked")?.removeAttribute("hidden");
    $("#budget-app")?.setAttribute("hidden","");
    const unlock=$("#budget-unlock");
    if (unlock) {
      if (window.SBPrivateTrip?.isStandalone) {
        unlock.hidden=false;
        unlock.onclick=()=>window.SBPrivateTrip.unlock();
      } else {
        unlock.hidden=true;
        const note=$("#budget-lock-note");
        if (note) note.textContent="Budget is available only inside the installed app after Private Trip Mode is unlocked.";
      }
    }
  };

  const showUnlocked = async data => {
    $("#budget-locked")?.setAttribute("hidden","");
    $("#budget-app")?.removeAttribute("hidden");
    if (!state) {
      try { state = await window.SBPrivateTrip.decryptLocal(STORAGE_KEY); } catch {}
      if (!state) state = defaultsFromPrivateData(data);
    }
    renderRows();
    renderSummary();
    const rate=$("#eur-rate");
    if (rate) rate.value = state.fx?.eurToUsd ?? "";
  };

  const save = async () => {
    if (!state) return;
    try {
      await window.SBPrivateTrip.encryptLocal(STORAGE_KEY,state);
      const status=$("#budget-save-status");
      if (status) {
        status.textContent="Saved encrypted on this device ✓";
        clearTimeout(save.statusTimer);
        save.statusTimer=setTimeout(()=>status.textContent="",1800);
      }
    } catch {}
  };

  const queueSave = () => {
    clearTimeout(saveTimer);
    saveTimer=setTimeout(save,250);
  };

  const updateFromControl = control => {
    const row=control.closest(".budget-row");
    if (!row) return;
    const item=state.items.find(x=>x.id===row.dataset.id);
    if (!item) return;
    const field=control.dataset.field;
    if (["bookingTotal","ourShare","planned"].includes(field)) item[field]=numberValue(control.value);
    else item[field]=control.value;
    renderSummary();
    queueSave();
  };

  const addItem = () => {
    const id = "custom-" + Date.now().toString(36);
    state.items.push({id,category:"Other",item:"New expense",currency:"EUR",bookingTotal:null,ourShare:null,planned:null,status:"Private entry",note:""});
    renderRows();
    renderSummary();
    queueSave();
    document.querySelector(`[data-id="${id}"] .budget-item-name`)?.focus();
  };

  const reset = async () => {
    if (!confirm("Reset the budget to the confirmed/default starting entries? Your device-only edits will be replaced.")) return;
    state = defaultsFromPrivateData(window.SBPrivateTrip.getData());
    await save();
    renderRows(); renderSummary();
    const rate=$("#eur-rate"); if (rate) rate.value="";
  };

  const wire = () => {
    $("#budget-items")?.addEventListener("input",e=>{
      if (e.target.matches("[data-field]")) updateFromControl(e.target);
    });
    $("#budget-items")?.addEventListener("change",e=>{
      if (e.target.matches("[data-field]")) updateFromControl(e.target);
    });
    $("#budget-items")?.addEventListener("click",e=>{
      const button=e.target.closest(".budget-delete");
      if (!button) return;
      const row=button.closest(".budget-row");
      state.items=state.items.filter(x=>x.id!==row.dataset.id);
      renderRows(); renderSummary(); queueSave();
    });
    $("#add-budget-item")?.addEventListener("click",addItem);
    $("#reset-budget")?.addEventListener("click",reset);
    $("#eur-rate")?.addEventListener("input",e=>{
      state.fx = state.fx || {};
      state.fx.eurToUsd = numberValue(e.target.value);
      renderSummary(); queueSave();
    });
  };

  const init = async () => {
    wire();
    const data=window.SBPrivateTrip?.getData?.();
    if (window.SBPrivateTrip?.isStandalone && data) await showUnlocked(data);
    else showLocked();
  };

  document.addEventListener("sb:private-unlocked",event=>{ showUnlocked(event.detail).catch(()=>{}); });
  document.addEventListener("DOMContentLoaded",()=>{ init().catch(()=>showLocked()); });
})();